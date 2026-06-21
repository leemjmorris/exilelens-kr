import { afterEach, describe, expect, it } from 'vitest';
import { appendFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createAreaWatcher } from '../src/main/poe/areaWatcher';
import { areaDefinitions } from '../src/shared/quests/data';
import type { AreaDetectionState } from '../src/shared/quests/areaMatcher';

const smokeLogPath = join(process.cwd(), '.tmp-client-log-smoke.txt');

describe('runtime Client.txt watcher smoke', () => {
  afterEach(async () => {
    await rm(smokeLogPath, { force: true });
  });

  it('tails a real Client.txt file and detects appended POE2 areaId/SCENE lines', async () => {
    await writeFile(smokeLogPath, '2026/06/19 [INFO Client] boot\n', 'utf8');

    const detections: AreaDetectionState[] = [];
    const watcher = createAreaWatcher({
      clientLogPath: smokeLogPath,
      areas: areaDefinitions,
      fromBeginning: false,
      pollIntervalMs: 10,
      onAreaDetected: (state) => detections.push(state),
      onError: (error) => {
        throw error;
      }
    });

    await watcher.pollOnce();
    expect(detections).toEqual([]);

    await appendFile(
      smokeLogPath,
      '2026/06/19 [DEBUG Client] Generating level 15 area "G1_11" with seed 1\n',
      'utf8'
    );
    await watcher.pollOnce();

    expect(detections.at(-1)).toMatchObject({
      areaId: 'act1-hunting-grounds',
      areaNameKo: '사냥터',
      detectedFrom: 'client_log',
      confidence: 'high'
    });

    await appendFile(smokeLogPath, '2026/06/19 [SCENE] Set Source [The Grelwood]\n', 'utf8');
    await watcher.pollOnce();

    expect(detections.at(-1)).toMatchObject({
      areaId: 'act1-grelwood',
      areaNameKo: '그렐우드',
      detectedFrom: 'client_log',
      confidence: 'high'
    });

    watcher.stop();
  });

  it('bootstraps the current area from existing POE2 Client.txt tail', async () => {
    await writeFile(
      smokeLogPath,
      [
        '2026/06/19 [INFO Client] boot',
        '2026/06/19 45515546 [DEBUG Client] Generating level 44 area "G3_town" with seed 1',
        '2026/06/19 45517625 [INFO Client] [SCENE] Set Source [지구라트 야영지]'
      ].join('\n'),
      'utf8'
    );

    const detections: AreaDetectionState[] = [];
    const watcher = createAreaWatcher({
      clientLogPath: smokeLogPath,
      areas: areaDefinitions,
      fromBeginning: false,
      pollIntervalMs: 10,
      onAreaDetected: (state) => detections.push(state),
      onError: (error) => {
        throw error;
      }
    });

    await watcher.pollOnce();

    expect(detections.at(-1)).toMatchObject({
      areaId: 'act3-ziggurat-encampment',
      areaNameKo: '지구라트 야영지',
      detectedFrom: 'client_log',
      confidence: 'high'
    });

    watcher.stop();
  });
});
