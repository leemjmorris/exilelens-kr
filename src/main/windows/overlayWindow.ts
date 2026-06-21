import { BrowserWindow } from 'electron';
import { join } from 'node:path';

export function createOverlayWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1000,
    height: 720,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('ExileLens KR renderer process gone', details);
    if (!win.isDestroyed()) {
      void win.reload();
    }
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('ExileLens KR renderer load failed', { errorCode, errorDescription, validatedURL });
  });

  win.on('closed', () => {
    console.warn('ExileLens KR overlay window closed');
  });

  return win;
}
