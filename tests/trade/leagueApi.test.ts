import { describe, expect, it } from 'vitest';
import { pickRecommendedLeague, type TradeLeague } from '../../src/shared/trade/leagueApi';

describe('leagueApi helpers', () => {
  it('recommends the current softcore challenge league before Standard', () => {
    const leagues: TradeLeague[] = [
      { id: 'Runes of Aldur', realm: 'poe2', text: 'Runes of Aldur' },
      { id: 'HC Runes of Aldur', realm: 'poe2', text: 'HC Runes of Aldur' },
      { id: 'Standard', realm: 'poe2', text: 'Standard' },
      { id: 'Hardcore', realm: 'poe2', text: 'Hardcore' }
    ];

    expect(pickRecommendedLeague(leagues)).toBe('Runes of Aldur');
  });

  it('falls back to Standard when only permanent leagues are present', () => {
    expect(pickRecommendedLeague([{ id: 'Standard', realm: 'poe2', text: 'Standard' }])).toBe('Standard');
  });
});
