/// <reference types="vite/client" />

import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import type { ParsedItemText } from '../shared/items/itemParser';
import type { QuestProgress } from '../shared/quests/checklist';
import type { AppSettings } from '../shared/settings/appSettings';
import type { ClientLogDiscoveryResult } from '../shared/settings/clientLogDiscovery';
import type { ClipboardCaptureResult } from '../main/clipboard/itemClipboardCapture';
import type { AppDiagnostics, HotkeyDiagnostic } from '../shared/diagnostics/appDiagnostics';
import type { OfficialTradeSearchResponse } from '../shared/trade/officialTradeApi';
import type { TradeLeaguesResponse } from '../shared/trade/leagueApi';

declare global {
  interface Window {
    exileLens?: {
      showOverlay: () => Promise<void>;
      hideOverlay: () => Promise<void>;
      setOverlayClickThrough: (enabled: boolean) => Promise<void>;
      openExternalUrl: (url: string) => Promise<void>;
      writeClipboardText: (text: string) => Promise<void>;
      onNavigate: (callback: (route: 'item' | 'quest' | 'settings') => void) => () => void;
      onAreaDetected: (callback: (state: AreaDetectionState) => void) => () => void;
      onQuestProgress: (callback: (progress: QuestProgress) => void) => () => void;
      onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
      getQuestProgress: () => Promise<QuestProgress>;
      updateQuestProgress: (progress: QuestProgress) => Promise<QuestProgress>;
      captureItemText: () => Promise<ClipboardCaptureResult>;
      searchOfficialTrade: (item: ParsedItemText) => Promise<OfficialTradeSearchResponse>;
      getTradeLeagues: () => Promise<TradeLeaguesResponse>;
      getDiagnostics: () => Promise<AppDiagnostics>;
      logDiagnostic: (message: string, details?: unknown) => Promise<void>;
      retryHotkeys: () => Promise<HotkeyDiagnostic[]>;
      getSettings: () => Promise<AppSettings>;
      detectClientLogPath: () => Promise<ClientLogDiscoveryResult>;
      updateSettings: (settings: AppSettings) => Promise<AppSettings>;
    };
  }
}

export {};
