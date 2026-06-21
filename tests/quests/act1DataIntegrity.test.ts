import { describe, expect, it } from 'vitest';
import { act1Areas, act1Checklists } from '../../src/shared/quests/data/act1';
import { groupChecklistObjectives } from '../../src/shared/quests/checklist';

describe('Act 1 quest seed data integrity', () => {
  it('uses unique area ids', () => {
    const ids = act1Areas.map((area) => area.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has checklists only for existing areas', () => {
    const areaIds = new Set(act1Areas.map((area) => area.id));

    for (const checklist of act1Checklists) {
      expect(areaIds.has(checklist.areaId), `${checklist.areaId} should exist in act1Areas`).toBe(true);
    }
  });

  it('uses unique objective ids across Act 1', () => {
    const objectiveIds = act1Checklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.id));

    expect(new Set(objectiveIds).size).toBe(objectiveIds.length);
  });

  it('links each area guide step id to an objective in the same area checklist', () => {
    const checklistByAreaId = new Map(act1Checklists.map((checklist) => [checklist.areaId, checklist]));

    for (const area of act1Areas) {
      const objectiveIds = new Set(checklistByAreaId.get(area.id)?.objectives.map((objective) => objective.id) ?? []);

      for (const guideStepId of area.guideStepIds) {
        expect(objectiveIds.has(guideStepId), `${area.id} guide step ${guideStepId} should exist`).toBe(true);
      }
    }
  });

  it('contains Act 1 Client.txt areaId aliases from open-source overlay research', () => {
    const expectedAliases: Record<string, string> = {
      g1_1: 'act1-riverbank',
      g1_town: 'act1-clearfell-encampment',
      g1_2: 'act1-clearfell',
      g1_3: 'act1-mud-burrow',
      g1_4: 'act1-grelwood',
      g1_5: 'act1-red-vale',
      g1_6: 'act1-grim-tangle',
      g1_7: 'act1-cemetery-of-the-eternals',
      g1_8: 'act1-mausoleum-of-the-praetor',
      g1_9: 'act1-tomb-of-the-consort',
      g1_11: 'act1-hunting-grounds',
      g1_12: 'act1-freythorn',
      g1_13_1: 'act1-ogham-farmlands',
      g1_13_2: 'act1-ogham-village',
      g1_14: 'act1-manor-ramparts',
      g1_15: 'act1-ogham-manor'
    };

    for (const [alias, areaId] of Object.entries(expectedAliases)) {
      const area = act1Areas.find((candidate) => candidate.id === areaId);
      expect(area?.areaIdAliases, `${areaId} should include ${alias}`).toContain(alias);
    }
  });

  it('keeps user-facing Act 1 checklist labels localized to Korean official names where sourced', () => {
    const labels = act1Checklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.labelKo));
    const forbiddenEnglishFragments = [
      'Beira of the Rotten Pack',
      'The Bloated Miller',
      'Treacherous Ground',
      'The Devourer',
      'Secrets in the Dark',
      'The Mysterious Shade',
      'Sorrow Among Stones',
      'The Trail of Corruption',
      'The Hunt Begins',
      'Ominous Altars',
      'The Lost Lute',
      'Finding the Forge',
      'The Mad Wolf of Ogham',
      'Count Geonor'
    ];

    for (const fragment of forbiddenEnglishFragments) {
      expect(labels.some((label) => label.includes(fragment)), `${fragment} should not appear in Korean labels`).toBe(false);
    }
  });

  it('contains both required and optional Act 1 objective groups', () => {
    const grouped = groupChecklistObjectives(act1Checklists.flatMap((checklist) => checklist.objectives));

    expect(grouped.required.length).toBeGreaterThan(0);
    expect(grouped.optional.length).toBeGreaterThan(0);
  });
});
