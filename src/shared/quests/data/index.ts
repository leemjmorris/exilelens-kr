import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist } from '../checklist';
import { act1Areas, act1Checklists } from './act1';
import { act2Areas, act2Checklists } from './act2';
import { act3Areas, act3Checklists } from './act3';
import { act4Areas, act4Checklists } from './act4';
import { interludeAreas, interludeChecklists } from './interlude';

export const areaDefinitions: AreaDefinition[] = [...act1Areas, ...act2Areas, ...act3Areas, ...interludeAreas, ...act4Areas];
export const areaChecklists: AreaChecklist[] = [...act1Checklists, ...act2Checklists, ...act3Checklists, ...interludeChecklists, ...act4Checklists];

export function findChecklistForArea(areaId: string | undefined): AreaChecklist | undefined {
  if (areaId == null) return undefined;
  return areaChecklists.find((checklist) => checklist.areaId === areaId);
}

export function getDemoAreaDetection() {
  const area = areaDefinitions.find((candidate) => candidate.id === 'act1-clearfell') ?? areaDefinitions[0];
  return {
    areaId: area.id,
    act: area.act,
    areaNameKo: area.nameKo,
    detectedFrom: 'unknown' as const,
    confidence: 'medium' as const
  };
}
