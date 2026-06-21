import { describe, expect, it, vi } from 'vitest';
import { searchOfficialTrade } from '../../src/main/trade/officialTradeApi';
import type { ParsedItemText } from '../../src/shared/items/itemParser';

function item(): ParsedItemText {
  return {
    rawText: '',
    rawLines: [],
    rarity: '희귀',
    name: 'Soul Clasp',
    baseType: 'Crimson Amulet',
    requirements: [],
    stats: [],
    mods: [],
    unknownLines: []
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

describe('searchOfficialTrade', () => {
  it('posts to official POE2 trade API and fetches listing prices', async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      const textUrl = String(url);
      if (textUrl.includes('/api/trade2/search/poe2/Standard')) {
        return jsonResponse({ id: 'query123', result: ['listing-a', 'listing-b'] });
      }
      if (textUrl.includes('/api/trade2/fetch/listing-a,listing-b')) {
        return jsonResponse({
          result: [
            { id: 'listing-a', listing: { price: { amount: 1, currency: 'exalted' } }, item: { typeLine: 'Crimson Amulet' } },
            { id: 'listing-b', listing: { price: { amount: 2, currency: 'regal' } }, item: { typeLine: 'Crimson Amulet', name: 'Soul Clasp' } }
          ]
        });
      }
      return jsonResponse({ error: { message: 'unexpected URL' } }, 500);
    }) as unknown as typeof fetch;

    const result = await searchOfficialTrade(item(), 'Standard', fetchImpl);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.queryId).toBe('query123');
      expect(result.total).toBe(2);
      expect(result.searchUrl).toBe('https://www.pathofexile.com/trade2/search/poe2/Standard/query123');
      expect(result.listings.map((listing) => listing.price?.currency)).toEqual(['exalted', 'regal']);
    }
  });

  it('returns a user-facing error when official API rejects the query', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: { message: 'Bad Request' } }, 400)) as unknown as typeof fetch;

    const result = await searchOfficialTrade(item(), 'Standard', fetchImpl);

    expect(result).toMatchObject({ ok: false, reason: 'api_error', message: 'Bad Request', statusCode: 400 });
  });
});
