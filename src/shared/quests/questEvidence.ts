import type { AreaDefinition } from './areaMatcher';
import type { AreaChecklist, QuestProgress } from './checklist';
import { normalizeManualQuestProgress } from './checklist';

export type QuestEvidenceConfidence = 'high' | 'medium' | 'low';

export type QuestEvidence =
  | {
      type: 'area-entered';
      areaId?: string;
      areaNameKo: string;
      areaCode?: string;
      confidence: QuestEvidenceConfidence;
    }
  | {
      type: 'reward-acquired';
      rewardText: string;
      areaId?: string;
      areaNameKo?: string;
      areaCode?: string;
      confidence: QuestEvidenceConfidence;
    };

const SCENE_PATTERN = /\[SCENE\] Set Source \[(.*?)]/;
const LOADING_SCREEN_PATTERN = /\[LOADING SCREEN\] \((.*?)\)/;
const AREA_CODE_PATTERN = /Generating level \d+ area "([^"]+)"/;
const REWARD_PATTERN = /\] : (.+획득했습니다\.)$/;

export function parseQuestEvidenceFromClientLogLines(
  lines: string[],
  areas: AreaDefinition[],
  initialArea?: { areaId?: string; areaNameKo?: string; areaCode?: string }
): QuestEvidence[] {
  const events: QuestEvidence[] = [];
  let currentAreaId = initialArea?.areaId;
  let currentAreaNameKo = initialArea?.areaNameKo;
  let currentAreaCode = initialArea?.areaCode;

  for (const line of lines) {
    const areaCode = AREA_CODE_PATTERN.exec(line)?.[1];
    if (areaCode != null) {
      currentAreaCode = areaCode;
      const matchedByCode = findAreaByCode(areas, areaCode);
      if (matchedByCode != null) {
        currentAreaId = matchedByCode.id;
        currentAreaNameKo = matchedByCode.nameKo;
      }
    }

    const enteredAreaName = SCENE_PATTERN.exec(line)?.[1] ?? LOADING_SCREEN_PATTERN.exec(line)?.[1];
    if (enteredAreaName != null && enteredAreaName !== '(null)' && enteredAreaName.trim().length > 0) {
      const matched = findAreaByName(areas, enteredAreaName);
      currentAreaId = matched?.id ?? currentAreaId;
      currentAreaNameKo = matched?.nameKo ?? enteredAreaName;
      events.push({
        type: 'area-entered',
        areaId: matched?.id,
        areaNameKo: matched?.nameKo ?? enteredAreaName,
        areaCode: currentAreaCode,
        confidence: matched == null ? 'medium' : 'high'
      });
    }

    const rewardText = REWARD_PATTERN.exec(line)?.[1];
    if (rewardText != null) {
      events.push({
        type: 'reward-acquired',
        rewardText,
        areaId: currentAreaId,
        areaNameKo: currentAreaNameKo,
        areaCode: currentAreaCode,
        confidence: 'high'
      });
    }
  }

  return events;
}

export function applyQuestEvidenceToProgress(
  progress: QuestProgress,
  checklists: AreaChecklist[],
  evidences: QuestEvidence[]
): QuestProgress {
  const normalized = normalizeManualQuestProgress(progress);
  const autoObjectiveStates: NonNullable<QuestProgress['autoObjectiveStates']> = cloneObjectiveStates(normalized.autoObjectiveStates) ?? {};

  for (const evidence of evidences) {
    if (evidence.type !== 'reward-acquired' || evidence.confidence !== 'high') continue;

    for (const checklist of checklists) {
      for (const objective of checklist.objectives) {
        for (const rule of objective.autoComplete ?? []) {
          if (rule.type !== 'reward-acquired' || rule.confidence !== 'high') continue;
          if (rule.areaId != null && rule.areaId !== evidence.areaId) continue;
          if (rule.includes.some((needle) => !evidence.rewardText.includes(needle))) continue;

          autoObjectiveStates[checklist.areaId] = {
            ...(autoObjectiveStates[checklist.areaId] ?? {}),
            [objective.id]: true
          };
        }
      }
    }
  }

  return normalizeManualQuestProgress({
    ...normalized,
    autoObjectiveStates
  });
}

function findAreaByName(areas: AreaDefinition[], areaName: string): AreaDefinition | undefined {
  return areas.find((area) => area.nameKo === areaName || area.logNamesKo.includes(areaName) || area.nameEn === areaName);
}

function findAreaByCode(areas: AreaDefinition[], areaCode: string): AreaDefinition | undefined {
  return areas.find((area) => area.areaIdAliases?.some((alias) => alias.toLowerCase() === areaCode.toLowerCase()));
}

function cloneObjectiveStates(
  states: QuestProgress['autoObjectiveStates']
): QuestProgress['autoObjectiveStates'] {
  if (states == null) return undefined;
  return Object.fromEntries(Object.entries(states).map(([areaId, areaStates]) => [areaId, { ...areaStates }]));
}
