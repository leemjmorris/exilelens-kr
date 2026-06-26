import { describe, expect, it } from 'vitest';
import { areaChecklists, areaDefinitions } from '../../src/shared/quests/data';

const essentialObjectiveIds = [
  // Act 1 normal must-do rewards from the 0.5.0 essential quest guide.
  'act1-clearfell-beira-cold-resistance',
  'act1-hunting-grounds-crowbell-passive',
  'act1-freythorn-king-spirit',
  'act1-ogham-farmlands-lute-passive',
  'act1-ogham-village-salvage-bench',
  'act1-ogham-manor-candlemass-life',

  // Act 2 normal must-do rewards.
  'act2-keth-kabala-passive',
  'act2-valley-ancient-vows-choice',
  'act2-deshar-final-letter-passive',
  'act2-spires-garukhan-lightning-resistance',

  // Act 3 normal must-do rewards/unlocks.
  'act3-sandswept-marsh-campfire-jewelers-orb',
  'act3-jungle-ruins-silverfist-passive',
  'act3-venom-crypts-venom-draught-choice',
  'act3-azak-bog-ignagduk-spirit',
  'act3-machinarium-blackjaw-fire-resistance',
  'act3-molten-vault-mektul-reforge-bench',
  'act3-aggorat-sacrificial-heart-passive'
] as const;

const allowedObjectiveIds = new Set<string>(essentialObjectiveIds);

const skippedQuestNameFragments = [
  '타바카이',
  '부족의 의술',
  '심연',
  '외딴 초소',
  '잊힌 하사품',
  '사이렌 진주',
  '와카파누 섬',
  '선조들의 심판',
  '유토피아',
  '오리아스 공성전',
  '에조미어인 모집',
  '마라케스인 모집',
  '바알인 모집'
];

describe('0.5.0 essential quest dataset', () => {
  it('contains only the must-do permanent reward and unlock objectives from the supplied 0.5.0 guide', () => {
    const actualIds = areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.id)).sort();

    expect(actualIds).toEqual([...essentialObjectiveIds].sort());
  });

  it('marks every displayed objective as required and verified by the essential-guide policy', () => {
    const objectives = areaChecklists.flatMap((checklist) => checklist.objectives);

    expect(objectives).toHaveLength(essentialObjectiveIds.length);
    expect(objectives.every((objective) => objective.kind === 'required')).toBe(true);
    expect(objectives.every((objective) => objective.needsVerification === true)).toBe(true);
  });

  it('keeps optional/skippable quest names out of the overlay dataset', () => {
    const labels = areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.labelKo)).join('\n');

    for (const fragment of skippedQuestNameFragments) {
      expect(labels).not.toContain(fragment);
    }
  });

  it('keeps area definitions broad enough for Client.txt matching but allows many areas to have empty checklists', () => {
    const checklistAreaIds = new Set(areaChecklists.map((checklist) => checklist.areaId));
    const missingAreaIds = areaDefinitions.filter((area) => !checklistAreaIds.has(area.id)).map((area) => area.id);

    expect(missingAreaIds).toEqual([]);
    expect(areaDefinitions.length).toBeGreaterThan(essentialObjectiveIds.length);
  });

  it('does not accidentally carry legacy objective ids from the previous all-quests dataset', () => {
    const objectiveIds = new Set(areaChecklists.flatMap((checklist) => checklist.objectives.map((objective) => objective.id)));

    for (const objectiveId of objectiveIds) {
      expect(allowedObjectiveIds.has(objectiveId)).toBe(true);
    }
  });
});
