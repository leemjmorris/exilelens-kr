import { describe, expect, it } from 'vitest';
import { parseCopiedItemText } from '../../src/shared/items/itemParser';

const koreanRareFixture = `아이템 종류: 투구
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
기절 및 막기 회복 10% 증가`;

describe('parseCopiedItemText', () => {
  it('parses Korean rare item headers and preserves categorized lines', () => {
    const parsed = parseCopiedItemText(koreanRareFixture);

    expect(parsed.rarity).toBe('희귀');
    expect(parsed.name).toBe('폭풍 가면');
    expect(parsed.baseType).toBe('철제 큰 투구');
    expect(parsed.itemLevel).toBe(18);
    expect(parsed.requirements).toEqual(['레벨: 12', '힘: 26']);
    expect(parsed.stats).toEqual(['방어도: 45']);
    expect(parsed.mods).toEqual(['화염 저항 +12%', '최대 생명력 +24', '기절 및 막기 회복 10% 증가']);
    expect(parsed.rawLines).toContain('아이템 종류: 투구');
  });

  it('parses generic English magic item without failing on unknown text', () => {
    const raw = `Rarity: Magic
Superior Lace Hood
--------
Quality: +5%
Energy Shield: 12
--------
Requirements:
Level: 3
Int: 9
--------
Item Level: 7
--------
Some Unknown Crafted Line
+8 to maximum Mana`;

    const parsed = parseCopiedItemText(raw);

    expect(parsed.rarity).toBe('Magic');
    expect(parsed.name).toBe('Superior Lace Hood');
    expect(parsed.baseType).toBeUndefined();
    expect(parsed.itemLevel).toBe(7);
    expect(parsed.requirements).toEqual(['Level: 3', 'Int: 9']);
    expect(parsed.stats).toEqual(['Quality: +5%', 'Energy Shield: 12']);
    expect(parsed.mods).toEqual(['Some Unknown Crafted Line', '+8 to maximum Mana']);
    expect(parsed.unknownLines).toEqual([]);
  });

  it('keeps raw and unknown lines for malformed or partial clipboard text', () => {
    const parsed = parseCopiedItemText('무작위 한글 줄\n--------\n알 수 없는 값');

    expect(parsed.rarity).toBeUndefined();
    expect(parsed.name).toBe('무작위 한글 줄');
    expect(parsed.rawLines).toEqual(['무작위 한글 줄', '--------', '알 수 없는 값']);
    expect(parsed.unknownLines).toContain('알 수 없는 값');
  });
});
