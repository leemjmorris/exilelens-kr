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
}

export function createEmptyCharacterProgressState(): CharacterProgressState {
  return { activeCharacterId: undefined, characters: {} };
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
    }
  };
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
    return { activeCharacterId: active, characters };
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
      }
    };
  }

  return createEmptyCharacterProgressState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}
