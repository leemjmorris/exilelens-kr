import { describe, expect, it } from 'vitest';
import { applyAutomaticQuestProgress, isObjectiveCompleted } from '../../src/shared/quests/checklist';
import { areaChecklists, areaDefinitions } from '../../src/shared/quests/data';

describe('campaign quest data coverage', () => {
  it('contains all campaign act groups including interlude and act 4', () => {
    const acts = [...new Set(areaDefinitions.map((area) => area.act))].sort((left, right) => left - right);

    expect(acts).toEqual([0, 1, 2, 3, 4]);
  });

  it('has one checklist for every campaign area', () => {
    const checklistAreaIds = new Set(areaChecklists.map((checklist) => checklist.areaId));
    const missing = areaDefinitions.filter((area) => !checklistAreaIds.has(area.id)).map((area) => area.id);

    expect(missing).toEqual([]);
  });

  it('links a substantial set of act, interlude, and act 4 quest objectives', () => {
    const objectives = areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => ({ ...objective, areaId: checklist.areaId })));
    const objectiveIds = objectives.map((objective) => objective.id);

    expect(objectives.length).toBeGreaterThanOrEqual(80);
    expect(objectiveIds).toContain('interlude-recruit-ezomytes');
    expect(objectiveIds).toContain('interlude-recruit-maraketh');
    expect(objectiveIds).toContain('interlude-recruit-vaal');
    expect(objectiveIds).toContain('act4-search-start');
    expect(objectiveIds).toContain('act4-siege-of-oriath-refuge');
    expect(objectiveIds).toContain('act3-legacy-black-chambers');
    expect(objectiveIds).toContain('act2-dreadnought-jamanra');
  });

  it('orders campaign data so automatic completion treats interludes before act 4', () => {
    const interludeIndex = areaDefinitions.findIndex((area) => area.id === 'interlude-ezomytes');
    const act4Index = areaDefinitions.findIndex((area) => area.id === 'act4-kingsmarch');

    expect(interludeIndex).toBeGreaterThan(-1);
    expect(act4Index).toBeGreaterThan(-1);
    expect(interludeIndex).toBeLessThan(act4Index);
  });

  it('uses official Korean server quest names for newly wired act and interlude labels', () => {
    const labels = areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.labelKo));
    const joined = labels.join('\n');

    for (const expectedName of [
      '통행의 자격',
      '돌의 왕관',
      '상아 도둑',
      '일곱 갈래 물의 도시',
      '힘의 상승',
      '바알의 유산',
      '기어가는 망자',
      '혼돈의 시련',
      '웃자알의 보물',
      '부족의 복수',
      '탐색',
      '어둑한 안개',
      '혈족의 땅',
      '때까치 섬',
      '와카파누 섬',
      '선조들의 심판',
      '오리아스 공성전',
      '에조미어인 모집',
      '마라케스인 모집',
      '바알인 모집',
      '눈먼 짐승',
      '사이렌 진주',
      '상위 빈 룬',
      '타바카이 따라가기',
      '부족의 의술'
    ]) {
      expect(joined).toContain(expectedName);
    }

    for (const englishQuestName of [
      'Earning Passage',
      'A Crown of Stone',
      'A Theft of Ivory',
      'Legacy of the Vaal',
      'The Slithering Dead',
      'The Search',
      'Dark Mists',
      'Land of the Kin',
      'Recruit the Ezomytes'
    ]) {
      expect(joined).not.toContain(englishQuestName);
    }
  });

  it('shows all current Abandoned Prison objectives split into required and optional buckets', () => {
    const checklist = areaChecklists.find((entry) => entry.areaId === 'act4-abandoned-prison');

    expect(checklist).toBeDefined();
    expect(checklist?.objectives.map((objective) => objective.labelKo)).toEqual([
      '포로: 독방 감금실에서 포로 쓰러뜨리기',
      '잊혀진 감방: 감방 objective 확인',
      '병기 창고: 병기 창고 objective 확인',
      '정의의 여신: 플라스크 생명력 또는 마나 회복 30% 영구 보상 선택'
    ]);
    expect(checklist?.objectives.filter((objective) => objective.kind === 'required').map((objective) => objective.id)).toEqual([
      'act4-abandoned-prison-goddess-justice'
    ]);
    expect(checklist?.objectives.filter((objective) => objective.kind === 'optional').map((objective) => objective.id)).toEqual([
      'act4-abandoned-prison-prisoner',
      'act4-abandoned-prison-forgotten-cell',
      'act4-abandoned-prison-armoury'
    ]);
  });

  it('covers 0.5.0 must-do permanent reward and unlock objectives from poe2db quest tables', () => {
    const requiredObjectiveIds = new Set(
      areaChecklists.flatMap((checklist) => checklist.objectives.filter((objective) => objective.kind === 'required').map((objective) => objective.id))
    );

    for (const expectedId of [
      'act1-clearfell-beira',
      'act1-hunting-grounds-crowbell-passive',
      'act1-freythorn-ominous-altars',
      'act1-ogham-farmlands-lost-lute',
      'act1-ogham-village-forge',
      'act1-ogham-manor-candlemass-life',
      'act2-ancient-vows-medallion',
      'act2-traditions-toll-final-letter',
      'act2-spires-garukhan-lightning',
      'act3-jungle-ruins-silverfist-passive',
      'act3-tribal-vengeance-ignagduk',
      'act3-machinarium-blackjaw-fire',
      'act3-treasures-utzaal-mektul',
      'act3-aggorat-sacrificial-heart',
      'act4-abandoned-prison-goddess-justice',
      'act4-omniphobia-passive',
      'act4-blind-beast',
      'act4-great-white-one',
      'act4-navali-rest',
      'act4-trial-ancestors-complete',
      'interlude-wolvenhold-oswin-passive',
      'interlude-khari-skullmaw-life',
      'interlude-khari-worm-scorpion-passive',
      'interlude-qimah-boon-choice',
      'interlude-kriar-lythara-spirit',
      'interlude-howling-caves-yeti-passive'
    ]) {
      expect(requiredObjectiveIds).toContain(expectedId);
    }
  });

  it('does not mark newly wired act and interlude quests complete just because the current area is later', () => {
    const progressAtAct4 = applyAutomaticQuestProgress(areaDefinitions, areaChecklists, { completedObjectiveIds: {} }, 'act4-kingsmarch');

    expect(isObjectiveCompleted(progressAtAct4, 'act2-vastiri-outskirts', 'act2-earning-passage-rathbreaker')).toBe(false);
    expect(isObjectiveCompleted(progressAtAct4, 'act3-black-chambers', 'act3-legacy-black-chambers')).toBe(false);
    expect(isObjectiveCompleted(progressAtAct4, 'interlude-ezomytes', 'interlude-recruit-ezomytes')).toBe(false);
    expect(isObjectiveCompleted(progressAtAct4, 'act4-kingsmarch', 'act4-search-start')).toBe(false);
  });

  it('keeps all new sourced quest objectives marked as needing Korean verification', () => {
    const unverifiedMissing = areaChecklists.flatMap((checklist) =>
      checklist.objectives.filter((objective) => objective.needsVerification !== true).map((objective) => objective.id)
    );

    expect(unverifiedMissing).toEqual([]);
  });
});
