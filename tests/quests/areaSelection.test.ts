import { describe, expect, it } from 'vitest';
import type { AreaDefinition } from '../../src/shared/quests/areaMatcher';
import {
  buildManualAreaOverride,
  findAreaById,
  listAvailableAreasByAct,
  normalizeManualAreaOverrideId
} from '../../src/shared/quests/areaSelection';

const areas: AreaDefinition[] = [
  {
    id: 'act1-town',
    act: 1,
    nameKo: '마을',
    nameEn: 'Town',
    logNamesKo: ['마을'],
    isTown: true,
    hasMapThumbnail: false,
    guideStepIds: []
  },
  {
    id: 'act2-field',
    act: 2,
    nameKo: '들판',
    nameEn: 'Field',
    logNamesKo: ['들판'],
    isTown: false,
    hasMapThumbnail: false,
    guideStepIds: []
  },
  {
    id: 'act1-beach',
    act: 1,
    nameKo: '해안',
    nameEn: 'Beach',
    logNamesKo: ['해안'],
    isTown: false,
    hasMapThumbnail: false,
    guideStepIds: []
  }
];

describe('areaSelection', () => {
  it('lists available areas grouped by act in stable display order', () => {
    expect(listAvailableAreasByAct(areas)).toEqual([
      {
        act: 1,
        areas: [
          { id: 'act1-beach', act: 1, nameKo: '해안', nameEn: 'Beach', isTown: false },
          { id: 'act1-town', act: 1, nameKo: '마을', nameEn: 'Town', isTown: true }
        ]
      },
      {
        act: 2,
        areas: [{ id: 'act2-field', act: 2, nameKo: '들판', nameEn: 'Field', isTown: false }]
      }
    ]);
  });

  it('finds an area by id and ignores blank or unknown ids', () => {
    expect(findAreaById(areas, ' act1-town ')?.nameKo).toBe('마을');
    expect(findAreaById(areas, '')).toBeUndefined();
    expect(findAreaById(areas, 'missing')).toBeUndefined();
  });

  it('builds a high confidence manual override detection state', () => {
    expect(buildManualAreaOverride(areas, 'act2-field')).toEqual({
      areaId: 'act2-field',
      act: 2,
      areaNameKo: '들판',
      detectedFrom: 'manual_override',
      confidence: 'high'
    });
    expect(buildManualAreaOverride(areas, 'missing')).toBeUndefined();
  });

  it('normalizes persisted manual override ids against known local data', () => {
    expect(normalizeManualAreaOverrideId(areas, ' act1-beach ')).toBe('act1-beach');
    expect(normalizeManualAreaOverrideId(areas, 'missing')).toBeUndefined();
    expect(normalizeManualAreaOverrideId(areas, null)).toBeUndefined();
  });
});
