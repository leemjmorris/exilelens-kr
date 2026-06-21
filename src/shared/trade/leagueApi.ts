export interface TradeLeague {
  id: string;
  realm: 'poe2' | string;
  text: string;
}

export interface TradeLeaguesResult {
  ok: true;
  leagues: TradeLeague[];
  recommendedLeague: string;
}

export interface TradeLeaguesError {
  ok: false;
  message: string;
  fallbackLeagues: TradeLeague[];
  recommendedLeague: string;
}

export type TradeLeaguesResponse = TradeLeaguesResult | TradeLeaguesError;

export const FALLBACK_POE2_TRADE_LEAGUES: TradeLeague[] = [
  { id: 'Standard', realm: 'poe2', text: 'Standard' },
  { id: 'Hardcore', realm: 'poe2', text: 'Hardcore' }
];

export function pickRecommendedLeague(leagues: TradeLeague[]): string {
  const softcoreChallenge = leagues.find(
    (league) => league.realm === 'poe2' && !isPermanentLeague(league.id) && !isHardcoreLeague(league.id)
  );
  return softcoreChallenge?.id ?? leagues.find((league) => league.realm === 'poe2')?.id ?? 'Standard';
}

function isPermanentLeague(id: string): boolean {
  const normalized = id.trim().toLocaleLowerCase('en-US');
  return normalized === 'standard' || normalized === 'hardcore';
}

function isHardcoreLeague(id: string): boolean {
  return /(^hc\b|hardcore)/iu.test(id);
}
