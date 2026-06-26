import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { createQuestProgressStore } from '../../src/main/poe/questProgressStore';
import { createEmptyQuestProgress, toggleObjectiveCompletion } from '../../src/shared/quests/checklist';

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'exilelens-character-progress-'));
}

describe('quest progress store with character profiles', () => {
  it('loads an empty character state so first-run onboarding can create a character immediately', async () => {
    const store = createQuestProgressStore(await tempDir());

    const state = await store.load();

    expect(state).toEqual({ activeCharacterId: undefined, characters: {} });
  });

  it('saves and reloads character-specific progress', async () => {
    const store = createQuestProgressStore(await tempDir());
    const progress = toggleObjectiveCompletion(createEmptyQuestProgress(), 'act1-clearfell', 'act1-clearfell-beira-cold-resistance');
    await store.save({
      activeCharacterId: 'HappyMonk',
      characters: {
        HappyMonk: {
          id: 'HappyMonk',
          displayName: 'HappyMonk',
          createdAt: '2026-06-27T00:00:00.000Z',
          progress
        }
      }
    });

    const loaded = await store.load();

    expect(loaded.activeCharacterId).toBe('HappyMonk');
    expect(loaded.characters.HappyMonk.progress.completedObjectiveIds['act1-clearfell']).toEqual(['act1-clearfell-beira-cold-resistance']);
  });

  it('migrates an old quest-progress.json file into 기본 캐릭터 instead of dropping progress', async () => {
    const dir = await tempDir();
    const store = createQuestProgressStore(dir);
    await writeFile(
      store.path,
      JSON.stringify({ manualObjectiveStates: { 'act2-deshar': { 'act2-deshar-final-letter-passive': true } } }),
      'utf8'
    );

    const loaded = await store.load();
    const rawAfterLoad = JSON.parse(await readFile(store.path, 'utf8')) as { activeCharacterId?: string };

    expect(loaded.activeCharacterId).toBe('기본 캐릭터');
    expect(loaded.characters['기본 캐릭터'].progress.completedObjectiveIds['act2-deshar']).toEqual(['act2-deshar-final-letter-passive']);
    expect(rawAfterLoad.activeCharacterId).toBe('기본 캐릭터');
  });
});
