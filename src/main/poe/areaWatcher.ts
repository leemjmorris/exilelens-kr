import {
  createClientLogCursor,
  readNewClientLogLines,
  readRecentClientLogLines,
  scanLatestDetectedArea,
  type ClientLogCursor
} from './clientLog';
import type { AreaDefinition, AreaDetectionState } from '../../shared/quests/areaMatcher';

export interface AreaWatcherOptions {
  clientLogPath: string;
  areas: AreaDefinition[];
  pollIntervalMs?: number;
  fromBeginning?: boolean;
  bootstrapTailBytes?: number;
  onAreaDetected: (state: AreaDetectionState) => void;
  onError?: (error: unknown) => void;
  createCursor?: (path: string, options?: { fromBeginning?: boolean }) => Promise<ClientLogCursor>;
  readLines?: (cursor: ClientLogCursor) => Promise<string[]>;
  readRecentLines?: (path: string, maxBytes?: number) => Promise<string[]>;
}

export interface AreaWatcher {
  pollOnce: () => Promise<void>;
  start: () => void;
  stop: () => void;
}

export function createAreaWatcher(options: AreaWatcherOptions): AreaWatcher {
  const createCursor = options.createCursor ?? createClientLogCursor;
  const readLines = options.readLines ?? readNewClientLogLines;
  const readRecentLines = options.readRecentLines ?? readRecentClientLogLines;
  const pollIntervalMs = options.pollIntervalMs ?? 1000;
  const bootstrapTailBytes = options.bootstrapTailBytes ?? 256 * 1024;
  let cursorPromise: Promise<ClientLogCursor> | null = null;
  let timer: NodeJS.Timeout | null = null;
  let lastSignature: string | null = null;
  let bootstrapped = false;

  async function getCursor(): Promise<ClientLogCursor> {
    cursorPromise ??= createCursor(options.clientLogPath, { fromBeginning: options.fromBeginning });
    return cursorPromise;
  }

  async function pollOnce(): Promise<void> {
    try {
      const cursor = await getCursor();
      const lines = !bootstrapped && options.fromBeginning !== true
        ? await readRecentLines(options.clientLogPath, bootstrapTailBytes)
        : await readLines(cursor);
      bootstrapped = true;
      const detected = scanLatestDetectedArea(lines, options.areas);
      if (detected == null) return;

      const signature = `${detected.areaId ?? ''}|${detected.areaNameKo ?? ''}|${detected.confidence}`;
      if (signature === lastSignature) return;

      lastSignature = signature;
      options.onAreaDetected(detected);
    } catch (error) {
      options.onError?.(error);
    }
  }

  return {
    pollOnce,
    start: () => {
      if (timer != null) return;
      void pollOnce();
      timer = setInterval(() => void pollOnce(), pollIntervalMs);
    },
    stop: () => {
      if (timer == null) return;
      clearInterval(timer);
      timer = null;
    }
  };
}
