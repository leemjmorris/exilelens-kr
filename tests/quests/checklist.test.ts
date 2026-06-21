import { describe, expect, it } from 'vitest';
import {
  applyAutomaticQuestProgress,
  groupChecklistObjectives,
  isObjectiveCompleted,
  normalizeManualQuestProgress,
  toggleObjectiveCompletion,
  type AreaChecklist
} from '../../src/shared/quests/checklist';

const checklist: AreaChecklist = {
  areaId: 'act1-clearfell',
  objectives: [
    { id: 'main', labelKo: '주요 목표', kind: 'required', needsVerification: true },
    { id: 'side', labelKo: '선택 목표', kind: 'optional', needsVerification: true }
  ]
};

describe('checklist utilities', () => {
  it('groups required and optional objectives while preserving order', () => {
    expect(groupChecklistObjectives(checklist.objectives)).toEqual({
      required: [checklist.objectives[0]],
      optional: [checklist.objectives[1]]
    });
  });

  it('toggles an objective complete and then active again without removing the manual override', () => {
    const initial = { completedObjectiveIds: {} };

    const completed = toggleObjectiveCompletion(initial, 'act1-clearfell', 'main');
    expect(isObjectiveCompleted(completed, 'act1-clearfell', 'main')).toBe(true);
    expect(completed.manualObjectiveStates?.['act1-clearfell']?.main).toBe(true);

    const reactivated = toggleObjectiveCompletion(completed, 'act1-clearfell', 'main');
    expect(isObjectiveCompleted(reactivated, 'act1-clearfell', 'main')).toBe(false);
    expect(reactivated.completedObjectiveIds['act1-clearfell']).toEqual([]);
    expect(reactivated.manualObjectiveStates?.['act1-clearfell']?.main).toBe(false);
  });

  it('does not auto-complete objectives from the current or furthest campaign area', () => {
    const areas = [
      { id: 'act1-clearfell', act: 1, nameKo: '클리어펠' },
      { id: 'act1-grelwood', act: 1, nameKo: '그렐우드' },
      { id: 'act1-red-vale', act: 1, nameKo: '붉은 계곡' }
    ];
    const checklists: AreaChecklist[] = [
      checklist,
      { areaId: 'act1-grelwood', objectives: [{ id: 'grelwood-main', labelKo: '그렐우드 목표', kind: 'required' }] },
      { areaId: 'act1-red-vale', objectives: [{ id: 'red-vale-main', labelKo: '붉은 계곡 목표', kind: 'required' }] }
    ];

    const progress = applyAutomaticQuestProgress(areas, checklists, { completedObjectiveIds: {} }, 'act1-red-vale');

    expect(progress.completedObjectiveIds).toEqual({});
    expect(isObjectiveCompleted(progress, 'act1-clearfell', 'main')).toBe(false);
    expect(isObjectiveCompleted(progress, 'act1-grelwood', 'grelwood-main')).toBe(false);
  });

  it('keeps manual completion decisions when normalization runs', () => {
    const manuallyCompleted = toggleObjectiveCompletion({ completedObjectiveIds: {} }, 'act1-clearfell', 'main');
    const normalized = normalizeManualQuestProgress(manuallyCompleted);

    expect(isObjectiveCompleted(normalized, 'act1-clearfell', 'main')).toBe(true);
    expect(normalized.manualObjectiveStates?.['act1-clearfell']?.main).toBe(true);
  });

  it('removes old area-inferred completed ids that do not have manual true evidence', () => {
    const normalized = normalizeManualQuestProgress({
      completedObjectiveIds: {
        'act3-utzaal': ['act3-legacy-utzaal', 'act3-treasures-utzaal']
      },
      manualObjectiveStates: {
        'act3-utzaal': {
          'act3-legacy-utzaal': true,
          'act3-treasures-utzaal': false
        }
      }
    });

    expect(normalized.completedObjectiveIds['act3-utzaal']).toEqual(['act3-legacy-utzaal']);
    expect(isObjectiveCompleted(normalized, 'act3-utzaal', 'act3-treasures-utzaal')).toBe(false);
  });
});
