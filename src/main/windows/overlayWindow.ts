import { BrowserWindow, type Rectangle } from 'electron';
import { join } from 'node:path';

export type OverlayPanel = 'guide';

export interface OverlayPanelWindowOptions {
  panel: OverlayPanel;
  bounds?: Partial<Rectangle>;
}

const DEFAULT_BOUNDS: Record<OverlayPanel, Pick<Rectangle, 'width' | 'height'>> = {
  guide: { width: 460, height: 560 }
};

export function createOverlayWindow(options: OverlayPanelWindowOptions): BrowserWindow {
  const defaults = DEFAULT_BOUNDS[options.panel];
  const win = new BrowserWindow({
    width: options.bounds?.width ?? defaults.width,
    height: options.bounds?.height ?? defaults.height,
    x: options.bounds?.x,
    y: options.bounds?.y,
    minWidth: 320,
    minHeight: 260,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    title: 'ExileLens KR - Act Guide',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');

  if (process.env.ELECTRON_RENDERER_URL) {
    const url = new URL(process.env.ELECTRON_RENDERER_URL);
    url.searchParams.set('panel', options.panel);
    void win.loadURL(url.toString());
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'), { query: { panel: options.panel } });
  }

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('ExileLens KR renderer process gone', { panel: options.panel, details });
    if (!win.isDestroyed()) void win.reload();
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('ExileLens KR renderer load failed', { panel: options.panel, errorCode, errorDescription, validatedURL });
  });

  win.on('closed', () => {
    console.warn('ExileLens KR overlay window closed', options.panel);
  });

  return win;
}
