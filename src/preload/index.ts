import { contextBridge, ipcRenderer } from 'electron';
import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import type { QuestProgress } from '../shared/quests/checklist';
import type { AppSettings } from '../shared/settings/appSettings';
import type { ClientLogDiscoveryResult } from '../shared/settings/clientLogDiscovery';
import type { AppDiagnostics, HotkeyDiagnostic } from '../shared/diagnostics/appDiagnostics';
import type { CharacterProgressState } from '../shared/characters/characterProgress';

contextBridge.exposeInMainWorld('exileLens', {
  showOverlay: () => ipcRenderer.invoke('overlay:show') as Promise<void>,
  hideOverlay: () => ipcRenderer.invoke('overlay:hide') as Promise<void>,
  resizeOverlayBy: (deltaX: number, deltaY: number) => ipcRenderer.invoke('overlay:resize-by', deltaX, deltaY) as Promise<void>,
  moveOverlayBy: (deltaX: number, deltaY: number) => ipcRenderer.invoke('overlay:move-by', deltaX, deltaY) as Promise<void>,
  setOverlayClickThrough: (enabled: boolean) => ipcRenderer.invoke('overlay:set-click-through', enabled) as Promise<void>,
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
  onCharacterProgressState: (callback: (state: CharacterProgressState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: CharacterProgressState) => callback(state);
    ipcRenderer.on('character:state', listener);
    return () => ipcRenderer.off('character:state', listener);
  },
  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, settings: AppSettings) => callback(settings);
    ipcRenderer.on('settings:changed', listener);
    return () => ipcRenderer.off('settings:changed', listener);
  },
  getQuestProgress: () => ipcRenderer.invoke('quest:get-progress') as Promise<QuestProgress>,
  updateQuestProgress: (progress: QuestProgress) => ipcRenderer.invoke('quest:update-progress', progress) as Promise<QuestProgress>,
  getCharacterProgressState: () => ipcRenderer.invoke('character:get-state') as Promise<CharacterProgressState>,
  createOrSelectCharacter: (name: string) => ipcRenderer.invoke('character:create-or-select', name) as Promise<CharacterProgressState>,
  getDiagnostics: () => ipcRenderer.invoke('diagnostics:get') as Promise<AppDiagnostics>,
  logDiagnostic: (message: string, details?: unknown) => ipcRenderer.invoke('diagnostics:log', message, details) as Promise<void>,
  retryHotkeys: () => ipcRenderer.invoke('hotkeys:retry') as Promise<HotkeyDiagnostic[]>,
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
  detectClientLogPath: () => ipcRenderer.invoke('settings:detect-client-log') as Promise<ClientLogDiscoveryResult>,
  updateSettings: (settings: AppSettings) => ipcRenderer.invoke('settings:update', settings) as Promise<AppSettings>
});
