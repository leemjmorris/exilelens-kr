import {
  FALLBACK_POE2_TRADE_LEAGUES,
  pickRecommendedLeague,
  type TradeLeague,
  type TradeLeaguesResponse
} from '../../shared/trade/leagueApi';

const LEAGUES_URL = 'https://www.pathofexile.com/api/trade2/data/leagues';
const USER_AGENT = 'ExileLensKR/0.1 (+local-overlay; contact: user)';
const TIMEOUT_MS = 10_000;

interface OfficialTradeLeaguesBody {
  result?: TradeLeague[];
  error?: { message?: string };
}

export async function fetchPoe2TradeLeagues(fetchImpl: typeof fetch = fetch): Promise<TradeLeaguesResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetchImpl(LEAGUES_URL, {
      headers: {
        accept: 'application/json',
        'user-agent': USER_AGENT
      },
      signal: controller.signal
    });
    const body = (await response.json()) as OfficialTradeLeaguesBody;
    const leagues = (body.result ?? []).filter((league) => league.realm === 'poe2' && league.id.trim().length > 0);

    if (!response.ok || body.error != null || leagues.length === 0) {
      return fallback(body.error?.message ?? `공식 리그 API 오류: HTTP ${response.status}`);
    }

    return {
      ok: true,
      leagues,
      recommendedLeague: pickRecommendedLeague(leagues)
    };
  } catch (error) {
    return fallback(error instanceof Error ? error.message : '공식 리그 API 연결 실패');
  } finally {
    clearTimeout(timeout);
  }
}

function fallback(message: string): TradeLeaguesResponse {
  return {
    ok: false,
    message,
    fallbackLeagues: FALLBACK_POE2_TRADE_LEAGUES,
    recommendedLeague: pickRecommendedLeague(FALLBACK_POE2_TRADE_LEAGUES)
  };
}
