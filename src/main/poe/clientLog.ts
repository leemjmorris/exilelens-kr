import { open, stat } from 'node:fs/promises';
import { detectAreaFromClientLogLine, matchDetectedArea, type AreaDefinition, type AreaDetectionState } from '../../shared/quests/areaMatcher';

export interface ClientLogCursor {
  path: string;
  offset: number;
  pendingText: string;
}

export interface ClientLogCursorOptions {
  fromBeginning?: boolean;
}

export async function createClientLogCursor(path: string, options: ClientLogCursorOptions = {}): Promise<ClientLogCursor> {
  const fileStat = await stat(path);
  return {
    path,
    offset: options.fromBeginning ? 0 : fileStat.size,
    pendingText: ''
  };
}

export async function readNewClientLogLines(cursor: ClientLogCursor): Promise<string[]> {
  const fileStat = await stat(cursor.path);

  if (fileStat.size < cursor.offset) {
    cursor.offset = 0;
    cursor.pendingText = '';
  }

  if (fileStat.size === cursor.offset) return [];

  const bytesToRead = fileStat.size - cursor.offset;
  const buffer = Buffer.alloc(bytesToRead);
  const file = await open(cursor.path, 'r');
  try {
    await file.read(buffer, 0, bytesToRead, cursor.offset);
  } finally {
    await file.close();
  }

  cursor.offset = fileStat.size;
  const newText = buffer.toString('utf8');
  return splitClientLogLines(cursor, newText);
}

export async function readRecentClientLogLines(path: string, maxBytes = 256 * 1024): Promise<string[]> {
  const fileStat = await stat(path);
  const start = Math.max(0, fileStat.size - maxBytes);
  const bytesToRead = fileStat.size - start;
  const buffer = Buffer.alloc(bytesToRead);
  const file = await open(path, 'r');
  try {
    await file.read(buffer, 0, bytesToRead, start);
  } finally {
    await file.close();
  }

  const recentText = buffer.toString('utf8');
  const normalized = recentText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((line) => line.length > 0);

  // If we started in the middle of a byte range/line, drop the first partial line.
  return start > 0 ? lines.slice(1) : lines;
}

export function scanLatestDetectedArea(lines: string[], areas: AreaDefinition[]): AreaDetectionState | null {
  let latestAreaName: string | null = null;

  for (const line of lines) {
    const areaName = detectAreaFromClientLogLine(line);
    if (areaName != null) latestAreaName = areaName;
  }

  if (latestAreaName == null) return null;
  return matchDetectedArea(latestAreaName, areas);
}

export function scanFurthestDetectedArea(lines: string[], areas: AreaDefinition[]): AreaDetectionState | null {
  let furthest: AreaDetectionState | null = null;
  let furthestIndex = -1;

  for (const line of lines) {
    const areaName = detectAreaFromClientLogLine(line);
    if (areaName == null) continue;

    const detected = matchDetectedArea(areaName, areas);
    if (detected.areaId == null) continue;

    const index = areas.findIndex((area) => area.id === detected.areaId);
    if (index > furthestIndex) {
      furthest = detected;
      furthestIndex = index;
    }
  }

  return furthest;
}

function splitClientLogLines(cursor: ClientLogCursor, newText: string): string[] {
  const combined = cursor.pendingText + newText;
  const normalized = combined.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const parts = normalized.split('\n');
  const endsWithNewline = normalized.endsWith('\n');

  cursor.pendingText = endsWithNewline ? '' : parts.pop() ?? '';

  return parts.filter((line) => line.length > 0);
}
