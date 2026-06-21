import { describe, expect, it } from 'vitest';
import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
  normalizeClientLogPath,
  shouldWatchClientLog
} from '../../src/shared/settings/appSettings';

describe('appSettings', () => {
  it('normalizes missing settings to safe demo defaults', () => {
    expect(normalizeAppSettings(undefined)).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('trims Client.txt paths but preserves explicit demo mode choice', () => {
    expect(normalizeAppSettings({ clientLogPath: '  C:/Games/Client.txt  ', demoMode: false })).toEqual({
      clientLogPath: 'C:/Games/Client.txt',
      demoMode: false,
      league: 'Standard',
      manualAreaOverrideId: undefined
    });
    expect(normalizeClientLogPath(null)).toBe('');
  });

  it('normalizes league to a safe manual-search default', () => {
    expect(normalizeAppSettings({ league: '  Dawn of the Hunt  ' }).league).toBe('Dawn of the Hunt');
    expect(normalizeAppSettings({ league: '   ' }).league).toBe('Standard');
  });

  it('normalizes persisted manual area override ids', () => {
    expect(normalizeAppSettings({ manualAreaOverrideId: '  act1-clearfell  ' }).manualAreaOverrideId).toBe('act1-clearfell');
    expect(normalizeAppSettings({ manualAreaOverrideId: '   ' }).manualAreaOverrideId).toBeUndefined();
  });

  it('watches Client.txt only when demo mode is off and a path is configured', () => {
    expect(shouldWatchClientLog({ clientLogPath: '', demoMode: false, league: 'Standard', manualAreaOverrideId: undefined })).toBe(false);
    expect(shouldWatchClientLog({ clientLogPath: 'C:/Games/Client.txt', demoMode: true, league: 'Standard', manualAreaOverrideId: undefined })).toBe(false);
    expect(shouldWatchClientLog({ clientLogPath: 'C:/Games/Client.txt', demoMode: false, league: 'Standard', manualAreaOverrideId: undefined })).toBe(true);
  });
});
