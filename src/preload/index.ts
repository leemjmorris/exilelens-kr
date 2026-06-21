import { contextBridge, ipcRenderer } from 'electron';
import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import type { ParsedItemText } from '../shared/items/itemParser';
import type { QuestProgress } from '../shared/quests/checklist';
import type { AppSettings } from '../shared/settings/appSettings';
import type { ClientLogDiscoveryResult } from '../shared/settings/clientLogDiscovery';
import type { ClipboardCaptureResult } from '../main/clipboard/itemClipboardCapture';
import type { AppDiagnostics, HotkeyDiagnostic } from '../shared/diagnostics/appDiagnostics';
import type { OfficialTradeSearchResponse } from '../shared/trade/officialTradeApi';
import type { TradeLeaguesResponse } from '../shared/trade/leagueApi';

type Route = 'item' | 'quest' | 'settings';

contextBridge.exposeInMainWorld('exileLens', {
  showOverlay: () => ipcRenderer.invoke('overlay:show'),
  hideOverlay: () => ipcRenderer.invoke('overlay:hide') as Promise<void>,
  setOverlayClickThrough: (enabled: boolean) => ipcRenderer.invoke('overlay:set-click-through', enabled) as Promise<void>,
  openExternalUrl: (url: string) => ipcRenderer.invoke('external:open', url) as Promise<void>,
  writeClipboardText: (text: string) => ipcRenderer.invoke('clipboard:write-text', text) as Promise<void>,
  onNavigate: (callback: (route: Route) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, route: Route) => callback(route);
    ipcRenderer.on('overlay:navigate', listener);
    return () => ipcRenderer.off('overlay:navigate', listener);
  },
  onAreaDetected: (callback: (state: AreaDetectionState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: AreaDetectionState) => callback(state);
    ipcRenderer.on('quest:area-detected', listener);
    return () => ipcRenderer.off('quest:area-detected', listener);
  },
  onQuestProgress: (callback: (progress: QuestProgress) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: QuestProgress) => callback(progress);
    ipcRenderer.on('quest:progress', listener);
    return () => ipcRenderer.off('quest:progress', listener);
  },
  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, settings: AppSettings) => callback(settings);
    ipcRenderer.on('settings:changed', listener);
    return () => ipcRenderer.off('settings:changed', listener);
  },
  getQuestProgress: () => ipcRenderer.invoke('quest:get-progress') as Promise<QuestProgress>,
  updateQuestProgress: (progress: QuestProgress) => ipcRenderer.invoke('quest:update-progress', progress) as Promise<QuestProgress>,
  captureItemText: () => ipcRenderer.invoke('item:capture') as Promise<ClipboardCaptureResult>,
  searchOfficialTrade: (item: ParsedItemText) => ipcRenderer.invoke('trade:search-official', item) as Promise<OfficialTradeSearchResponse>,
  getTradeLeagues: () => ipcRenderer.invoke('trade:get-leagues') as Promise<TradeLeaguesResponse>,
  getDiagnostics: () => ipcRenderer.invoke('diagnostics:get') as Promise<AppDiagnostics>,
  logDiagnostic: (message: string, details?: unknown) => ipcRenderer.invoke('diagnostics:log', message, details) as Promise<void>,
  retryHotkeys: () => ipcRenderer.invoke('hotkeys:retry') as Promise<HotkeyDiagnostic[]>,
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
  detectClientLogPath: () => ipcRenderer.invoke('settings:detect-client-log') as Promise<ClientLogDiscoveryResult>,
  updateSettings: (settings: AppSettings) => ipcRenderer.invoke('settings:update', settings) as Promise<AppSettings>
});
