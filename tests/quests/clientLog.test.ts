import { appendFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createClientLogCursor, readNewClientLogLines, scanFurthestDetectedArea, scanLatestDetectedArea } from '../../src/main/poe/clientLog';

const tempDirs: string[] = [];

async function createTempClientLog(content: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'exilelens-client-log-'));
  tempDirs.push(dir);
  const path = join(dir, 'Client.txt');
  await writeFile(path, content, 'utf8');
  return path;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('createClientLogCursor', () => {
  it('starts at the end of an existing log by default so old lines are ignored', async () => {
    const path = await createTempClientLog('old line\n');

    const cursor = await createClientLogCursor(path);
    const newLines = await readNewClientLogLines(cursor);

    expect(newLines).toEqual([]);
  });

  it('can start at the beginning when initial scanning is requested', async () => {
    const path = await createTempClientLog('first line\nsecond line\n');

    const cursor = await createClientLogCursor(path, { fromBeginning: true });
    const newLines = await readNewClientLogLines(cursor);

    expect(newLines).toEqual(['first line', 'second line']);
  });
});

describe('readNewClientLogLines', () => {
  it('returns only lines appended after the cursor was created', async () => {
    const path = await createTempClientLog('old line\n');
    const cursor = await createClientLogCursor(path);
    await writeFile(path, 'old line\nnew line 1\nnew line 2\n', 'utf8');

    const newLines = await readNewClientLogLines(cursor);

    expect(newLines).toEqual(['new line 1', 'new line 2']);
  });

  it('keeps a partial trailing line buffered until the newline arrives', async () => {
    const path = await createTempClientLog('old line\n');
    const cursor = await createClientLogCursor(path);
    await appendFile(path, 'partial', 'utf8');

    expect(await readNewClientLogLines(cursor)).toEqual([]);

    await appendFile(path, ' completed\n', 'utf8');

    expect(await readNewClientLogLines(cursor)).toEqual(['partial completed']);
  });

  it('uses byte offsets, not string offsets, when Korean text exists before appended lines', async () => {
    const koreanPrefix = Array.from({ length: 120 }, (_, index) => `2026/06/19 [INFO Client] 기존 한국어 로그 ${index} 지구라트 야영지`).join('\n') + '\n';
    const path = await createTempClientLog(koreanPrefix);
    const cursor = await createClientLogCursor(path);

    await appendFile(path, '2026/06/19 [DEBUG Client] Generating level 43 area "G3_14" with seed 1\n', 'utf8');
    await appendFile(path, '2026/06/19 [INFO Client] [SCENE] Set Source [웃자알]\n', 'utf8');

    const newLines = await readNewClientLogLines(cursor);

    expect(newLines).toEqual([
      '2026/06/19 [DEBUG Client] Generating level 43 area "G3_14" with seed 1',
      '2026/06/19 [INFO Client] [SCENE] Set Source [웃자알]'
    ]);
  });
});

describe('scanLatestDetectedArea', () => {
  it('returns the latest matched area from the new log lines', async () => {
    const lines = [
      '2026/06/19 chat noise',
      '2026/06/19 [INFO Client] 클리어펠에 입장했습니다.',
      '2026/06/19 [INFO Client] You have entered Clearfell Encampment.'
    ];

    const result = scanLatestDetectedArea(lines, [
      {
        id: 'act1-clearfell',
        act: 1,
        nameKo: '클리어펠',
        logNamesKo: ['클리어펠', 'Clearfell'],
        isTown: false,
        hasMapThumbnail: false,
        guideStepIds: []
      },
      {
        id: 'act1-clearfell-encampment',
        act: 1,
        nameKo: '클리어펠 야영지',
        logNamesKo: ['클리어펠 야영지', 'Clearfell Encampment'],
        isTown: true,
        hasMapThumbnail: false,
        guideStepIds: []
      }
    ]);

    expect(result).toEqual({
      areaId: 'act1-clearfell-encampment',
      act: 1,
      areaNameKo: '클리어펠 야영지',
      detectedFrom: 'client_log',
      confidence: 'high'
    });
  });

  it('returns null when no area-entry lines are present', () => {
    expect(scanLatestDetectedArea(['plain log line'], [])).toBeNull();
  });
});

describe('scanFurthestDetectedArea', () => {
  it('returns the furthest campaign area from recent lines even when latest line is an earlier town', () => {
    const areas = [
      {
        id: 'act3-ziggurat-encampment',
        act: 3,
        nameKo: '지구라트 야영지',
        logNamesKo: ['지구라트 야영지', 'Ziggurat Encampment'],
        isTown: true,
        hasMapThumbnail: false,
        guideStepIds: []
      },
      {
        id: 'act3-utzaal',
        act: 3,
        nameKo: '웃자알',
        logNamesKo: ['웃자알', 'Utzaal'],
        isTown: false,
        hasMapThumbnail: false,
        guideStepIds: []
      }
    ];

    const result = scanFurthestDetectedArea([
      '2026/06/19 [INFO Client] [SCENE] Set Source [지구라트 야영지]',
      '2026/06/19 [DEBUG Client] Generating level 43 area "G3_14" with seed 1',
      '2026/06/19 [INFO Client] [SCENE] Set Source [웃자알]',
      '2026/06/19 [INFO Client] [SCENE] Set Source [지구라트 야영지]'
    ], areas);

    expect(result?.areaId).toBe('act3-utzaal');
  });
});
