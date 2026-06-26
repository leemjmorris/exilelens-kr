import { describe, expect, it } from 'vitest';
import { extractCharacterNamesFromClientLogLines } from '../../src/main/poe/characterDiscovery';

describe('Client.txt character discovery', () => {
  it('extracts character names from Korean reward acquisition lines in recent order', () => {
    const names = extractCharacterNamesFromClientLogLines([
      '2026/06/21 [INFO Client] : HappyMonk 님이 번개 저항 +10% 획득했습니다.',
      '2026/06/21 [INFO Client] [SCENE] Set Source [데샤르의 첨탑]',
      '2026/06/21 [INFO Client] : HappyWitch 님이 화염 저항 +10% 획득했습니다.',
      '2026/06/21 [INFO Client] : HappyMonk 님이 패시브 스킬 2포인트 획득했습니다.'
    ]);

    expect(names).toEqual(['HappyMonk', 'HappyWitch']);
  });

  it('ignores non-character system text and invalid blank captures', () => {
    const names = extractCharacterNamesFromClientLogLines([
      '2026/06/21 [INFO Client] [SCENE] Set Source [클리어펠]',
      '2026/06/21 [INFO Client] : 님이 이상한 줄 획득했습니다.',
      '2026/06/21 [INFO Client] : 거래소 님이 아이템을 등록했습니다.'
    ]);

    expect(names).toEqual([]);
  });
});
