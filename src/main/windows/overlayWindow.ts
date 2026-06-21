import { BrowserWindow, type Rectangle } from 'electron';
import { join } from 'node:path';

export type OverlayPanel = 'quest' | 'trade';

export interface OverlayPanelWindowOptions {
  panel: OverlayPanel;
  bounds?: Partial<Rectangle>;
}

const DEFAULT_BOUNDS: Record<OverlayPanel, Pick<Rectangle, 'width' | 'height'>> = {
  quest: { width: 520, height: 760 },
  trade: { width: 720, height: 680 }
};

export function createOverlayWindow(options: OverlayPanelWindowOptions = { panel: 'quest' }): BrowserWindow {
  const defaults = DEFAULT_BOUNDS[options.panel];
  const win = new BrowserWindow({
    width: options.bounds?.width ?? defaults.width,
    height: options.bounds?.height ?? defaults.height,
    x: options.bounds?.x,
    y: options.bounds?.y,
    minWidth: options.panel === 'quest' ? 380 : 480,
    minHeight: options.panel === 'quest' ? 460 : 420,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    alwaysOnTop: options.panel === 'quest',
    skipTaskbar: true,
    title: options.panel === 'quest' ? 'ExileLens KR - Quests' : 'ExileLens KR - Trade',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (options.panel === 'quest') {
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
