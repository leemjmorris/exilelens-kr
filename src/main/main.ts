import { app, BrowserWindow, clipboard, ipcMain, Menu, nativeImage, screen, shell, Tray } from 'electron';
import { existsSync, appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createOverlayWindow, type OverlayPanel } from './windows/overlayWindow';
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

let questWindow: BrowserWindow | null = null;
let tradeWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let areaWatcher: AreaWatcher | null = null;
let questProgress: QuestProgress = { completedObjectiveIds: {} };
let appSettings: AppSettings = normalizeAppSettings(undefined);
let hotkeyRegistrations: HotkeyRegistrationResult[] = [];
let lastAreaState: AreaDetectionState = getDemoAreaDetection();
let boundsSaveTimer: NodeJS.Timeout | null = null;

type PanelBoundsStore = Partial<Record<OverlayPanel, Electron.Rectangle>>;

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

function getPanelWindow(panel: OverlayPanel): BrowserWindow | null {
  return panel === 'quest' ? questWindow : tradeWindow;
}

function getWindowPanel(win: BrowserWindow): OverlayPanel | null {
  if (win === questWindow) return 'quest';
  if (win === tradeWindow) return 'trade';
  return null;
}

function getSenderWindow(event: Electron.IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender);
}

function sendToOverlayWindows(channel: string, ...args: unknown[]): void {
  for (const win of [questWindow, tradeWindow]) {
    if (win != null && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }
}

function sendAreaDetected(state: AreaDetectionState): void {
  if (appSettings.manualAreaOverrideId != null && state.detectedFrom !== 'manual_override') return;
  lastAreaState = state;
  writeAppLog('area detected', state);
  sendToOverlayWindows('quest:area-detected', state);
}

function sendEffectiveAreaDetected(): void {
  const manualArea = buildManualAreaOverride(areaDefinitions, appSettings.manualAreaOverrideId);
  sendAreaDetected(manualArea ?? lastAreaState ?? getDemoAreaDetection());
}

function setWindowClickThrough(win: BrowserWindow | null, enabled: boolean): void {
  if (win == null || win.isDestroyed()) return;
  win.setIgnoreMouseEvents(enabled, { forward: true });
  writeAppLog('overlay click-through changed', { panel: getWindowPanel(win), enabled });
}

function hideWindow(win: BrowserWindow | null): void {
  if (win == null || win.isDestroyed()) return;
  win.setSkipTaskbar(true);
  win.hide();
  setWindowClickThrough(win, true);
  updateTrayMenu();
}

function hidePanel(panel: OverlayPanel): void {
  hideWindow(getPanelWindow(panel));
}

function hideAllOverlays(): void {
  hidePanel('quest');
  hidePanel('trade');
}

function resizeWindowBy(win: BrowserWindow | null, deltaX: number, deltaY: number): void {
  if (win == null || win.isDestroyed()) return;
  const panel = getWindowPanel(win);
  const bounds = win.getBounds();
  const minWidth = panel === 'trade' ? 480 : 380;
  const minHeight = panel === 'trade' ? 420 : 460;
  const nextBounds = {
    ...bounds,
    width: Math.max(minWidth, Math.round(bounds.width + deltaX)),
    height: Math.max(minHeight, Math.round(bounds.height + deltaY))
  };
  win.setBounds(nextBounds);
  schedulePanelBoundsSave();
}

function showPanelPassive(panel: OverlayPanel): void {
  const win = getPanelWindow(panel);
  if (win == null || win.isDestroyed()) return;

  if (panel === 'quest') {
    win.setAlwaysOnTop(true, 'screen-saver');
  }

  win.setSkipTaskbar(false);
  win.showInactive();
  win.moveTop();
  setWindowClickThrough(win, true);
  updateTrayMenu();
}

function showQuestOverlay(): void {
  showPanelPassive('quest');
}

function showTradeOverlay(): void {
  showPanelPassive('trade');
}

function toggleQuestOverlay(): void {
  if (questWindow?.isVisible()) {
    hidePanel('quest');
    return;
  }
  showQuestOverlay();
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
  const questVisible = questWindow?.isVisible() === true;
  const tradeVisible = tradeWindow?.isVisible() === true;
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: questVisible ? '퀘스트 오버레이 숨기기' : '퀘스트 오버레이 열기',
      click: () => {
        if (questVisible) hidePanel('quest');
        else showQuestOverlay();
      }
    },
    {
      label: tradeVisible ? '시세 오버레이 숨기기' : '시세 오버레이 열기',
      click: () => {
        if (tradeVisible) hidePanel('trade');
        else showTradeOverlay();
      }
    },
    { label: '전체 오버레이 숨기기', click: hideAllOverlays },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() }
  ]));
}

function createAppTray(): void {
  if (tray != null) return;
  tray = new Tray(createTrayIconImage());
  tray.setToolTip('ExileLens KR 실행 중');
  tray.on('click', () => showQuestOverlay());
  updateTrayMenu();
  writeAppLog('system tray initialized');
}

function getBoundsStorePath(): string {
  return join(app.getPath('userData'), 'panel-bounds.json');
}

function loadPanelBounds(): PanelBoundsStore {
  try {
    const parsed = JSON.parse(readFileSync(getBoundsStorePath(), 'utf8')) as PanelBoundsStore;
    return {
      quest: parsed.quest != null ? ensureBoundsOnDisplay(parsed.quest) : undefined,
      trade: parsed.trade != null ? ensureBoundsOnDisplay(parsed.trade) : undefined
    };
  } catch {
    return {};
  }
}

function savePanelBounds(): void {
  const bounds: PanelBoundsStore = {};
  if (questWindow != null && !questWindow.isDestroyed()) bounds.quest = questWindow.getBounds();
  if (tradeWindow != null && !tradeWindow.isDestroyed()) bounds.trade = tradeWindow.getBounds();
  try {
    writeFileSync(getBoundsStorePath(), JSON.stringify(bounds, null, 2), 'utf8');
  } catch (error) {
    writeAppLog('failed to save panel bounds', serializeError(error));
  }
}

function schedulePanelBoundsSave(): void {
  if (boundsSaveTimer != null) clearTimeout(boundsSaveTimer);
  boundsSaveTimer = setTimeout(() => {
    boundsSaveTimer = null;
    savePanelBounds();
  }, 300);
}

function ensureBoundsOnDisplay(bounds: Electron.Rectangle): Electron.Rectangle {
  const displays = screen.getAllDisplays();
  const intersects = displays.some((display) => rectanglesIntersect(bounds, display.workArea));
  if (intersects) return bounds;
  const primary = screen.getPrimaryDisplay().workArea;
  return {
    width: Math.min(bounds.width, primary.width),
    height: Math.min(bounds.height, primary.height),
    x: primary.x + 40,
    y: primary.y + 40
  };
}

function rectanglesIntersect(left: Electron.Rectangle, right: Electron.Rectangle): boolean {
  return left.x < right.x + right.width && left.x + left.width > right.x && left.y < right.y + right.height && left.y + left.height > right.y;
}

function attachPanelWindowLifecycle(win: BrowserWindow, panel: OverlayPanel): void {
  win.on('show', updateTrayMenu);
  win.on('hide', updateTrayMenu);
  win.on('moved', schedulePanelBoundsSave);
  win.on('resized', schedulePanelBoundsSave);
  win.webContents.once('did-finish-load', () => {
    writeAppLog('renderer finished load; sending initial state', { panel, appSettings, lastAreaState });
    win.webContents.send('quest:progress', questProgress);
    win.webContents.send('settings:changed', appSettings);
    win.webContents.send('quest:area-detected', lastAreaState);
  });
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
    toggleOverlay: toggleQuestOverlay,
    showQuestOverlay,
    showItemOverlay: showTradeOverlay
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

  const panelBounds = loadPanelBounds();
  questWindow = createOverlayWindow({ panel: 'quest', bounds: panelBounds.quest });
  tradeWindow = createOverlayWindow({ panel: 'trade', bounds: panelBounds.trade });
  attachPanelWindowLifecycle(questWindow, 'quest');
  attachPanelWindowLifecycle(tradeWindow, 'trade');
  createAppTray();

  registerOverlayHotkeys();

  ipcMain.handle('overlay:show', (event) => {
    const sender = getSenderWindow(event);
    const panel = sender != null ? getWindowPanel(sender) : null;
    showPanelPassive(panel ?? 'quest');
  });
  ipcMain.handle('overlay:hide', (event) => hideWindow(getSenderWindow(event)));
  ipcMain.handle('overlay:resize-by', (event, deltaX: number, deltaY: number) => resizeWindowBy(getSenderWindow(event), deltaX, deltaY));
  ipcMain.handle('overlay:set-click-through', (event, enabled: boolean) => setWindowClickThrough(getSenderWindow(event), enabled));
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
        hidePanel('trade');
        await wait(120);
        await requestCopy();
        await wait(120);
        showTradeOverlay();
      }
    });
  });
  ipcMain.handle('trade:search-official', (_event, item: ParsedItemText) => searchOfficialTrade(item, appSettings.league));
  ipcMain.handle('trade:get-leagues', () => fetchPoe2TradeLeagues());
  ipcMain.handle('settings:update', async (_event, nextSettings: AppSettings) => {
    appSettings = normalizeSettingsForKnownAreas(nextSettings);
    await settingsStore.save(appSettings);
    startAreaWatcher(appSettings);
    sendToOverlayWindows('settings:changed', appSettings);
    sendEffectiveAreaDetected();
    return appSettings;
  });
  ipcMain.handle('quest:get-progress', () => questProgress);
  ipcMain.handle('quest:update-progress', async (_event, nextProgress: QuestProgress) => {
    questProgress = normalizeManualQuestProgress(nextProgress);
    await progressStore.save(questProgress);
    sendToOverlayWindows('quest:progress', questProgress);
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
    showQuestOverlay();
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
  // Resident tray app: keep running even when all overlay windows are hidden/closed.
});

app.on('activate', () => {
  showQuestOverlay();
});

app.on('will-quit', () => {
  areaWatcher?.stop();
  savePanelBounds();
  // globalShortcut cleanup is handled in registerHotkeys
});

export const preloadPath = join(__dirname, '../preload/index.cjs');
