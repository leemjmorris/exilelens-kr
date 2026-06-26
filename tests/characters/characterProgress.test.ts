import { describe, expect, it } from 'vitest';
import { createEmptyQuestProgress, toggleObjectiveCompletion } from '../../src/shared/quests/checklist';
import {
  createEmptyCharacterProgressState,
  createOrSelectCharacter,
  getActiveCharacterProgress,
  isCharacterOnboardingRequired,
  normalizeCharacterProgressState,
  updateActiveCharacterProgress
} from '../../src/shared/characters/characterProgress';

describe('character progress state', () => {
  it('requires onboarding when no character exists so users can always add a fresh character manually', () => {
    const state = createEmptyCharacterProgressState();

    expect(isCharacterOnboardingRequired(state)).toBe(true);
    expect(getActiveCharacterProgress(state)).toBeNull();
  });

  it('creates and selects a manually entered character immediately', () => {
    const state = createOrSelectCharacter(createEmptyCharacterProgressState(), '  HappyMonk  ');

    expect(isCharacterOnboardingRequired(state)).toBe(false);
    expect(state.activeCharacterId).toBe('HappyMonk');
    expect(state.characters.HappyMonk.displayName).toBe('HappyMonk');
    expect(getActiveCharacterProgress(state)).toEqual(createEmptyQuestProgress());
  });

  it('stores progress separately per character', () => {
    const monkState = createOrSelectCharacter(createEmptyCharacterProgressState(), 'HappyMonk');
    const monkProgress = toggleObjectiveCompletion(createEmptyQuestProgress(), 'act1-clearfell', 'act1-clearfell-beira-cold-resistance');
    const withMonkProgress = updateActiveCharacterProgress(monkState, monkProgress);
    const witchState = createOrSelectCharacter(withMonkProgress, 'HappyWitch');

    expect(getActiveCharacterProgress(witchState)).toEqual(createEmptyQuestProgress());
    expect(witchState.characters.HappyMonk.progress.completedObjectiveIds['act1-clearfell']).toEqual(['act1-clearfell-beira-cold-resistance']);
    expect(witchState.characters.HappyWitch.progress.completedObjectiveIds).toEqual({});
  });

  it('migrates legacy single-character quest progress into a default selectable character', () => {
    const legacyProgress = toggleObjectiveCompletion(createEmptyQuestProgress(), 'act2-deshar', 'act2-deshar-final-letter-passive');
    const state = normalizeCharacterProgressState({ legacyProgress });

    expect(state.activeCharacterId).toBe('기본 캐릭터');
    expect(state.characters['기본 캐릭터'].progress.completedObjectiveIds['act2-deshar']).toEqual(['act2-deshar-final-letter-passive']);
  });

  it('rejects blank character names instead of creating invisible list entries', () => {
    expect(() => createOrSelectCharacter(createEmptyCharacterProgressState(), '   ')).toThrow('캐릭터 이름을 입력하세요');
  });
});
