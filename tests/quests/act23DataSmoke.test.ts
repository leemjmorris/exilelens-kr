import { describe, expect, it } from 'vitest';
import { areaDefinitions } from '../../src/shared/quests/data';
import { matchDetectedArea } from '../../src/shared/quests/areaMatcher';

describe('Act 2/3 area data smoke', () => {
  it('matches the Kakao install current Act 3 areaId and SCENE examples', () => {
    expect(matchDetectedArea('g3_8', areaDefinitions)).toMatchObject({
      areaId: 'act3-drowned-city',
      areaNameKo: '물에 잠긴 도시',
      confidence: 'high'
    });

    expect(matchDetectedArea('물에 잠긴 도시', areaDefinitions)).toMatchObject({
      areaId: 'act3-drowned-city',
      areaNameKo: '물에 잠긴 도시',
      confidence: 'high'
    });

    expect(matchDetectedArea('지구라트 야영지', areaDefinitions)).toMatchObject({
      areaId: 'act3-ziggurat-encampment',
      areaNameKo: '지구라트 야영지',
      confidence: 'high'
    });
  });

  it('contains official Korean names for previously unsupported Act 2/3 locations', () => {
    const byId = new Map(areaDefinitions.map((area) => [area.id, area]));

    expect(byId.get('act2-ardura-caravan')?.nameKo).toBe('아르듀라 카라반');
    expect(byId.get('act2-bone-pits')?.nameKo).toBe('뼈 구덩이');
    expect(byId.get('act3-molten-vault')?.nameKo).toBe('녹아내린 금고');
    expect(byId.get('act3-black-chambers')?.nameKo).toBe('검은 내실');
  });
});
