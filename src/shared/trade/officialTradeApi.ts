import type { ParsedItemText } from '../items/itemParser';

export interface OfficialTradeSearchRequest {
  query: {
    status: { option: 'online' | 'any' };
    name?: string;
    type?: string;
    stats: Array<{ type: 'and'; filters: unknown[] }>;
  };
  sort: { price: 'asc' };
}

export interface OfficialTradePrice {
  amount: number;
  currency: string;
  type?: string;
}

export interface OfficialTradeListingSummary {
  id: string;
  itemName?: string;
  typeLine?: string;
  price?: OfficialTradePrice;
  whisper?: string;
}

export interface OfficialTradeSearchResult {
  ok: true;
  queryId: string;
  total: number;
  searchUrl: string;
  listings: OfficialTradeListingSummary[];
}

export interface OfficialTradeSearchError {
  ok: false;
  reason: 'missing_item' | 'network_error' | 'api_error' | 'blocked';
  message: string;
  statusCode?: number;
}

export type OfficialTradeSearchResponse = OfficialTradeSearchResult | OfficialTradeSearchError;

const OFFICIAL_POE2_TRADE_WEB_BASE_URL = 'https://www.pathofexile.com/trade2/search/poe2';

export function buildOfficialTradeSearchRequest(item: ParsedItemText): OfficialTradeSearchRequest | null {
  const name = cleanQueryValue(item.name);
  const type = cleanQueryValue(item.baseType) ?? cleanQueryValue(item.name);

  if (name == null && type == null) return null;

  const rarity = item.rarity?.toLowerCase();
  const isUnique = rarity === 'unique' || rarity === '고유';

  return {
    query: {
      status: { option: 'online' },
      ...(isUnique && name != null ? { name } : {}),
      ...(type != null ? { type } : {}),
      stats: [{ type: 'and', filters: [] }]
    },
    sort: { price: 'asc' }
  };
}

export function buildOfficialTradeSearchWebUrl(league: string, queryId?: string): string {
  const safeLeague = encodeURIComponent(normalizeLeague(league));
  return queryId == null
    ? `${OFFICIAL_POE2_TRADE_WEB_BASE_URL}/${safeLeague}`
    : `${OFFICIAL_POE2_TRADE_WEB_BASE_URL}/${safeLeague}/${encodeURIComponent(queryId)}`;
}

export function normalizeLeague(league: string | undefined): string {
  const trimmed = league?.trim();
  return trimmed != null && trimmed.length > 0 ? trimmed : 'Standard';
}

function cleanQueryValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed != null && trimmed.length > 0 && trimmed !== '미감지' ? trimmed : undefined;
}
