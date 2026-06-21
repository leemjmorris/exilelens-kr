import { app, BrowserWindow, clipboard, ipcMain, Menu, nativeImage, shell, Tray } from 'electron';
import { existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { createOverlayWindow } from './windows/overlayWindow';
import { registerHotkeys, type HotkeyRegistrationResult } from './hotkeys/registerHotkeys';
import { createAreaWatcher, type AreaWatcher } from './poe/areaWatcher';
import { createQuestProgressStore } from './poe/questProgressStore';
import { createSettingsStore } from './settings/settingsStore';
import { captureCopiedItemText, createElectronClipboardCaptureDeps } from './clipboard/itemClipboardCapture';
import { searchOfficialTrade } from './trade/officialTradeApi';
import { fetchPoe2TradeLeagues } from './trade/leagueApi';
import { areaDefinitions, getDemoAreaDetection } from '../shared/quests/data';
import { buildManualAreaOverride, normalizeManualAreaOverrideId } from '../shared/quests/areaSelection';
import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import type { QuestProgress } from '../shared/quests/checklist';
import { normalizeManualQuestProgress } from '../shared/quests/checklist';
import type { ParsedItemText } from '../shared/items/itemParser';
import { normalizeAppSettings, shouldWatchClientLog, type AppSettings } from '../shared/settings/appSettings';
import { buildClientLogPathCandidates, type ClientLogDiscoveryResult } from '../shared/settings/clientLogDiscovery';
import type { AppDiagnostics, AppMode } from '../shared/diagnostics/appDiagnostics';

let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let areaWatcher: AreaWatcher | null = null;
let questProgress: QuestProgress = { completedObjectiveIds: {} };
let appSettings: AppSettings = normalizeAppSettings(undefined);
let hotkeyRegistrations: HotkeyRegistrationResult[] = [];
let lastAreaState: AreaDetectionState = getDemoAreaDetection();

function writeAppLog(message: string, details?: unknown): void {
  const payload = details == null ? '' : ` ${safeStringify(details)}`;
  const line = `${new Date().toISOString()} ${message}${payload}\n`;
  try {
    appendFileSync(join(app.getPath('userData'), 'exilelens.log'), line, 'utf8');
  } catch {
    // Logging must never crash the overlay.
  }
  console.info(message, details ?? '');
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function serializeError(error: unknown): Record<string, string> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack ?? '' };
  }
  return { name: 'NonError', message: String(error), stack: '' };
}

function sendAreaDetected(state: AreaDetectionState): void {
  if (appSettings.manualAreaOverrideId != null && state.detectedFrom !== 'manual_override') return;
  lastAreaState = state;
  writeAppLog('area detected', state);
  overlayWindow?.webContents.send('quest:area-detected', state);
}

function sendEffectiveAreaDetected(): void {
  const manualArea = buildManualAreaOverride(areaDefinitions, appSettings.manualAreaOverrideId);
  sendAreaDetected(manualArea ?? lastAreaState ?? getDemoAreaDetection());
}

function setOverlayClickThrough(enabled: boolean): void {
  if (overlayWindow == null || overlayWindow.isDestroyed()) return;
  overlayWindow.setIgnoreMouseEvents(enabled, { forward: true });
  writeAppLog('overlay click-through changed', { enabled });
}

function hideOverlay(): void {
  if (overlayWindow == null || overlayWindow.isDestroyed()) return;
  overlayWindow.setSkipTaskbar(true);
  overlayWindow.hide();
  setOverlayClickThrough(true);
  updateTrayMenu();
}

function createTrayIconImage(): Electron.NativeImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="8" fill="#020617"/>
    <path d="M8 8h16v4H13v4h9v4h-9v4h12v4H8z" fill="#38bdf8"/>
    <path d="M22 6l4 4-4 4-4-4z" fill="#fbbf24"/>
  </svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`);
}

function updateTrayMenu(): void {
  if (tray == null) return;
  const overlayVisible = overlayWindow?.isVisible() === true;
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: overlayVisible ? '오버레이 숨기기' : '오버레이 열기',
      click: () => {
        if (overlayVisible) hideOverlay();
        else showOverlayPassive();
      }
    },
    { label: '퀘스트 열기', click: () => navigateOverlay('quest') },
    { label: '시세 열기', click: () => navigateOverlay('item') },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() }
  ]));
}

function createAppTray(): void {
  if (tray != null) return;
  tray = new Tray(createTrayIconImage());
  tray.setToolTip('ExileLens KR 실행 중');
  tray.on('click', () => showOverlayPassive());
  updateTrayMenu();
  writeAppLog('system tray initialized');
}

function showOverlayPassive(): void {
  // Priority: keep POE2 playable while the overlay is visible.
  // The renderer temporarily disables click-through only when the pointer is over a real control.
  if (overlayWindow == null) return;
  overlayWindow.setSkipTaskbar(false);
  overlayWindow.showInactive();
  overlayWindow.moveTop();
  setOverlayClickThrough(true);
  updateTrayMenu();
}

function toggleOverlay(): void {
  if (overlayWindow?.isVisible()) {
    hideOverlay();
    return;
  }

  showOverlayPassive();
}

function navigateOverlay(route: 'item' | 'quest' | 'settings'): void {
  showOverlayPassive();
  overlayWindow?.webContents.send('overlay:navigate', route);
}

function discoverClientLogPath(): ClientLogDiscoveryResult {
  const configured = process.env.EXILELENS_CLIENT_TXT;
  const candidates = [
    ...(configured != null && configured.trim().length > 0 ? [configured.trim()] : []),
    ...buildClientLogPathCandidates(app.getPath('documents'))
  ];

  return {
    clientLogPath: candidates.find((candidate) => existsSync(candidate)) ?? '',
    candidates
  };
}

function resolveDefaultClientLogPath(): string {
  return discoverClientLogPath().clientLogPath;
}

function stopAreaWatcher(): void {
  areaWatcher?.stop();
  areaWatcher = null;
}

function startAreaWatcher(settings: AppSettings): void {
  stopAreaWatcher();

  if (settings.manualAreaOverrideId != null) {
    sendEffectiveAreaDetected();
    return;
  }

  if (!shouldWatchClientLog(settings)) {
    sendEffectiveAreaDetected();
    return;
  }

  areaWatcher = createAreaWatcher({
    clientLogPath: settings.clientLogPath,
    areas: areaDefinitions,
    pollIntervalMs: 1000,
    fromBeginning: false,
    onAreaDetected: sendAreaDetected,
    onError: (error) => writeAppLog('Client.txt watcher error', serializeError(error))
  });
  areaWatcher.start();
}

function registerOverlayHotkeys(): HotkeyRegistrationResult[] {
  hotkeyRegistrations = registerHotkeys({
    toggleOverlay,
    showQuestOverlay: () => navigateOverlay('quest'),
    showItemOverlay: () => navigateOverlay('item')
  });

  const failed = hotkeyRegistrations.filter((result) => !result.registered);
  if (failed.length > 0) {
    console.warn('ExileLens KR hotkey registration failed', failed);
  }

  return hotkeyRegistrations;
}

async function createApp(): Promise<void> {
  const progressStore = createQuestProgressStore(app.getPath('userData'));
  const settingsStore = createSettingsStore(app.getPath('userData'));
  questProgress = await progressStore.load();
  const storedSettings = await settingsStore.load();
  const defaultClientLogPath = resolveDefaultClientLogPath();
  const shouldUseAutoDetectedClientLog = storedSettings.clientLogPath.length === 0 && defaultClientLogPath.length > 0;
  appSettings = normalizeSettingsForKnownAreas({
    ...storedSettings,
    clientLogPath: storedSettings.clientLogPath || defaultClientLogPath,
    demoMode: shouldUseAutoDetectedClientLog ? false : storedSettings.demoMode
  });

  questProgress = normalizeManualQuestProgress(questProgress);
  await progressStore.save(questProgress);

  overlayWindow = createOverlayWindow();
  createAppTray();
  overlayWindow.on('show', updateTrayMenu);
  overlayWindow.on('hide', updateTrayMenu);
  overlayWindow.webContents.once('did-finish-load', () => {
    writeAppLog('renderer finished load; sending initial state', { appSettings, lastAreaState });
    overlayWindow?.webContents.send('quest:progress', questProgress);
    overlayWindow?.webContents.send('settings:changed', appSettings);
    overlayWindow?.webContents.send('quest:area-detected', lastAreaState);
  });

  registerOverlayHotkeys();

  ipcMain.handle('overlay:show', showOverlayPassive);
  ipcMain.handle('overlay:hide', hideOverlay);
  ipcMain.handle('overlay:set-click-through', (_event, enabled: boolean) => setOverlayClickThrough(enabled));
  ipcMain.handle('external:open', async (_event, url: string) => {
    if (!isAllowedExternalUrl(url)) throw new Error('Blocked external URL');
    await shell.openExternal(url);
  });
  ipcMain.handle('clipboard:write-text', (_event, text: string) => {
    clipboard.writeText(text);
  });
  ipcMain.handle('settings:get', () => appSettings);
  ipcMain.handle('settings:detect-client-log', () => discoverClientLogPath());
  ipcMain.handle('diagnostics:get', () => buildDiagnostics());
  ipcMain.handle('diagnostics:log', (_event, message: string, details?: unknown) => writeAppLog(`renderer: ${message}`, details));
  ipcMain.handle('hotkeys:retry', () => registerOverlayHotkeys());
  ipcMain.handle('item:capture', async () => {
    const deps = createElectronClipboardCaptureDeps();
    const requestCopy = deps.requestCopy;
    return captureCopiedItemText({
      ...deps,
      requestCopy: async () => {
        hideOverlay();
        await wait(120);
        await requestCopy();
        await wait(120);
        showOverlayPassive();
      }
    });
  });
  ipcMain.handle('trade:search-official', (_event, item: ParsedItemText) => searchOfficialTrade(item, appSettings.league));
  ipcMain.handle('trade:get-leagues', () => fetchPoe2TradeLeagues());
  ipcMain.handle('settings:update', async (_event, nextSettings: AppSettings) => {
    appSettings = normalizeSettingsForKnownAreas(nextSettings);
    await settingsStore.save(appSettings);
    startAreaWatcher(appSettings);
    overlayWindow?.webContents.send('settings:changed', appSettings);
    sendEffectiveAreaDetected();
    return appSettings;
  });
  ipcMain.handle('quest:get-progress', () => questProgress);
  ipcMain.handle('quest:update-progress', async (_event, nextProgress: QuestProgress) => {
    questProgress = normalizeManualQuestProgress(nextProgress);
    await progressStore.save(questProgress);
    overlayWindow?.webContents.send('quest:progress', questProgress);
    return questProgress;
  });

  startAreaWatcher(appSettings);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeSettingsForKnownAreas(settings: Partial<AppSettings> | null | undefined): AppSettings {
  const normalized = normalizeAppSettings(settings);
  return {
    ...normalized,
    manualAreaOverrideId: normalizeManualAreaOverrideId(areaDefinitions, normalized.manualAreaOverrideId)
  };
}

function isAllowedExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'www.pathofexile.com' && parsed.pathname.startsWith('/trade2/search/poe2');
  } catch {
    return false;
  }
}

function buildDiagnostics(): AppDiagnostics {
  return {
    appVersion: app.getVersion(),
    userDataPath: app.getPath('userData'),
    mode: getCurrentMode(appSettings),
    safety: {
      globalShortcuts: ['F6', 'Ctrl+Shift+D', 'Ctrl+Shift+Q', 'Alt+O', 'Alt+D', 'Alt+Q'],
      hotkeys: hotkeyRegistrations,
      escapeRegisteredGlobally: false,
      noMemoryOrPacketAutomation: true,
      noClickOrTradeAutomation: true
    }
  };
}

function getCurrentMode(settings: AppSettings): AppMode {
  if (settings.manualAreaOverrideId != null) return 'manual_override';
  if (shouldWatchClientLog(settings)) return 'client_log';
  return 'demo';
}

app.setAppUserModelId('kr.exilelens.overlay');

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showOverlayPassive();
  });

  app.whenReady().then(createApp).catch((error) => {
    writeAppLog('failed to start', serializeError(error));
    app.quit();
  });
}

process.on('uncaughtException', (error) => {
  writeAppLog('uncaught exception', serializeError(error));
});

process.on('unhandledRejection', (reason) => {
  writeAppLog('unhandled rejection', reason instanceof Error ? serializeError(reason) : { reason: String(reason) });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createApp();
});

app.on('will-quit', () => {
  areaWatcher?.stop();
  // globalShortcut cleanup is handled in registerHotkeys
});

export const preloadPath = join(__dirname, '../preload/index.cjs');
