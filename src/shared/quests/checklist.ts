export type ChecklistObjectiveKind = 'required' | 'optional';

export interface ChecklistObjective {
  id: string;
  labelKo: string;
  kind: ChecklistObjectiveKind;
  notesKo?: string;
  needsVerification?: boolean;
}

export interface AreaChecklist {
  areaId: string;
  objectives: ChecklistObjective[];
  needsVerification?: boolean;
}

export interface QuestProgress {
  /**
   * Completed objectives are derived only from trusted completion sources:
   * - explicit user clicks/manual overrides
   * - future reliable quest-completion signals, if the game exposes them
   *
   * Do not infer completion from current area or furthest reached area. Area position is only
   * useful for "what should I do here?", not for "what did I actually complete?".
   */
  completedObjectiveIds: Record<string, string[]>;
  /**
   * Manual user decisions are the current source of truth.
   * true = completed, false = incomplete.
   */
  manualObjectiveStates?: Record<string, Record<string, boolean>>;
}

export interface GroupedChecklistObjectives {
  required: ChecklistObjective[];
  optional: ChecklistObjective[];
}

export interface AreaProgressSummary {
  areaId: string;
  act: number;
  areaNameKo: string;
  areaNameEn?: string;
  isCurrentArea: boolean;
  totalObjectives: number;
  completedObjectives: ChecklistObjective[];
  incompleteObjectives: ChecklistObjective[];
  needsVerification: boolean;
}

export interface AreaProgressGroup {
  act: number;
  areas: AreaProgressSummary[];
}

export interface AreaProgressSourceArea {
  id: string;
  act: number;
  nameKo: string;
  nameEn?: string;
  needsVerification?: boolean;
}

export function groupChecklistObjectives(objectives: ChecklistObjective[]): GroupedChecklistObjectives {
  return {
    required: objectives.filter((objective) => objective.kind === 'required'),
    optional: objectives.filter((objective) => objective.kind === 'optional')
  };
}

export function isObjectiveCompleted(progress: QuestProgress, areaId: string, objectiveId: string): boolean {
  return progress.completedObjectiveIds[areaId]?.includes(objectiveId) ?? false;
}

export function toggleObjectiveCompletion(progress: QuestProgress, areaId: string, objectiveId: string): QuestProgress {
  const nextCompleted = !isObjectiveCompleted(progress, areaId, objectiveId);
  const nextManualStates = {
    ...(progress.manualObjectiveStates ?? {}),
    [areaId]: {
      ...(progress.manualObjectiveStates?.[areaId] ?? {}),
      [objectiveId]: nextCompleted
    }
  };

  return normalizeManualQuestProgress({
    ...progress,
    manualObjectiveStates: nextManualStates
  });
}

/**
 * Migration/safety guard: completion must not come from area progression.
 * Existing versions wrote many inferred completions into completedObjectiveIds. This function
 * rebuilds completedObjectiveIds from explicit manual true values only, preserving manual false
 * overrides as incomplete.
 */
export function normalizeManualQuestProgress(progress: QuestProgress): QuestProgress {
  const manualObjectiveStates = cloneManualObjectiveStates(progress.manualObjectiveStates) ?? {};
  const completedObjectiveIds: Record<string, string[]> = {};

  for (const [areaId, objectiveStates] of Object.entries(manualObjectiveStates)) {
    const completedIds = Object.entries(objectiveStates)
      .filter(([, completed]) => completed === true)
      .map(([objectiveId]) => objectiveId);
    completedObjectiveIds[areaId] = completedIds;
  }

  return {
    completedObjectiveIds,
    manualObjectiveStates
  };
}

/**
 * Deprecated compatibility shim.
 * Kept so older call sites/tests fail safe: area/current-position must never auto-complete quests.
 */
export function applyAutomaticQuestProgress(
  _areas: AreaProgressSourceArea[],
  _checklists: AreaChecklist[],
  progress: QuestProgress,
  _currentAreaId: string | undefined
): QuestProgress {
  return normalizeManualQuestProgress(progress);
}

export function buildAreaProgressGroups(
  areas: AreaProgressSourceArea[],
  checklists: AreaChecklist[],
  progress: QuestProgress,
  currentAreaId: string | undefined
): AreaProgressGroup[] {
  const checklistByArea = new Map(checklists.map((checklist) => [checklist.areaId, checklist]));
  const normalizedProgress = normalizeManualQuestProgress(progress);
  const summaries = areas.map((area): AreaProgressSummary => {
    const checklist = checklistByArea.get(area.id);
    const objectives = checklist?.objectives ?? [];
    const completedObjectives = objectives.filter((objective) => isObjectiveCompleted(normalizedProgress, area.id, objective.id));
    const incompleteObjectives = objectives.filter((objective) => !isObjectiveCompleted(normalizedProgress, area.id, objective.id));

    return {
      areaId: area.id,
      act: area.act,
      areaNameKo: area.nameKo,
      areaNameEn: area.nameEn,
      isCurrentArea: area.id === currentAreaId,
      totalObjectives: objectives.length,
      completedObjectives,
      incompleteObjectives,
      needsVerification: area.needsVerification === true || checklist?.needsVerification === true || objectives.some((objective) => objective.needsVerification === true)
    };
  });

  const groups = new Map<number, AreaProgressSummary[]>();
  for (const summary of summaries) {
    groups.set(summary.act, [...(groups.get(summary.act) ?? []), summary]);
  }

  return [...groups.entries()]
    .sort(([leftAct], [rightAct]) => getActSortOrder(leftAct) - getActSortOrder(rightAct))
    .map(([act, groupedAreas]) => ({
      act,
      areas: groupedAreas.sort((left, right) => left.areaId.localeCompare(right.areaId))
    }));
}

function cloneManualObjectiveStates(
  states: QuestProgress['manualObjectiveStates']
): QuestProgress['manualObjectiveStates'] {
  if (states == null) return undefined;
  return Object.fromEntries(Object.entries(states).map(([areaId, areaStates]) => [areaId, { ...areaStates }]));
}

function getActSortOrder(act: number): number {
  return act === 0 ? 3.5 : act;
}

export function createEmptyQuestProgress(): QuestProgress {
  return { completedObjectiveIds: {}, manualObjectiveStates: {} };
}
