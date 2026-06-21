import type { ParsedItemText } from '../../shared/items/itemParser';
import {
  buildOfficialTradeSearchRequest,
  buildOfficialTradeSearchWebUrl,
  normalizeLeague,
  type OfficialTradeListingSummary,
  type OfficialTradePrice,
  type OfficialTradeSearchResponse
} from '../../shared/trade/officialTradeApi';

const USER_AGENT = 'ExileLensKR/0.1 (+local-overlay; contact: user)';
const SEARCH_TIMEOUT_MS = 12_000;
const FETCH_LIMIT = 10;

interface OfficialTradeSearchApiResponse {
  id?: string;
  result?: string[];
  error?: { code?: number; message?: string };
}

interface OfficialTradeFetchApiResponse {
  result?: Array<{
    id?: string;
    listing?: {
      price?: OfficialTradePrice;
      whisper?: string;
    };
    item?: {
      name?: string;
      typeLine?: string;
    };
  } | null>;
  error?: { code?: number; message?: string };
}

export async function searchOfficialTrade(
  item: ParsedItemText,
  league: string | undefined,
  fetchImpl: typeof fetch = fetch
): Promise<OfficialTradeSearchResponse> {
  const normalizedLeague = normalizeLeague(league);
  const request = buildOfficialTradeSearchRequest(item);
  if (request == null) {
    return {
      ok: false,
      reason: 'missing_item',
      message: '아이템 이름이나 베이스 타입을 파싱하지 못해 공식 거래소 검색을 만들 수 없습니다.'
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const searchUrl = `https://www.pathofexile.com/api/trade2/search/poe2/${encodeURIComponent(normalizedLeague)}`;
    const searchResponse = await fetchImpl(searchUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': USER_AGENT
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    const searchBody = (await searchResponse.json()) as OfficialTradeSearchApiResponse;
    if (!searchResponse.ok || searchBody.error != null || searchBody.id == null || searchBody.result == null) {
      return {
        ok: false,
        reason: 'api_error',
        statusCode: searchResponse.status,
        message: searchBody.error?.message ?? `공식 거래소 검색 API 오류: HTTP ${searchResponse.status}`
      };
    }

    const queryId = searchBody.id;
    const total = searchBody.result.length;
    const ids = searchBody.result.slice(0, FETCH_LIMIT);
    const listings = ids.length > 0 ? await fetchListings(fetchImpl, ids, queryId, controller.signal) : [];

    return {
      ok: true,
      queryId,
      total,
      searchUrl: buildOfficialTradeSearchWebUrl(normalizedLeague, queryId),
      listings
    };
  } catch (error) {
    return {
      ok: false,
      reason: 'network_error',
      message: error instanceof Error ? error.message : '공식 거래소 API 연결 실패'
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchListings(
  fetchImpl: typeof fetch,
  ids: string[],
  queryId: string,
  signal: AbortSignal
): Promise<OfficialTradeListingSummary[]> {
  const fetchUrl = `https://www.pathofexile.com/api/trade2/fetch/${ids.join(',')}?query=${encodeURIComponent(queryId)}&realm=poe2`;
  const response = await fetchImpl(fetchUrl, {
    headers: {
      accept: 'application/json',
      'user-agent': USER_AGENT
    },
    signal
  });

  if (!response.ok) return [];
  const body = (await response.json()) as OfficialTradeFetchApiResponse;
  return (body.result ?? [])
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .map((entry) => ({
      id: entry.id ?? '',
      itemName: entry.item?.name,
      typeLine: entry.item?.typeLine,
      price: entry.listing?.price,
      whisper: entry.listing?.whisper
    }))
    .filter((entry) => entry.id.length > 0);
}
