export interface AreaDefinition {
  id: string;
  act: number;
  nameKo: string;
  nameEn?: string;
  logNamesKo: string[];
  areaIdAliases?: string[];
  isTown: boolean;
  hasMapThumbnail: boolean;
  mapThumbnailPath?: string;
  guideStepIds: string[];
  needsVerification?: boolean;
}

export interface AreaDetectionState {
  areaId?: string;
  act?: number;
  areaNameKo?: string;
  detectedFrom: 'client_log' | 'manual_override' | 'unknown';
  confidence: 'low' | 'medium' | 'high';
}

const ENGLISH_ENTRY_PATTERN = /You have entered\s+(.+?)\.?$/u;
const GENERATING_LEVEL_AREA_PATTERN = /Generating level\s+\d+\s+area\s+"([^"]+)"/iu;
const SCENE_SET_SOURCE_PATTERN = /\[SCENE\]\s+Set Source\s+\[(.+?)\]/iu;
const KOREAN_ENTRY_PATTERNS = [
  /(.+?)에\s*입장했습니다\.?$/u,
  /(.+?)\s*입장$/u
];

export function detectAreaFromClientLogLine(line: string): string | null {
  const trimmed = line.trim();

  const generatedAreaMatch = GENERATING_LEVEL_AREA_PATTERN.exec(trimmed);
  if (generatedAreaMatch?.[1] != null && isUsableAreaToken(generatedAreaMatch[1])) {
    return generatedAreaMatch[1].trim();
  }

  const sceneSourceMatch = SCENE_SET_SOURCE_PATTERN.exec(trimmed);
  if (sceneSourceMatch?.[1] != null && isUsableAreaToken(sceneSourceMatch[1])) {
    return sceneSourceMatch[1].trim();
  }

  const englishMatch = ENGLISH_ENTRY_PATTERN.exec(trimmed);
  if (englishMatch?.[1] != null && isUsableAreaToken(englishMatch[1])) return englishMatch[1].trim();

  for (const pattern of KOREAN_ENTRY_PATTERNS) {
    const match = pattern.exec(trimmed);
    if (match?.[1]) {
      const areaName = stripClientLogPrefix(match[1]).trim();
      if (isUsableAreaToken(areaName)) return areaName;
    }
  }

  return null;
}

export function matchDetectedArea(areaName: string, areas: AreaDefinition[]): AreaDetectionState {
  const normalizedAreaName = normalizeAreaName(areaName);
  const match = areas.find((area) =>
    getAreaMatchCandidates(area).some((candidate) => normalizeAreaName(candidate) === normalizedAreaName)
  );

  if (!match) {
    return {
      areaNameKo: areaName,
      detectedFrom: 'client_log',
      confidence: 'low'
    };
  }

  return {
    areaId: match.id,
    act: match.act,
    areaNameKo: match.nameKo,
    detectedFrom: 'client_log',
    confidence: 'high'
  };
}

function normalizeAreaName(value: string): string {
  return value.trim().toLocaleLowerCase('ko-KR');
}

function getAreaMatchCandidates(area: AreaDefinition): string[] {
  return [area.id, area.nameKo, area.nameEn, ...area.logNamesKo, ...(area.areaIdAliases ?? [])].filter(
    (candidate): candidate is string => candidate != null && candidate.trim().length > 0
  );
}

function isUsableAreaToken(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length === 0) return false;

  const lower = normalized.toLocaleLowerCase('en-US');
  if (lower === '(null)' || lower === '(unknown)' || lower === 'null' || lower === 'unknown') return false;

  if (/^act\s+\d+$/iu.test(normalized)) return false;
  if (/^\d+\s*장$/u.test(normalized)) return false;
  if (/^[a-z]?\d+\s*장$/iu.test(normalized)) return false;

  return true;
}

function stripClientLogPrefix(value: string): string {
  const clientMarkerIndex = value.lastIndexOf(']');
  if (clientMarkerIndex >= 0) {
    return value.slice(clientMarkerIndex + 1);
  }

  return value;
}
