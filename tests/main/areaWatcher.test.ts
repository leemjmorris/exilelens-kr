import { describe, expect, it, vi } from 'vitest';
import { createAreaWatcher } from '../../src/main/poe/areaWatcher';
import type { AreaDefinition } from '../../src/shared/quests/areaMatcher';

const areas: AreaDefinition[] = [
  {
    id: 'act1-clearfell',
    act: 1,
    nameKo: '클리어펠',
    logNamesKo: ['클리어펠', 'Clearfell'],
    isTown: false,
    hasMapThumbnail: false,
    guideStepIds: []
  }
];

describe('createAreaWatcher', () => {
  it('emits a detected area when polling reads matching Client.txt lines', async () => {
    const onAreaDetected = vi.fn();
    const watcher = createAreaWatcher({
      clientLogPath: 'Client.txt',
      areas,
      pollIntervalMs: 10,
      fromBeginning: true,
      createCursor: vi.fn(async () => ({ path: 'Client.txt', offset: 0, pendingText: '' })),
      readLines: vi.fn(async () => ['2026/06/19 [INFO Client] You have entered Clearfell.']),
      onAreaDetected
    });

    await watcher.pollOnce();

    expect(onAreaDetected).toHaveBeenCalledWith({
      areaId: 'act1-clearfell',
      act: 1,
      areaNameKo: '클리어펠',
      detectedFrom: 'client_log',
      confidence: 'high'
    });
  });

  it('bootstraps from recent Client.txt tail before waiting for new lines', async () => {
    const onAreaDetected = vi.fn();
    const readLines = vi.fn(async () => []);
    const readRecentLines = vi.fn(async () => ['older', '2026/06/19 [INFO Client] [SCENE] Set Source [클리어펠]']);
    const watcher = createAreaWatcher({
      clientLogPath: 'Client.txt',
      areas,
      pollIntervalMs: 10,
      createCursor: vi.fn(async () => ({ path: 'Client.txt', offset: 999, pendingText: '' })),
      readLines,
      readRecentLines,
      onAreaDetected
    });

    await watcher.pollOnce();

    expect(readRecentLines).toHaveBeenCalledWith('Client.txt', 256 * 1024);
    expect(readLines).not.toHaveBeenCalled();
    expect(onAreaDetected).toHaveBeenCalledWith({
      areaId: 'act1-clearfell',
      act: 1,
      areaNameKo: '클리어펠',
      detectedFrom: 'client_log',
      confidence: 'high'
    });
  });

  it('does not emit repeatedly for unchanged detections', async () => {
    const onAreaDetected = vi.fn();
    const watcher = createAreaWatcher({
      clientLogPath: 'Client.txt',
      areas,
      pollIntervalMs: 10,
      fromBeginning: true,
      createCursor: vi.fn(async () => ({ path: 'Client.txt', offset: 0, pendingText: '' })),
      readLines: vi.fn(async () => ['You have entered Clearfell.']),
      onAreaDetected
    });

    await watcher.pollOnce();
    await watcher.pollOnce();

    expect(onAreaDetected).toHaveBeenCalledTimes(1);
  });

  it('emits quest evidence from the same Client.txt polling batch', async () => {
    const onAreaDetected = vi.fn();
    const onQuestEvidence = vi.fn();
    const watcher = createAreaWatcher({
      clientLogPath: 'Client.txt',
      areas,
      pollIntervalMs: 10,
      fromBeginning: true,
      createCursor: vi.fn(async () => ({ path: 'Client.txt', offset: 0, pendingText: '' })),
      readLines: vi.fn(async () => [
        '2026/06/19 [INFO Client] [SCENE] Set Source [클리어펠]',
        '2026/06/19 [INFO Client] : 테스트 님이 패시브 스킬 포인트 2포인트를 획득했습니다.'
      ]),
      onAreaDetected,
      onQuestEvidence
    });

    await watcher.pollOnce();

    expect(onQuestEvidence).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'area-entered', areaId: 'act1-clearfell' }),
        expect.objectContaining({
          type: 'reward-acquired',
          areaId: 'act1-clearfell',
          rewardText: '테스트 님이 패시브 스킬 포인트 2포인트를 획득했습니다.'
        })
      ])
    );
  });
});
