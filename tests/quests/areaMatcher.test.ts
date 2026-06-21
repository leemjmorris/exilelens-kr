import { describe, expect, it } from 'vitest';
import { detectAreaFromClientLogLine, matchDetectedArea } from '../../src/shared/quests/areaMatcher';

const areas = [
  {
    id: 'act1-clearfell',
    act: 1,
    nameKo: '클리어펠',
    logNamesKo: ['클리어펠', 'Clearfell'],
    areaIdAliases: ['g1_2'],
    isTown: false,
    hasMapThumbnail: false,
    guideStepIds: []
  },
  {
    id: 'act1-clearfell-encampment',
    act: 1,
    nameKo: '클리어펠 야영지',
    logNamesKo: ['클리어펠 야영지', 'Clearfell Encampment'],
    areaIdAliases: ['g1_town'],
    isTown: true,
    hasMapThumbnail: false,
    guideStepIds: []
  },
  {
    id: 'act1-grelwood',
    act: 1,
    nameKo: '그렐우드',
    logNamesKo: ['그렐우드', 'The Grelwood'],
    areaIdAliases: ['g1_4'],
    isTown: false,
    hasMapThumbnail: false,
    guideStepIds: []
  },
  {
    id: 'act1-hunting-grounds',
    act: 1,
    nameKo: '사냥터',
    logNamesKo: ['사냥터', 'Hunting Grounds'],
    areaIdAliases: ['g1_11'],
    isTown: false,
    hasMapThumbnail: false,
    guideStepIds: []
  }
];

describe('detectAreaFromClientLogLine', () => {
  it('extracts a Korean area name from Korean area entry text', () => {
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [INFO Client] 클리어펠에 입장했습니다.')).toEqual('클리어펠');
  });

  it('extracts an English area name from English area entry text', () => {
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [INFO Client] You have entered Clearfell Encampment.')).toEqual('Clearfell Encampment');
  });

  it('extracts a stable areaId from Generating level lines', () => {
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [INFO Client] Generating level 15 area "G1_11" with seed 1')).toEqual('G1_11');
  });

  it('extracts a scene source fallback area name', () => {
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [SCENE] Set Source [The Grelwood]')).toEqual('The Grelwood');
  });

  it('ignores placeholder scene sources and act title screens', () => {
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [SCENE] Set Source [(null)]')).toBeNull();
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [SCENE] Set Source [Act 1]')).toBeNull();
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 123456 abc [SCENE] Set Source [3장]')).toBeNull();
  });

  it('returns null for unrelated log lines', () => {
    expect(detectAreaFromClientLogLine('2026/06/19 12:00:00 chat message without area transition')).toBeNull();
  });
});

describe('matchDetectedArea', () => {
  it('matches detected Korean log names to area definitions with high confidence', () => {
    expect(matchDetectedArea('클리어펠', areas)).toEqual({
      areaId: 'act1-clearfell',
      act: 1,
      areaNameKo: '클리어펠',
      detectedFrom: 'client_log',
      confidence: 'high'
    });
  });

  it('matches areaId aliases from Generating level lines with high confidence', () => {
    expect(matchDetectedArea('G1_11', areas)).toEqual({
      areaId: 'act1-hunting-grounds',
      act: 1,
      areaNameKo: '사냥터',
      detectedFrom: 'client_log',
      confidence: 'high'
    });
  });

  it('matches scene source fallback names with high confidence', () => {
    expect(matchDetectedArea('The Grelwood', areas)).toEqual({
      areaId: 'act1-grelwood',
      act: 1,
      areaNameKo: '그렐우드',
      detectedFrom: 'client_log',
      confidence: 'high'
    });
  });

  it('returns an unknown low-confidence state when area name is not mapped', () => {
    expect(matchDetectedArea('알 수 없는 지역', areas)).toEqual({
      areaNameKo: '알 수 없는 지역',
      detectedFrom: 'client_log',
      confidence: 'low'
    });
  });
});
