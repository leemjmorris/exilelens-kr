export interface AppSettings {
  clientLogPath: string;
  demoMode: boolean;
  league: string;
  manualAreaOverrideId?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  clientLogPath: '',
  demoMode: true,
  league: 'Standard',
  manualAreaOverrideId: undefined
};

export function normalizeAppSettings(input: Partial<AppSettings> | null | undefined): AppSettings {
  return {
    clientLogPath: normalizeClientLogPath(input?.clientLogPath),
    demoMode: input?.demoMode ?? DEFAULT_APP_SETTINGS.demoMode,
    league: normalizeLeague(input?.league),
    manualAreaOverrideId: normalizeManualAreaOverrideId(input?.manualAreaOverrideId)
  };
}

export function normalizeClientLogPath(path: string | null | undefined): string {
  return path?.trim() ?? '';
}

export function shouldWatchClientLog(settings: AppSettings): boolean {
  return !settings.demoMode && settings.clientLogPath.length > 0;
}

export function normalizeLeague(league: string | null | undefined): string {
  const normalized = league?.trim();
  return normalized != null && normalized.length > 0 ? normalized : DEFAULT_APP_SETTINGS.league;
}

export function normalizeManualAreaOverrideId(areaId: string | null | undefined): string | undefined {
  const normalized = areaId?.trim();
  return normalized != null && normalized.length > 0 ? normalized : undefined;
}
