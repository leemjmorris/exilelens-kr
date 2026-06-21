import { BrowserWindow, type Rectangle } from 'electron';
import { join } from 'node:path';

export type OverlayPanel = 'quest-area' | 'quest-required' | 'quest-optional' | 'quest-detail' | 'trade';

export interface OverlayPanelWindowOptions {
  panel: OverlayPanel;
  bounds?: Partial<Rectangle>;
}

const DEFAULT_BOUNDS: Record<OverlayPanel, Pick<Rectangle, 'width' | 'height'>> = {
  'quest-area': { width: 260, height: 112 },
  'quest-required': { width: 420, height: 220 },
  'quest-optional': { width: 420, height: 180 },
  'quest-detail': { width: 720, height: 760 },
  trade: { width: 720, height: 680 }
};

function isQuestPanel(panel: OverlayPanel): boolean {
  return panel.startsWith('quest-');
}

export function createOverlayWindow(options: OverlayPanelWindowOptions): BrowserWindow {
  const defaults = DEFAULT_BOUNDS[options.panel];
  const isHudPanel = options.panel === 'quest-area' || options.panel === 'quest-required' || options.panel === 'quest-optional';
  const win = new BrowserWindow({
    width: options.bounds?.width ?? defaults.width,
    height: options.bounds?.height ?? defaults.height,
    x: options.bounds?.x,
    y: options.bounds?.y,
    minWidth: isHudPanel ? 180 : options.panel === 'trade' ? 480 : 380,
    minHeight: isHudPanel ? 72 : options.panel === 'trade' ? 420 : 460,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    alwaysOnTop: isQuestPanel(options.panel),
    skipTaskbar: true,
    title: options.panel === 'trade' ? 'ExileLens KR - Trade' : 'ExileLens KR - Quests',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isQuestPanel(options.panel)) {
    win.setAlwaysOnTop(true, 'screen-saver');
  }

  if (process.env.ELECTRON_RENDERER_URL) {
    const url = new URL(process.env.ELECTRON_RENDERER_URL);
    url.searchParams.set('panel', options.panel);
    void win.loadURL(url.toString());
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'), { query: { panel: options.panel } });
  }

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('ExileLens KR renderer process gone', { panel: options.panel, details });
    if (!win.isDestroyed()) {
      void win.reload();
    }
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('ExileLens KR renderer load failed', { panel: options.panel, errorCode, errorDescription, validatedURL });
  });

  win.on('closed', () => {
    console.warn('ExileLens KR overlay window closed', options.panel);
  });

  return win;
}
