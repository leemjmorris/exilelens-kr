import { describe, expect, it } from 'vitest';
import { buildOfficialTradeSearchRequest, buildOfficialTradeSearchWebUrl } from '../../src/shared/trade/officialTradeApi';
import type { ParsedItemText } from '../../src/shared/items/itemParser';

function item(partial: Partial<ParsedItemText>): ParsedItemText {
  return {
    rawText: '',
    rawLines: [],
    requirements: [],
    stats: [],
    mods: [],
    unknownLines: [],
    ...partial
  };
}

describe('officialTradeApi request builder', () => {
  it('builds a POE2 official trade query from a parsed base type', () => {
    expect(buildOfficialTradeSearchRequest(item({ rarity: '희귀', name: 'Soul Clasp', baseType: 'Crimson Amulet' }))).toEqual({
      query: {
        status: { option: 'online' },
        type: 'Crimson Amulet',
        stats: [{ type: 'and', filters: [] }]
      },
      sort: { price: 'asc' }
    });
  });

  it('uses unique item name plus base type for unique searches', () => {
    expect(buildOfficialTradeSearchRequest(item({ rarity: '고유', name: 'Igniferis', baseType: 'Crimson Amulet' }))).toEqual({
      query: {
        status: { option: 'online' },
        name: 'Igniferis',
        type: 'Crimson Amulet',
        stats: [{ type: 'and', filters: [] }]
      },
      sort: { price: 'asc' }
    });
  });

  it('builds a browser URL with the returned query id', () => {
    expect(buildOfficialTradeSearchWebUrl('Standard', 'abc123')).toBe('https://www.pathofexile.com/trade2/search/poe2/Standard/abc123');
  });
});
