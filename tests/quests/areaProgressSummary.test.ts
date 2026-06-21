import { describe, expect, it } from 'vitest';
import { buildAreaProgressGroups, type AreaChecklist, type AreaProgressSourceArea, type QuestProgress } from '../../src/shared/quests/checklist';

const areas: AreaProgressSourceArea[] = [
  { id: 'act1-a', act: 1, nameKo: '1장 지역', needsVerification: true },
  { id: 'act2-a', act: 2, nameKo: '2장 지역' },
  { id: 'interlude-a', act: 0, nameKo: '막간' }
];

const checklists: AreaChecklist[] = [
  {
    areaId: 'act1-a',
    objectives: [
      { id: 'required-1', labelKo: '필수 1', kind: 'required' },
      { id: 'optional-1', labelKo: '선택 1', kind: 'optional' }
    ]
  },
  {
    areaId: 'interlude-a',
    needsVerification: true,
    objectives: [{ id: 'interlude-1', labelKo: '막간 확인', kind: 'required', needsVerification: true }]
  }
];

const progress: QuestProgress = {
  completedObjectiveIds: {},
  manualObjectiveStates: {
    'act1-a': {
      'required-1': true
    },
    'interlude-a': {}
  }
};

describe('buildAreaProgressGroups', () => {
  it('summarizes completed and incomplete objectives for every area including interlude', () => {
    const groups = buildAreaProgressGroups(areas, checklists, progress, 'act2-a');

    expect(groups.map((group) => group.act)).toEqual([1, 2, 0]);
    expect(groups[0].areas[0]).toMatchObject({
      areaId: 'act1-a',
      areaNameKo: '1장 지역',
      totalObjectives: 2,
      needsVerification: true
    });
    expect(groups[0].areas[0].completedObjectives.map((objective) => objective.id)).toEqual(['required-1']);
    expect(groups[0].areas[0].incompleteObjectives.map((objective) => objective.id)).toEqual(['optional-1']);
    expect(groups[1].areas[0]).toMatchObject({ areaId: 'act2-a', totalObjectives: 0, isCurrentArea: true });
    expect(groups[2].areas[0]).toMatchObject({ areaId: 'interlude-a', areaNameKo: '막간', totalObjectives: 1 });
  });
});
