import { describe, expect, it } from 'vitest';
import { applyAutomaticQuestProgress, isObjectiveCompleted } from '../../src/shared/quests/checklist';
import { areaChecklists, areaDefinitions } from '../../src/shared/quests/data';

const essentialObjectiveIds = [
  'act1-clearfell-beira-cold-resistance',
  'act1-hunting-grounds-crowbell-passive',
  'act1-freythorn-king-spirit',
  'act1-ogham-farmlands-lute-passive',
  'act1-ogham-village-salvage-bench',
  'act1-ogham-manor-candlemass-life',
  'act2-keth-kabala-passive',
  'act2-valley-ancient-vows-choice',
  'act2-deshar-final-letter-passive',
  'act2-spires-garukhan-lightning-resistance',
  'act3-sandswept-marsh-campfire-jewelers-orb',
  'act3-jungle-ruins-silverfist-passive',
  'act3-venom-crypts-venom-draught-choice',
  'act3-azak-bog-ignagduk-spirit',
  'act3-machinarium-blackjaw-fire-resistance',
  'act3-molten-vault-mektul-reforge-bench',
  'act3-aggorat-sacrificial-heart-passive',
  'interlude-wolvenhold-oswin-passive',
  'interlude-khari-skullmaw-life',
  'interlude-khari-worm-scorpion-passive',
  'interlude-qimah-boon-choice',
  'interlude-kriar-lythara-spirit',
  'interlude-howling-caves-yeti-passive',
  'act4-abandoned-prison-goddess-justice',
  'act4-omniphobia-passive',
  'act4-blind-beast',
  'act4-great-white-one',
  'act4-navali-rest',
  'act4-trial-ancestors-complete'
];

describe('campaign quest data coverage', () => {
  it('keeps broad area detection coverage including interlude and act 4', () => {
    const acts = [...new Set(areaDefinitions.map((area) => area.act))].sort((left, right) => left - right);
    expect(acts).toEqual([0, 1, 2, 3, 4]);
  });

  it('has one checklist for every campaign area, even when the area has no essential objective', () => {
    const checklistAreaIds = new Set(areaChecklists.map((checklist) => checklist.areaId));
    const missing = areaDefinitions.filter((area) => !checklistAreaIds.has(area.id)).map((area) => area.id);

    expect(missing).toEqual([]);
  });

  it('displays only the supplied 0.5.0 essential reward/unlock checklist', () => {
    const objectiveIds = areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.id)).sort();
    expect(objectiveIds).toEqual([...essentialObjectiveIds].sort());
  });

  it('keeps all displayed objectives required and Korean reward-focused', () => {
    const objectives = areaChecklists.flatMap((checklist) => checklist.objectives);
    const labels = objectives.map((objective) => objective.labelKo).join('\n');

    expect(objectives.every((objective) => objective.kind === 'required')).toBe(true);
    expect(objectives.every((objective) => objective.needsVerification === true)).toBe(true);
    for (const expected of ['냉기 저항 +10%', '번개 저항 +10%', '화염 저항 +10%', '정신력 +30', '정신력 40', '패시브 스킬 2포인트', '분해 작업대', '제련 작업대', '최대 생명력 5%', '최대 마나 5%', '상위 빈 룬']) {
      expect(labels).toContain(expected);
    }
  });

  it('keeps previously noisy side/optional quest labels out of the HUD dataset', () => {
    const labels = areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.labelKo)).join('\n');

    for (const skipped of ['타바카이', '부족의 의술', '심연', '외딴 초소', '사이렌 진주', '와카파누 섬', '오리아스 공성전', '에조미어인 모집']) {
      expect(labels).not.toContain(skipped);
    }
  });

  it('does not mark quests complete just because the current area is later', () => {
    const progressAtAct4 = applyAutomaticQuestProgress(areaDefinitions, areaChecklists, { completedObjectiveIds: {} }, 'act4-kingsmarch');

    expect(isObjectiveCompleted(progressAtAct4, 'act1-clearfell', 'act1-clearfell-beira-cold-resistance')).toBe(false);
    expect(isObjectiveCompleted(progressAtAct4, 'act2-spires-of-deshar', 'act2-spires-garukhan-lightning-resistance')).toBe(false);
    expect(isObjectiveCompleted(progressAtAct4, 'act3-aggorat', 'act3-aggorat-sacrificial-heart-passive')).toBe(false);
  });
});
