import type { ParsedItemText } from '../items/itemParser';

export type TradeSearchDraftStatus = 'api_search_available';
export type TradeSearchDraftSource = 'parsed_item_text';
export type TradeSearchLanguage = 'ko' | 'en';

export interface TradeSearchDraftOptions {
  league?: string;
  language?: TradeSearchLanguage;
}

export interface TradeSearchDraft {
  source: TradeSearchDraftSource;
  status: TradeSearchDraftStatus;
  league: string;
  language: TradeSearchLanguage;
  rarity?: string;
  name?: string;
  baseType?: string;
  itemLevel?: number;
  keywords: string[];
  queryText: string;
  searchUrl: string;
  rawText: string;
  notes: string[];
}

const DEFAULT_LEAGUE = 'Standard';
const OFFICIAL_POE2_TRADE_BASE_URL = 'https://www.pathofexile.com/trade2/search/poe2';
const UNIQUE_RARITIES = new Set(['unique', '고유']);
const RARE_RARITIES = new Set(['rare', '희귀']);

export function buildTradeSearchDraft(item: ParsedItemText, options: TradeSearchDraftOptions = {}): TradeSearchDraft {
  const league = normalizeLeague(options.league);
  const language = options.language ?? 'ko';
  const keywords = buildKeywords(item);
  const queryText = buildQueryText(item, keywords, league, language);

  return {
    source: 'parsed_item_text',
    status: 'api_search_available',
    league,
    language,
    rarity: item.rarity,
    name: item.name,
    baseType: item.baseType,
    itemLevel: item.itemLevel,
    keywords,
    queryText,
    searchUrl: `${OFFICIAL_POE2_TRADE_BASE_URL}/${encodeURIComponent(league)}`,
    rawText: item.rawText,
    notes: [
      '공식 POE2 거래소 API 검색을 사용할 수 있습니다.',
      '이 초안은 API 실패/빈 결과 시 공식 거래소에서 사용자가 직접 검색하기 위한 fallback 자료입니다.',
      '게임 클라이언트 조작, 자동 클릭, 거래 자동화는 수행하지 않습니다.'
    ]
  };
}

function buildKeywords(item: ParsedItemText): string[] {
  const rarity = item.rarity?.toLowerCase();
  const candidates: string[] = [];

  if (rarity != null && UNIQUE_RARITIES.has(rarity) && item.name != null) {
    candidates.push(item.name);
    if (item.baseType != null) candidates.push(item.baseType);
  } else if (rarity != null && RARE_RARITIES.has(rarity)) {
    if (item.baseType != null) candidates.push(item.baseType);
    candidates.push(...item.mods.map(toModKeyword));
  } else {
    candidates.push(item.name ?? '', item.baseType ?? '', ...item.mods.map(toModKeyword), ...item.unknownLines);
  }

  return uniqueNonEmpty(candidates).slice(0, 8);
}

function buildQueryText(
  item: ParsedItemText,
  keywords: string[],
  league: string,
  language: TradeSearchLanguage
): string {
  const lines = [
    language === 'ko' ? '[ExileLens KR 거래소 수동 검색 초안]' : '[ExileLens KR manual trade search draft]',
    `league: ${league}`,
    item.rarity != null ? `rarity: ${item.rarity}` : undefined,
    item.name != null ? `name: ${item.name}` : undefined,
    item.baseType != null ? `base: ${item.baseType}` : undefined,
    item.itemLevel != null ? `ilvl:${item.itemLevel}` : undefined,
    keywords.length > 0 ? `keywords: ${keywords.join(' | ')}` : undefined,
    '',
    '공식 API 검색이 기본입니다. API 실패/빈 결과 시 아래 원문과 키워드를 공식 거래소에 직접 입력하세요.',
    'API 결과는 공식 거래소 상위 listing 가격이며 자동 거래/자동 귓속말을 수행하지 않습니다.',
    '',
    '[raw item text]',
    item.rawText.trim()
  ];

  return lines.filter((line): line is string => line != null).join('\n');
}

function normalizeLeague(league: string | undefined): string {
  const trimmed = league?.trim();
  return trimmed != null && trimmed.length > 0 ? trimmed : DEFAULT_LEAGUE;
}

function toModKeyword(line: string): string {
  return line
    .replace(/[+-]?\d+(?:\.\d+)?\s*%?/g, '')
    .replace(/\bto\b/gi, '')
    .replace(/\bof\b/gi, '')
    .replace(/\bincreased\b/gi, '')
    .replace(/\breduced\b/gi, '')
    .replace(/증가|감소/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[:\s]+|[:\s]+$/g, '');
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (normalized.length === 0 || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}
