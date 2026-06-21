import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { QuestProgress } from '../../shared/quests/checklist';
import { createEmptyQuestProgress, normalizeManualQuestProgress } from '../../shared/quests/checklist';

export function createQuestProgressStore(baseDir: string): {
  load: () => Promise<QuestProgress>;
  save: (progress: QuestProgress) => Promise<void>;
  path: string;
} {
  const path = join(baseDir, 'quest-progress.json');

  return {
    path,
    load: async () => {
      try {
        const raw = await readFile(path, 'utf8');
        const parsed = JSON.parse(raw) as Partial<QuestProgress>;
        return normalizeManualQuestProgress({
          completedObjectiveIds: parsed.completedObjectiveIds ?? {},
          manualObjectiveStates: parsed.manualObjectiveStates ?? {}
        });
      } catch {
        return createEmptyQuestProgress();
      }
    },
    save: async (progress: QuestProgress) => {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
    }
  };
}
