import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return listSourceFiles(fullPath);
    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

describe('static safety guardrails', () => {
  it('does not contain forbidden global Escape shortcut registration', () => {
    const offenders = listSourceFiles(sourceRoot).filter((file) => {
      const source = readFileSync(file, 'utf8');
      return /globalShortcut\.register\(\s*['"]Escape['"]/.test(source);
    });

    expect(offenders).toEqual([]);
  });

  it('does not contain memory, packet, click, or trade automation primitives', () => {
    const forbiddenPatterns = [
      /ReadProcessMemory/,
      /WriteProcessMemory/,
      /CreateRemoteThread/,
      /WinPcap|Npcap|pcap_/,
      /packet\s*(capture|sniff|intercept)/i,
      /auto\s*click/i,
      /mouse_event|SendInput/,
      /automateTrade|autoTrade|sendWhisper/i
    ];

    const offenders = listSourceFiles(sourceRoot).flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return forbiddenPatterns.some((pattern) => pattern.test(source)) ? [file] : [];
    });

    expect(offenders).toEqual([]);
  });

  it('requires a single-instance lock so stacked transparent overlays cannot accumulate', () => {
    const mainSource = readFileSync(join(sourceRoot, 'main', 'main.ts'), 'utf8');

    expect(mainSource).toContain('app.requestSingleInstanceLock()');
    expect(mainSource).toContain("app.on('second-instance'");
  });

  it('keeps the overlay click-through by default so the game remains playable', () => {
    const mainSource = readFileSync(join(sourceRoot, 'main', 'main.ts'), 'utf8');
    const rendererSource = readFileSync(join(sourceRoot, 'renderer', 'App.tsx'), 'utf8');

    expect(mainSource).toContain('setIgnoreMouseEvents(enabled, { forward: true })');
    expect(mainSource).toContain('showInactive()');
    expect(rendererSource).toContain('setOverlayClickThrough');
    expect(rendererSource).toContain('elementFromPoint');
  });

  it('is an act-guide-only overlay with one guide window and no trade panel', () => {
    const mainSource = readFileSync(join(sourceRoot, 'main', 'main.ts'), 'utf8');
    const windowSource = readFileSync(join(sourceRoot, 'main', 'windows', 'overlayWindow.ts'), 'utf8');
    const preloadSource = readFileSync(join(sourceRoot, 'preload', 'index.ts'), 'utf8');
    const appSource = readFileSync(join(sourceRoot, 'renderer', 'App.tsx'), 'utf8');
    const packageSource = readFileSync(join(process.cwd(), 'package.json'), 'utf8');

    expect(mainSource).toContain("guideWindow = createOverlayWindow({ panel: 'guide'");
    expect(mainSource).not.toContain('tradeWindow');
    expect(mainSource).not.toContain('questRequiredWindow');
    expect(mainSource).not.toContain('questOptionalWindow');
    expect(mainSource).not.toContain('questDetailWindow');
    expect(mainSource).not.toContain("item:capture");
    expect(mainSource).not.toContain("trade:search-official");
    expect(mainSource).not.toContain("trade:get-leagues");

    expect(windowSource).toContain("export type OverlayPanel = 'guide'");
    expect(windowSource).not.toContain("'trade'");
    expect(windowSource).not.toContain("'quest-required'");
    expect(windowSource).not.toContain("'quest-optional'");
    expect(windowSource).not.toContain("'quest-detail'");

    expect(preloadSource).not.toContain('captureItemText');
    expect(preloadSource).not.toContain('searchOfficialTrade');
    expect(preloadSource).not.toContain('getTradeLeagues');
    expect(appSource).not.toContain("panel === 'trade'");
    expect(appSource).not.toContain('시세');
    expect(appSource).not.toContain('optional');
    expect(appSource).not.toContain('선택 미완료');
    expect(appSource).toContain('액트 가이드');
    expect(appSource).toContain('캐릭터를 먼저 선택하세요');
    expect(appSource).toContain('새 캐릭터 추가');
    expect(appSource).toContain('activeCharacterId');
    expect(appSource).toContain('getCharacterProgressState');
    expect(packageSource).toContain('POE2 Korean act guide overlay for essential campaign rewards');
  });

  it('keeps a movable/resizable transparent guide HUD without app-like multi-panel chrome', () => {
    const mainSource = readFileSync(join(sourceRoot, 'main', 'main.ts'), 'utf8');
    const windowSource = readFileSync(join(sourceRoot, 'main', 'windows', 'overlayWindow.ts'), 'utf8');
    const appSource = readFileSync(join(sourceRoot, 'renderer', 'App.tsx'), 'utf8');
    const cssSource = readFileSync(join(sourceRoot, 'renderer', 'styles', 'globals.css'), 'utf8');

    expect(mainSource).toContain('new Tray(');
    expect(mainSource).toContain('createAppTray()');
    expect(mainSource).toContain('win.setSkipTaskbar(false)');
    expect(mainSource).toContain('win.setSkipTaskbar(true)');
    expect(mainSource).toContain('savePanelBounds()');
    expect(mainSource).toContain("ipcMain.handle('overlay:resize-by'");
    expect(mainSource).toContain("ipcMain.handle('overlay:move-by'");
    expect(windowSource).toContain('show: false');
    expect(windowSource).toContain('skipTaskbar: true');
    expect(windowSource).toContain('resizable: true');
    expect(windowSource).toContain('alwaysOnTop: true');
    expect(appSource).toContain('GuideResizeGrip');
    expect(appSource).toContain('resizeOverlayBy');
    expect(appSource).toContain('moveOverlayBy');
    expect(appSource).toContain('startHudMove');
    expect(appSource).toContain('guide-hud-shell');
    expect(appSource).toContain('guide-objective-list');
    expect(cssSource).toContain('.guide-hud-shell');
    expect(cssSource).toContain('backdrop-filter: blur(16px) saturate(128%)');
    expect(cssSource).toContain('cursor: move');
    expect(cssSource).toContain('.guide-resize-grip');
    expect(cssSource).toContain('cursor: nwse-resize');
  });
});
