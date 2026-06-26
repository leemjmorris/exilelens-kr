import { describe, expect, it } from 'vitest';
import { groupChecklistObjectives } from '../../src/shared/quests/checklist';
import { act1Areas, act1Checklists } from '../../src/shared/quests/data/act1';

const essentialAct1ObjectiveIds = [
  'act1-clearfell-beira-cold-resistance',
  'act1-hunting-grounds-crowbell-passive',
  'act1-freythorn-king-spirit',
  'act1-ogham-farmlands-lute-passive',
  'act1-ogham-village-salvage-bench',
  'act1-ogham-manor-candlemass-life'
];

describe('Act 1 essential quest seed data integrity', () => {
  it('uses unique area ids', () => {
    const ids = act1Areas.map((area) => area.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has one checklist for every Act 1 area so non-essential areas render empty instead of falling back', () => {
    expect(act1Checklists.map((checklist) => checklist.areaId).sort()).toEqual(act1Areas.map((area) => area.id).sort());
  });

  it('contains only Act 1 must-do reward/unlock objectives from the supplied 0.5.0 guide', () => {
    const objectiveIds = act1Checklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.id)).sort();
    expect(objectiveIds).toEqual([...essentialAct1ObjectiveIds].sort());
  });

  it('marks all displayed Act 1 objectives as required', () => {
    const grouped = groupChecklistObjectives(act1Checklists.flatMap((checklist) => checklist.objectives));
    expect(grouped.required.map((objective) => objective.id).sort()).toEqual([...essentialAct1ObjectiveIds].sort());
    expect(grouped.optional).toEqual([]);
  });

  it('contains Act 1 Client.txt areaId aliases from open-source overlay research', () => {
    const aliasByArea = new Map(act1Areas.map((area) => [area.id, area.areaIdAliases ?? []]));

    expect(aliasByArea.get('act1-riverbank')).toContain('g1_1');
    expect(aliasByArea.get('act1-clearfell')).toContain('g1_2');
    expect(aliasByArea.get('act1-ogham-manor')).toContain('g1_15');
  });

  it('keeps essential Act 1 labels localized and focused on rewards', () => {
    const labels = act1Checklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.labelKo)).join('\n');

    for (const expected of ['냉기 저항 +10%', '패시브 스킬 2포인트', '정신력 +30', '분해 작업대', '생명력 최대치 +20']) {
      expect(labels).toContain(expected);
    }
    for (const skipped of ['땅에 생긴 균열', '오검의 미친 늑대', '타락의 흔적']) {
      expect(labels).not.toContain(skipped);
    }
  });
});
