import type { AreaDefinition, AreaDetectionState } from './areaMatcher';

export interface AreaSelectionOption {
  id: string;
  act: number;
  nameKo: string;
  nameEn?: string;
  isTown: boolean;
}

export interface AreaSelectionGroup {
  act: number;
  areas: AreaSelectionOption[];
}

export function listAvailableAreasByAct(areas: AreaDefinition[]): AreaSelectionGroup[] {
  const options = areas
    .map(toAreaSelectionOption)
    .sort((left, right) => getActSortOrder(left.act) - getActSortOrder(right.act) || left.id.localeCompare(right.id));

  const groups = new Map<number, AreaSelectionOption[]>();
  for (const option of options) {
    groups.set(option.act, [...(groups.get(option.act) ?? []), option]);
  }

  return [...groups.entries()].map(([act, groupedAreas]) => ({ act, areas: groupedAreas }));
}

export function findAreaById(areas: AreaDefinition[], areaId: string | null | undefined): AreaDefinition | undefined {
  const normalizedId = areaId?.trim();
  if (normalizedId == null || normalizedId.length === 0) return undefined;
  return areas.find((area) => area.id === normalizedId);
}

export function buildManualAreaOverride(
  areas: AreaDefinition[],
  areaId: string | null | undefined
): AreaDetectionState | undefined {
  const area = findAreaById(areas, areaId);
  if (area == null) return undefined;

  return {
    areaId: area.id,
    act: area.act,
    areaNameKo: area.nameKo,
    detectedFrom: 'manual_override',
    confidence: 'high'
  };
}

export function normalizeManualAreaOverrideId(
  areas: AreaDefinition[],
  areaId: string | null | undefined
): string | undefined {
  return findAreaById(areas, areaId)?.id;
}

function getActSortOrder(act: number): number {
  return act === 0 ? 3.5 : act;
}

function toAreaSelectionOption(area: AreaDefinition): AreaSelectionOption {
  return {
    id: area.id,
    act: area.act,
    nameKo: area.nameKo,
    nameEn: area.nameEn,
    isTown: area.isTown
  };
}
