import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
  type AppSettings
} from '../../shared/settings/appSettings';

export function createSettingsStore(baseDir: string): {
  load: () => Promise<AppSettings>;
  save: (settings: AppSettings) => Promise<void>;
  path: string;
} {
  const path = join(baseDir, 'settings.json');

  return {
    path,
    load: async () => {
      try {
        const raw = await readFile(path, 'utf8');
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        return normalizeAppSettings(parsed);
      } catch {
        return DEFAULT_APP_SETTINGS;
      }
    },
    save: async (settings: AppSettings) => {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(normalizeAppSettings(settings), null, 2)}\n`, 'utf8');
    }
  };
}
