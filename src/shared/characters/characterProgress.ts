import { createEmptyQuestProgress, normalizeManualQuestProgress, type QuestProgress } from '../quests/checklist';

export interface CharacterProgressEntry {
  id: string;
  displayName: string;
  createdAt: string;
  progress: QuestProgress;
}

export interface CharacterProgressState {
  activeCharacterId?: string;
  characters: Record<string, CharacterProgressEntry>;
  discoveredCharacterNames?: string[];
  lastCharacterScanAt?: string;
}

export function createEmptyCharacterProgressState(): CharacterProgressState {
  return { activeCharacterId: undefined, characters: {}, discoveredCharacterNames: [] };
}

export function isCharacterOnboardingRequired(state: CharacterProgressState): boolean {
  return Object.keys(state.characters).length === 0 || state.activeCharacterId == null || state.characters[state.activeCharacterId] == null;
}

export function getActiveCharacterProgress(state: CharacterProgressState): QuestProgress | null {
  if (isCharacterOnboardingRequired(state)) return null;
  return state.characters[state.activeCharacterId!].progress;
}

export function createOrSelectCharacter(state: CharacterProgressState, rawName: string): CharacterProgressState {
  const displayName = rawName.trim();
  if (displayName.length === 0) throw new Error('캐릭터 이름을 입력하세요');
  const id = displayName;
  const existing = state.characters[id];
  return {
    activeCharacterId: id,
    characters: {
      ...state.characters,
      [id]: existing ?? {
        id,
        displayName,
        createdAt: new Date().toISOString(),
        progress: createEmptyQuestProgress()
      }
    },
    discoveredCharacterNames: state.discoveredCharacterNames ?? [],
    lastCharacterScanAt: state.lastCharacterScanAt
  };
}

export function mergeDiscoveredCharacterNames(state: CharacterProgressState, names: string[], scannedAt = new Date().toISOString()): CharacterProgressState {
  const seen = new Set<string>();
  const discoveredCharacterNames: string[] = [];
  for (const name of [...(state.discoveredCharacterNames ?? []), ...names]) {
    const trimmed = name.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    discoveredCharacterNames.push(trimmed);
  }
  return { ...state, discoveredCharacterNames, lastCharacterScanAt: scannedAt };
}

export function updateActiveCharacterProgress(state: CharacterProgressState, progress: QuestProgress): CharacterProgressState {
  if (isCharacterOnboardingRequired(state)) return state;
  const activeId = state.activeCharacterId!;
  return {
    ...state,
    characters: {
      ...state.characters,
      [activeId]: {
        ...state.characters[activeId],
        progress: normalizeManualQuestProgress(progress)
      }
    }
  };
}

export function normalizeCharacterProgressState(input: unknown): CharacterProgressState {
  const record = isRecord(input) ? input : {};
  if (isRecord(record.characters)) {
    const characters: Record<string, CharacterProgressEntry> = {};
    for (const [id, value] of Object.entries(record.characters)) {
      if (!isRecord(value)) continue;
      const displayName = typeof value.displayName === 'string' && value.displayName.trim().length > 0 ? value.displayName.trim() : id;
      characters[id] = {
        id,
        displayName,
        createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
        progress: normalizeManualQuestProgress(isRecord(value.progress) ? value.progress as Partial<QuestProgress> as QuestProgress : createEmptyQuestProgress())
      };
    }
    const active = typeof record.activeCharacterId === 'string' && characters[record.activeCharacterId] != null
      ? record.activeCharacterId
      : Object.keys(characters)[0];
    return {
      activeCharacterId: active,
      characters,
      discoveredCharacterNames: Array.isArray(record.discoveredCharacterNames) ? normalizeDiscoveredNames(record.discoveredCharacterNames) : [],
      lastCharacterScanAt: typeof record.lastCharacterScanAt === 'string' ? record.lastCharacterScanAt : undefined
    };
  }

  const legacyProgress = isRecord(record.legacyProgress) ? record.legacyProgress as Partial<QuestProgress> as QuestProgress : null;
  if (legacyProgress != null) {
    const id = '기본 캐릭터';
    return {
      activeCharacterId: id,
      characters: {
        [id]: {
          id,
          displayName: id,
          createdAt: new Date().toISOString(),
          progress: normalizeManualQuestProgress(legacyProgress)
        }
      },
      discoveredCharacterNames: []
    };
  }

  return createEmptyCharacterProgressState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function normalizeDiscoveredNames(values: unknown[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const name = value.trim();
    if (name.length === 0 || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}
