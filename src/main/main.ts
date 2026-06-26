import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray } from 'electron';
import { existsSync, appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createOverlayWindow, type OverlayPanel } from './windows/overlayWindow';
import { registerHotkeys, type HotkeyRegistrationResult } from './hotkeys/registerHotkeys';
import { createAreaWatcher, type AreaWatcher } from './poe/areaWatcher';
import { extractCharacterNamesFromClientLogLines } from './poe/characterDiscovery';
import { readRecentClientLogLines } from './poe/clientLog';
import { createQuestProgressStore } from './poe/questProgressStore';
import { createSettingsStore } from './settings/settingsStore';
import { areaDefinitions, areaChecklists, getDemoAreaDetection } from '../shared/quests/data';
import { buildManualAreaOverride, normalizeManualAreaOverrideId } from '../shared/quests/areaSelection';
import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import type { QuestProgress } from '../shared/quests/checklist';
import { createEmptyQuestProgress } from '../shared/quests/checklist';
import { applyQuestEvidenceToProgress, type QuestEvidence } from '../shared/quests/questEvidence';
import {
  createEmptyCharacterProgressState,
  createOrSelectCharacter,
  getActiveCharacterProgress,
  mergeDiscoveredCharacterNames,
  updateActiveCharacterProgress,
  type CharacterProgressState
} from '../shared/characters/characterProgress';
import { normalizeAppSettings, shouldWatchClientLog, type AppSettings } from '../shared/settings/appSettings';
import { buildClientLogPathCandidates, type ClientLogDiscoveryResult } from '../shared/settings/clientLogDiscovery';
import type { AppDiagnostics, AppMode } from '../shared/diagnostics/appDiagnostics';

let guideWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let areaWatcher: AreaWatcher | null = null;
let characterProgressState: CharacterProgressState = createEmptyCharacterProgressState();
let saveQuestProgress: ((progress: CharacterProgressState) => Promise<void>) | null = null;
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
  if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack ?? '' };
  return { name: 'NonError', message: String(error), stack: '' };
}

function getPanelWindow(_panel: OverlayPanel): BrowserWindow | null {
  return guideWindow;
}

function getGuideWindow(): BrowserWindow | null {
  return guideWindow != null && !guideWindow.isDestroyed() ? guideWindow : null;
}

function getAllOverlayWindows(): BrowserWindow[] {
  const win = getGuideWindow();
  return win == null ? [] : [win];
}

function getWindowPanel(win: BrowserWindow): OverlayPanel | null {
  return win === guideWindow ? 'guide' : null;
}

function getSenderWindow(event: Electron.IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender);
}

function sendToOverlayWindows(channel: string, ...args: unknown[]): void {
  for (const win of getAllOverlayWindows()) win.webContents.send(channel, ...args);
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

async function handleQuestEvidence(evidence: QuestEvidence[]): Promise<void> {
  const activeProgress = getActiveProgressOrEmpty();
  const nextProgress = applyQuestEvidenceToProgress(activeProgress, areaChecklists, evidence);
  if (safeStringify(nextProgress) === safeStringify(activeProgress)) return;

  characterProgressState = updateActiveCharacterProgress(characterProgressState, nextProgress);
  await saveQuestProgress?.(characterProgressState);
  writeAppLog('quest progress auto-completed from Client.txt evidence', {
    activeCharacterId: characterProgressState.activeCharacterId,
    evidenceCount: evidence.length,
    completedObjectiveIds: nextProgress.completedObjectiveIds
  });
  sendCharacterState();
}

function getActiveProgressOrEmpty(): QuestProgress {
  return getActiveCharacterProgress(characterProgressState) ?? createEmptyQuestProgress();
}

function sendCharacterState(): void {
  sendToOverlayWindows('character:state', characterProgressState);
  sendToOverlayWindows('quest:progress', getActiveProgressOrEmpty());
}

async function scanCharactersFromClientLog(): Promise<CharacterProgressState> {
  if (!shouldWatchClientLog(appSettings)) return characterProgressState;
  try {
    const lines = await readRecentClientLogLines(appSettings.clientLogPath, 2 * 1024 * 1024);
    const names = extractCharacterNamesFromClientLogLines(lines);
    characterProgressState = mergeDiscoveredCharacterNames(characterProgressState, names);
    await saveQuestProgress?.(characterProgressState);
    writeAppLog('character discovery scan completed', { found: names.length, discoveredCharacterNames: characterProgressState.discoveredCharacterNames ?? [] });
    sendCharacterState();
    return characterProgressState;
  } catch (error) {
    characterProgressState = mergeDiscoveredCharacterNames(characterProgressState, []);
    await saveQuestProgress?.(characterProgressState);
    writeAppLog('character discovery scan failed', serializeError(error));
    sendCharacterState();
    return characterProgressState;
  }
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

function hideGuideOverlay(): void {
  hideWindow(guideWindow);
}

function resizeWindowBy(win: BrowserWindow | null, deltaX: number, deltaY: number): void {
  if (win == null || win.isDestroyed()) return;
  const bounds = win.getBounds();
  win.setBounds({
    ...bounds,
    width: Math.max(320, Math.round(bounds.width + deltaX)),
    height: Math.max(260, Math.round(bounds.height + deltaY))
  });
  schedulePanelBoundsSave();
}

function moveWindowBy(win: BrowserWindow | null, deltaX: number, deltaY: number): void {
  if (win == null || win.isDestroyed()) return;
  const bounds = win.getBounds();
  win.setBounds({ ...bounds, x: Math.round(bounds.x + deltaX), y: Math.round(bounds.y + deltaY) });
  schedulePanelBoundsSave();
}

function showGuideOverlay(): void {
  const win = getGuideWindow();
  if (win == null) return;
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setSkipTaskbar(false);
  win.showInactive();
  win.moveTop();
  setWindowClickThrough(win, true);
  updateTrayMenu();
}

function toggleQuestOverlay(): void {
  const win = getGuideWindow();
  if (win?.isVisible()) hideGuideOverlay();
  else showGuideOverlay();
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
  const guideVisible = guideWindow?.isVisible() === true;
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: guideVisible ? '액트 가이드 숨기기' : '액트 가이드 열기',
      click: () => {
        if (guideVisible) hideGuideOverlay();
        else showGuideOverlay();
      }
    },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() }
  ]));
}

function createAppTray(): void {
  if (tray != null) return;
  tray = new Tray(createTrayIconImage());
  tray.setToolTip('ExileLens KR 액트 가이드 실행 중');
  tray.on('click', () => showGuideOverlay());
  updateTrayMenu();
  writeAppLog('system tray initialized');
}

function getBoundsStorePath(): string {
  return join(app.getPath('userData'), 'panel-bounds.json');
}

function loadPanelBounds(): PanelBoundsStore {
  try {
    const parsed = JSON.parse(readFileSync(getBoundsStorePath(), 'utf8')) as PanelBoundsStore;
    return { guide: parsed.guide != null ? ensureBoundsOnDisplay(parsed.guide) : undefined };
  } catch {
    return {};
  }
}

function savePanelBounds(): void {
  const bounds: PanelBoundsStore = {};
  if (guideWindow != null && !guideWindow.isDestroyed()) bounds.guide = guideWindow.getBounds();
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

function getInitialPanelBounds(stored: PanelBoundsStore): Partial<Electron.Rectangle> | undefined {
  if (stored.guide != null) return stored.guide;
  const workArea = screen.getPrimaryDisplay().workArea;
  return { x: workArea.x + 36, y: workArea.y + 120 };
}

function attachPanelWindowLifecycle(win: BrowserWindow, panel: OverlayPanel): void {
  win.on('show', updateTrayMenu);
  win.on('hide', updateTrayMenu);
  win.on('moved', schedulePanelBoundsSave);
  win.on('resized', schedulePanelBoundsSave);
  win.webContents.once('did-finish-load', () => {
    writeAppLog('renderer finished load; sending initial state', { panel, appSettings, lastAreaState });
    win.webContents.send('character:state', characterProgressState);
    win.webContents.send('quest:progress', getActiveProgressOrEmpty());
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

  return { clientLogPath: candidates.find((candidate) => existsSync(candidate)) ?? '', candidates };
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

  if (settings.manualAreaOverrideId != null || !shouldWatchClientLog(settings)) {
    sendEffectiveAreaDetected();
    return;
  }

  areaWatcher = createAreaWatcher({
    clientLogPath: settings.clientLogPath,
    areas: areaDefinitions,
    pollIntervalMs: 1000,
    fromBeginning: false,
    onAreaDetected: sendAreaDetected,
    onQuestEvidence: (evidence) => void handleQuestEvidence(evidence).catch((error) => writeAppLog('quest evidence handler error', serializeError(error))),
    onError: (error) => writeAppLog('Client.txt watcher error', serializeError(error))
  });
  areaWatcher.start();
}

function registerOverlayHotkeys(): HotkeyRegistrationResult[] {
  hotkeyRegistrations = registerHotkeys({
    toggleOverlay: toggleQuestOverlay,
    showGuideOverlay
  });

  const failed = hotkeyRegistrations.filter((result) => !result.registered);
  if (failed.length > 0) console.warn('ExileLens KR hotkey registration failed', failed);
  return hotkeyRegistrations;
}

async function createApp(): Promise<void> {
  const progressStore = createQuestProgressStore(app.getPath('userData'));
  saveQuestProgress = progressStore.save;
  const settingsStore = createSettingsStore(app.getPath('userData'));
  characterProgressState = await progressStore.load();
  const storedSettings = await settingsStore.load();
  const defaultClientLogPath = resolveDefaultClientLogPath();
  const shouldUseAutoDetectedClientLog = storedSettings.clientLogPath.length === 0 && defaultClientLogPath.length > 0;
  appSettings = normalizeSettingsForKnownAreas({
    ...storedSettings,
    clientLogPath: storedSettings.clientLogPath || defaultClientLogPath,
    demoMode: shouldUseAutoDetectedClientLog ? false : storedSettings.demoMode
  });

  await progressStore.save(characterProgressState);

  const panelBounds = loadPanelBounds();
  guideWindow = createOverlayWindow({ panel: 'guide', bounds: getInitialPanelBounds(panelBounds) });
  attachPanelWindowLifecycle(guideWindow, 'guide');
  createAppTray();
  registerOverlayHotkeys();

  ipcMain.handle('overlay:show', () => showGuideOverlay());
  ipcMain.handle('overlay:hide', (event) => hideWindow(getSenderWindow(event) ?? guideWindow));
  ipcMain.handle('overlay:resize-by', (event, deltaX: number, deltaY: number) => resizeWindowBy(getSenderWindow(event) ?? guideWindow, deltaX, deltaY));
  ipcMain.handle('overlay:move-by', (event, deltaX: number, deltaY: number) => moveWindowBy(getSenderWindow(event) ?? guideWindow, deltaX, deltaY));
  ipcMain.handle('overlay:set-click-through', (event, enabled: boolean) => setWindowClickThrough(getSenderWindow(event) ?? guideWindow, enabled));
  ipcMain.handle('settings:get', () => appSettings);
  ipcMain.handle('settings:detect-client-log', () => discoverClientLogPath());
  ipcMain.handle('diagnostics:get', () => buildDiagnostics());
  ipcMain.handle('diagnostics:log', (_event, message: string, details?: unknown) => writeAppLog(`renderer: ${message}`, details));
  ipcMain.handle('hotkeys:retry', () => registerOverlayHotkeys());
  ipcMain.handle('settings:update', async (_event, nextSettings: AppSettings) => {
    appSettings = normalizeSettingsForKnownAreas(nextSettings);
    await settingsStore.save(appSettings);
    startAreaWatcher(appSettings);
    sendToOverlayWindows('settings:changed', appSettings);
    sendEffectiveAreaDetected();
    return appSettings;
  });
  ipcMain.handle('character:get-state', () => characterProgressState);
  ipcMain.handle('character:rescan', () => scanCharactersFromClientLog());
  ipcMain.handle('character:create-or-select', async (_event, name: string) => {
    characterProgressState = createOrSelectCharacter(characterProgressState, name);
    await progressStore.save(characterProgressState);
    sendCharacterState();
    return characterProgressState;
  });
  ipcMain.handle('quest:get-progress', () => getActiveProgressOrEmpty());
  ipcMain.handle('quest:update-progress', async (_event, nextProgress: QuestProgress) => {
    characterProgressState = updateActiveCharacterProgress(characterProgressState, nextProgress);
    await progressStore.save(characterProgressState);
    sendCharacterState();
    return getActiveProgressOrEmpty();
  });

  startAreaWatcher(appSettings);
  void scanCharactersFromClientLog();
}

function normalizeSettingsForKnownAreas(settings: Partial<AppSettings> | null | undefined): AppSettings {
  const normalized = normalizeAppSettings(settings);
  return { ...normalized, manualAreaOverrideId: normalizeManualAreaOverrideId(areaDefinitions, normalized.manualAreaOverrideId) };
}

function buildDiagnostics(): AppDiagnostics {
  return {
    appVersion: app.getVersion(),
    userDataPath: app.getPath('userData'),
    mode: getCurrentMode(appSettings),
    safety: {
      globalShortcuts: ['F6', 'Ctrl+Shift+Q', 'Alt+Q'],
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
  app.on('second-instance', () => showGuideOverlay());

  app.whenReady().then(createApp).catch((error) => {
    writeAppLog('failed to start', serializeError(error));
    app.quit();
  });
}

process.on('uncaughtException', (error) => writeAppLog('uncaught exception', serializeError(error)));
process.on('unhandledRejection', (reason) => writeAppLog('unhandled rejection', reason instanceof Error ? serializeError(reason) : { reason: String(reason) }));

app.on('window-all-closed', () => {
  // Resident tray app: keep running even when the guide window is hidden/closed.
});

app.on('activate', () => showGuideOverlay());

app.on('will-quit', () => {
  areaWatcher?.stop();
  savePanelBounds();
  // globalShortcut cleanup is handled in registerHotkeys
});

export const preloadPath = join(__dirname, '../preload/index.cjs');
