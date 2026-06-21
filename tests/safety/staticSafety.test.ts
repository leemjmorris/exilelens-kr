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

  it('keeps a system tray icon while toggling taskbar visibility with split overlay windows', () => {
    const mainSource = readFileSync(join(sourceRoot, 'main', 'main.ts'), 'utf8');
    const windowSource = readFileSync(join(sourceRoot, 'main', 'windows', 'overlayWindow.ts'), 'utf8');
    const appSource = readFileSync(join(sourceRoot, 'renderer', 'App.tsx'), 'utf8');
    const cssSource = readFileSync(join(sourceRoot, 'renderer', 'styles', 'globals.css'), 'utf8');

    expect(mainSource).toContain('new Tray(');
    expect(mainSource).toContain('createAppTray()');
    expect(mainSource).toContain("questWindow = createOverlayWindow({ panel: 'quest'");
    expect(mainSource).toContain("tradeWindow = createOverlayWindow({ panel: 'trade'");
    expect(mainSource).toContain('win.setSkipTaskbar(false)');
    expect(mainSource).toContain('win.setSkipTaskbar(true)');
    expect(mainSource).toContain('savePanelBounds()');
    expect(windowSource).toContain('show: false');
    expect(windowSource).toContain('skipTaskbar: true');
    expect(windowSource).toContain('resizable: true');
    expect(windowSource).toContain("alwaysOnTop: options.panel === 'quest'");
    expect(appSource).toContain("panel === 'trade'");
    expect(appSource).toContain('aria-label="시세 창 닫기"');
    expect(cssSource).toContain('-webkit-app-region: drag');
    expect(cssSource).toContain('-webkit-app-region: no-drag');
  });

  it('uses a single fixed-header content scroller in the overlay shell', () => {
    const appSource = readFileSync(join(sourceRoot, 'renderer', 'App.tsx'), 'utf8');
    const cssSource = readFileSync(join(sourceRoot, 'renderer', 'styles', 'globals.css'), 'utf8');

    expect(appSource).toContain('className="overlay-content"');
    expect(cssSource).toMatch(/\.overlay-shell\s*\{[\s\S]*overflow:\s*hidden;/);
    expect(cssSource).toMatch(/\.overlay-content\s*\{[\s\S]*overflow-y:\s*auto;/);
    expect(cssSource).not.toMatch(/\.overlay-header\s*\{[\s\S]*position:\s*sticky;/);
  });

  it('shows required and optional quest buckets in the all-area progress board', () => {
    const appSource = readFileSync(join(sourceRoot, 'renderer', 'App.tsx'), 'utf8');
    const cssSource = readFileSync(join(sourceRoot, 'renderer', 'styles', 'globals.css'), 'utf8');

    expect(appSource).toContain('필수 미완료');
    expect(appSource).toContain('선택 미완료');
    expect(appSource).toContain('필수 완료');
    expect(appSource).toContain('선택 완료');
    expect(appSource).toContain('area-progress-badges');
    expect(appSource).toContain('objective-kind required-badge');
    expect(appSource).toContain('quest-view-switch');
    expect(appSource).toContain('현재 지역 퀘스트');
    expect(appSource).toContain('전체 지역 현황');
    expect(appSource).toContain("questView === 'current'");
    expect(appSource).toContain("questView === 'all'");
    expect(cssSource).toContain('.quest-view-switch');
    expect(cssSource).toContain('.active-view');
    expect(cssSource).toContain('.required-alert');
    expect(cssSource).toContain('.optional-badge');
  });
});
