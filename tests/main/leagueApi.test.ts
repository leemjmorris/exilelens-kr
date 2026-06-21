import { describe, expect, it, vi } from 'vitest';
import { fetchPoe2TradeLeagues } from '../../src/main/trade/leagueApi';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('fetchPoe2TradeLeagues', () => {
  it('loads official POE2 trade leagues and recommends the softcore challenge league', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        result: [
          { id: 'Runes of Aldur', realm: 'poe2', text: 'Runes of Aldur' },
          { id: 'HC Runes of Aldur', realm: 'poe2', text: 'HC Runes of Aldur' },
          { id: 'Standard', realm: 'poe2', text: 'Standard' },
          { id: 'Mirage', realm: 'pc', text: 'Mirage' }
        ]
      })
    ) as unknown as typeof fetch;

    const result = await fetchPoe2TradeLeagues(fetchImpl);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.leagues.map((league) => league.id)).toEqual(['Runes of Aldur', 'HC Runes of Aldur', 'Standard']);
      expect(result.recommendedLeague).toBe('Runes of Aldur');
    }
  });

  it('returns fallback leagues when the official API fails', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: { message: 'down' } }, 500)) as unknown as typeof fetch;

    const result = await fetchPoe2TradeLeagues(fetchImpl);

    expect(result).toMatchObject({ ok: false, message: 'down', recommendedLeague: 'Standard' });
  });
});
