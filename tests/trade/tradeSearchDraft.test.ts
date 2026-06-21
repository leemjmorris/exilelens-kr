import { describe, expect, it } from 'vitest';
import { buildTradeSearchDraft } from '../../src/shared/trade/tradeSearchDraft';
import { parseCopiedItemText } from '../../src/shared/items/itemParser';

const rareItem = parseCopiedItemText(`아이템 종류: 투구
희귀도: 희귀
폭풍 가면
철제 큰 투구
--------
방어도: 45
--------
요구사항:
레벨: 12
힘: 26
--------
아이템 레벨: 18
--------
화염 저항 +12%
최대 생명력 +24
기절 및 막기 회복 10% 증가`);

describe('buildTradeSearchDraft', () => {
  it('uses base type, item level, and mod keywords for rare items', () => {
    const draft = buildTradeSearchDraft(rareItem, { league: 'Dawn of the Hunt', language: 'ko' });

    expect(draft.status).toBe('api_search_available');
    expect(draft.source).toBe('parsed_item_text');
    expect(draft.league).toBe('Dawn of the Hunt');
    expect(draft.rarity).toBe('희귀');
    expect(draft.name).toBe('폭풍 가면');
    expect(draft.baseType).toBe('철제 큰 투구');
    expect(draft.itemLevel).toBe(18);
    expect(draft.keywords).toEqual(['철제 큰 투구', '화염 저항', '최대 생명력', '기절 및 막기 회복']);
    expect(draft.queryText).toContain('철제 큰 투구');
    expect(draft.queryText).toContain('ilvl:18');
    expect(draft.searchUrl).toContain('pathofexile.com/trade2/search/poe2/Dawn%20of%20the%20Hunt');
  });

  it('uses the item name as the primary keyword for unique or named items', () => {
    const uniqueItem = parseCopiedItemText(`Rarity: Unique
Goldrim
Lace Hood
--------
Evasion Rating: 13
Energy Shield: 4
--------
Item Level: 42
--------
+35% to Fire Resistance
+35% to Cold Resistance`);

    const draft = buildTradeSearchDraft(uniqueItem, { league: 'Standard', language: 'en' });

    expect(draft.status).toBe('api_search_available');
    expect(draft.keywords[0]).toBe('Goldrim');
    expect(draft.baseType).toBe('Lace Hood');
    expect(draft.queryText).toContain('Goldrim');
    expect(draft.queryText).toContain('Lace Hood');
  });

  it('preserves unknown input and marks it as manual-search-required', () => {
    const unknownItem = parseCopiedItemText('무작위 한글 줄\n--------\n알 수 없는 값');

    const draft = buildTradeSearchDraft(unknownItem, { league: '  ', language: 'ko' });

    expect(draft.status).toBe('api_search_available');
    expect(draft.league).toBe('Standard');
    expect(draft.keywords).toEqual(['무작위 한글 줄', '알 수 없는 값']);
    expect(draft.rawText).toBe(unknownItem.rawText);
    expect(draft.notes).toContain('공식 POE2 거래소 API 검색을 사용할 수 있습니다.');
  });
});
