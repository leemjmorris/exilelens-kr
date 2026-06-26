import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { QuestProgress } from '../../shared/quests/checklist';
import { normalizeManualQuestProgress } from '../../shared/quests/checklist';
import {
  createEmptyCharacterProgressState,
  normalizeCharacterProgressState,
  type CharacterProgressState
} from '../../shared/characters/characterProgress';

export function createQuestProgressStore(baseDir: string): {
  load: () => Promise<CharacterProgressState>;
  save: (progress: CharacterProgressState) => Promise<void>;
  path: string;
} {
  const path = join(baseDir, 'quest-progress.json');

  return {
    path,
    load: async () => {
      try {
        const raw = await readFile(path, 'utf8');
        const parsed = JSON.parse(raw) as unknown;
        const normalized = normalizeCharacterProgressState(isLegacyQuestProgress(parsed) ? { legacyProgress: parsed } : parsed);
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
        return normalized;
      } catch {
        return createEmptyCharacterProgressState();
      }
    },
    save: async (progress: CharacterProgressState) => {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(normalizeCharacterProgressState(progress), null, 2)}\n`, 'utf8');
    }
  };
}

function isLegacyQuestProgress(value: unknown): value is QuestProgress {
  if (typeof value !== 'object' || value == null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return record.characters == null && (
    record.completedObjectiveIds != null ||
    record.manualObjectiveStates != null ||
    record.autoObjectiveStates != null
  );
}

export { normalizeManualQuestProgress };
