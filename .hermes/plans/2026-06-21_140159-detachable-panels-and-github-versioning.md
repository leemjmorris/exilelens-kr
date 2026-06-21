# Detachable Panels and GitHub Versioning Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn ExileLens KR from one combined overlay window into one tray-managed app with separately movable Trade and Quest Guide panels whose positions/sizes are remembered per user, then initialize GitHub-backed version control and CI/release workflow.

**Architecture:** Keep one Electron main process, tray, hotkey registry, settings store, and shared preload API. Split the current single overlay window into feature-specific BrowserWindows: a Trade panel, a Quest Guide panel, and optionally a small Settings/Control panel. Persist per-panel bounds and visibility preferences in app settings, and route F6/tray/hotkeys to feature windows instead of a single route inside one window.

**Tech Stack:** Electron, electron-vite, React, TypeScript, Vitest, electron-builder, Git/GitHub, GitHub Actions.

---

## Product Interpretation

The user request means:

1. ExileLens KR remains **one installed/running program** with one system tray icon and one background process.
2. Trade and Quest Guide become **separate functional panels**, not just tabs in one panel.
3. Users can move panels to fit their monitor/POE2 UI layout.
4. Panel bounds are remembered across app restarts.
5. F6/hotkeys/tray should open the right panels without forcing trade and quest UI to share one rectangle.
6. GitHub becomes the source of truth for version management, CI, releases, and future issue tracking.

---

## Current Context

Relevant current files:

- `src/main/windows/overlayWindow.ts`
  - Creates one frameless transparent `BrowserWindow` at `1000x720`.
  - `show: false`, `alwaysOnTop: true`, `skipTaskbar: true`.
- `src/main/main.ts`
  - Holds single `overlayWindow` global.
  - F6 toggles that single window.
  - Tray menu opens routes inside that single window via `navigateOverlay(route)`.
  - IPC handlers are registered in this file.
- `src/renderer/App.tsx`
  - Uses `Route = 'item' | 'quest' | 'settings'`.
  - Renders tabs/buttons inside one `.overlay-shell`.
  - `ItemPanel`, `QuestPanel`, and `SettingsPanel` are all in the same file.
- `src/shared/settings/appSettings.ts`
  - Current settings: `clientLogPath`, `demoMode`, `league`, `manualAreaOverrideId`.
  - No panel bounds/preferences yet.
- `src/main/settings/settingsStore.ts`
  - JSON settings persistence.
- `src/preload/index.ts`
  - Exposes IPC bridge under `window.exileLens`.
- `tests/safety/staticSafety.test.ts`
  - Has guardrails for tray/taskbar behavior, single scroller, click-through, etc.

Important existing UX constraints:

- Game input should remain pass-through outside overlay panels.
- Completion state must not be inferred from current/furthest area.
- Tray icon should always exist while app is running.
- Visible overlay/panel should appear in taskbar; hidden panel should not.
- Escape must not be registered as a global shortcut.

---

## High-Level Design

### Window model

Replace the single `overlayWindow` concept with a small panel registry:

```ts
type PanelId = 'trade' | 'quest' | 'settings';

interface PanelWindowState {
  id: PanelId;
  window: BrowserWindow;
}
```

Initial implementation should create:

- `tradeWindow` for item/trade search UI.
- `questWindow` for campaign/quest guide UI.
- `settingsWindow` optional, or keep settings embedded in a control window/tray action for the first pass.

Recommended MVP:

```text
Trade panel: separate window
Quest Guide panel: separate window
Settings panel: separate window or opened inside Quest panel initially
```

Best long-term structure:

```text
ExileLens KR tray app
├─ Trade panel window
├─ Quest Guide panel window
└─ Settings/Diagnostics panel window
```

### Renderer routing model

Instead of one app route changing tabs inside one window, load the same renderer with a panel query parameter:

```text
index.html?panel=trade
index.html?panel=quest
index.html?panel=settings
```

Renderer reads the panel id and renders only that feature:

```ts
type PanelId = 'trade' | 'quest' | 'settings';
```

This avoids duplicating renderer bundles while still producing separate windows.

### Bounds persistence

Add settings shape:

```ts
export type PanelId = 'trade' | 'quest' | 'settings';

export interface PanelBounds {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface PanelPreferences {
  bounds?: PanelBounds;
  visible?: boolean;
  skipTaskbarWhenHidden?: boolean;
}

export interface AppSettings {
  clientLogPath: string;
  demoMode: boolean;
  league: string;
  manualAreaOverrideId?: string;
  panels: Record<PanelId, PanelPreferences>;
}
```

Save bounds on:

- `move`
- `resize`
- `close`/`hide`

Use debounce to avoid excessive writes.

### Dragging

Because panels are frameless, add drag regions:

```css
.overlay-header {
  -webkit-app-region: drag;
}

.overlay-header button,
.overlay-header nav,
button,
input,
select,
textarea,
a {
  -webkit-app-region: no-drag;
}
```

This lets users drag panels by the top bar without implementing custom mouse IPC.

### GitHub/versioning

The directory is currently not a git repository. Initialize git locally, create `.gitignore`, commit the current working baseline, then create/push a GitHub repository.

Use `gh` if authenticated; otherwise ask the user to authenticate or provide a token/choose repo visibility.

---

## Open Questions Before Implementation

Ask/confirm only if needed during execution:

1. GitHub repo visibility:
   - Recommended default: private while prototyping, public later.
2. Repository name:
   - Suggested: `exilelens-kr`.
3. Separate settings panel:
   - MVP can keep Settings as its own small panel; recommended.
4. Initial panel positions:
   - Suggested defaults:
     - Quest: right side, `520x720`.
     - Trade: left/center, `560x640`.
     - Settings: center, `760x640`.
5. Should F6 toggle both last-used panel and taskbar state, or only Quest by default?
   - Recommended: F6 toggles Quest Guide. Dedicated hotkeys open Trade/Quest.

---

# Implementation Tasks

## Phase 0 — Baseline and GitHub setup

### Task 1: Create git repository and baseline ignore rules

**Objective:** Start local version control without pushing anything yet.

**Files:**
- Create: `.gitignore`
- Modify: none

**Step 1: Check current repo state**

Run:

```bash
git status --short
```

Expected: currently fails with `not a git repository`.

**Step 2: Create `.gitignore`**

Create `.gitignore` with:

```gitignore
node_modules/
out/
release/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.*
!.env.example
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode/
.idea/
```

Do **not** ignore:

```text
package-lock.json
tests/
scripts/
docs/
.hermes/plans/
```

**Step 3: Initialize repo**

Run:

```bash
git init
git branch -M main
git add -A
git commit -m "chore: initial ExileLens KR baseline"
```

Expected: first commit created.

**Step 4: Verify**

Run:

```bash
git status --short
git log --oneline -1
```

Expected:

```text
working tree clean
<sha> chore: initial ExileLens KR baseline
```

---

### Task 2: Add CI scripts before GitHub push

**Objective:** Add one repeatable command for local and GitHub CI.

**Files:**
- Modify: `package.json`

**Step 1: Add scripts**

Add:

```json
{
  "scripts": {
    "ci": "npm run typecheck && npm test && npm run build && npm run package:smoke",
    "audit:low": "npm audit --audit-level=low",
    "dist:smoke": "npm run dist && npm run package:smoke"
  }
}
```

Keep existing scripts unchanged.

**Step 2: Run verification**

Run:

```bash
npm run ci
npm run audit:low
```

Expected: all pass.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add CI verification scripts"
```

---

### Task 3: Create GitHub Actions workflow

**Objective:** Ensure every push/PR runs typecheck, tests, build, and package smoke.

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: windows-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: Package smoke
        run: npm run package:smoke
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Windows verification workflow"
```

---

### Task 4: Create and push GitHub repo

**Objective:** Connect local repo to GitHub.

**Files:**
- No code files.

**Step 1: Check GitHub auth**

Run:

```bash
gh auth status
```

If not authenticated, run:

```bash
gh auth login
```

Use browser login.

**Step 2: Create repo**

Recommended private repo while prototyping:

```bash
gh repo create exilelens-kr --private --source . --remote origin --push
```

If user explicitly wants public:

```bash
gh repo create exilelens-kr --public --source . --remote origin --push
```

**Step 3: Verify**

Run:

```bash
git remote -v
gh repo view --web
```

Expected: GitHub repo opens and CI starts.

---

## Phase 1 — Panel settings and bounds model

### Task 5: Add shared panel settings types

**Objective:** Add typed persisted settings for per-panel bounds and visibility.

**Files:**
- Modify: `src/shared/settings/appSettings.ts`
- Test: `tests/settings/appSettings.test.ts`

**Step 1: Write tests**

Add tests for:

```ts
it('normalizes missing panel preferences with defaults', () => { ... });
it('normalizes invalid panel bounds back to defaults', () => { ... });
it('preserves valid panel bounds', () => { ... });
```

Expected default shape:

```ts
panels: {
  trade: { bounds: { width: 560, height: 640 } },
  quest: { bounds: { width: 520, height: 720 } },
  settings: { bounds: { width: 760, height: 640 } }
}
```

**Step 2: Implement types**

Add:

```ts
export type PanelId = 'trade' | 'quest' | 'settings';

export interface PanelBounds {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface PanelPreferences {
  bounds: PanelBounds;
  visible: boolean;
}
```

Extend `AppSettings`:

```ts
panels: Record<PanelId, PanelPreferences>;
```

**Step 3: Add normalizers**

Implement:

```ts
export function normalizePanelBounds(input: Partial<PanelBounds> | null | undefined, fallback: PanelBounds): PanelBounds
export function normalizePanelPreferences(...)
export function normalizePanels(...)
```

Rules:

- Width min: `320`.
- Height min: `240`.
- X/Y optional numbers only.
- Unknown panel keys ignored.
- Missing panels get defaults.

**Step 4: Run tests**

```bash
npm test -- tests/settings/appSettings.test.ts
npm run typecheck
```

**Step 5: Commit**

```bash
git add src/shared/settings/appSettings.ts tests/settings/appSettings.test.ts
git commit -m "feat: add persisted panel preferences"
```

---

### Task 6: Make settings store writes atomic

**Objective:** Reduce risk of corrupted settings as panel bounds are saved frequently.

**Files:**
- Modify: `src/main/settings/settingsStore.ts`
- Modify: `src/main/poe/questProgressStore.ts`
- Test: create or update storage tests if present.

**Step 1: Add helper**

Create:

```ts
async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  const tmpPath = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmpPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tmpPath, path);
}
```

**Step 2: Use helper in settings and progress stores**

Replace direct `writeFile` calls.

**Step 3: Verify**

```bash
npm run typecheck
npm test
```

**Step 4: Commit**

```bash
git add src/main/settings/settingsStore.ts src/main/poe/questProgressStore.ts tests
git commit -m "fix: write settings and progress atomically"
```

---

## Phase 2 — Multi-window panel registry

### Task 7: Replace single overlay window factory with panel-aware window factory

**Objective:** Create a reusable factory for trade/quest/settings windows.

**Files:**
- Replace or modify: `src/main/windows/overlayWindow.ts`
- Create: `src/main/windows/panelWindow.ts` if cleaner
- Test: `tests/safety/staticSafety.test.ts`

**Step 1: Create panel window options**

```ts
import type { PanelBounds, PanelId } from '../../shared/settings/appSettings';

export interface CreatePanelWindowOptions {
  panelId: PanelId;
  bounds: PanelBounds;
}
```

**Step 2: Implement `createPanelWindow`**

Behavior:

- `show: false`
- `skipTaskbar: true`
- `frame: false`
- `transparent: true`
- `alwaysOnTop: true`
- Apply persisted `x`, `y`, `width`, `height`.
- Load renderer with `?panel=<panelId>`.

Pseudo-code:

```ts
export function createPanelWindow({ panelId, bounds }: CreatePanelWindowOptions): BrowserWindow {
  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
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

  const panelQuery = `?panel=${encodeURIComponent(panelId)}`;
  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(`${process.env.ELECTRON_RENDERER_URL}${panelQuery}`);
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'), { query: { panel: panelId } });
  }

  return win;
}
```

**Step 3: Update static safety tests**

Ensure tests look for panel window creation rather than only `createOverlayWindow`.

**Step 4: Verify**

```bash
npm run typecheck
npm test -- tests/safety/staticSafety.test.ts
```

**Step 5: Commit**

```bash
git add src/main/windows tests/safety/staticSafety.test.ts
git commit -m "feat: add panel-aware window factory"
```

---

### Task 8: Add main-process panel registry

**Objective:** Replace `overlayWindow` singleton with panel registry and show/hide helpers per panel.

**Files:**
- Modify: `src/main/main.ts`

**Step 1: Define registry**

```ts
type PanelWindows = Partial<Record<PanelId, BrowserWindow>>;
const panelWindows: PanelWindows = {};
```

**Step 2: Add helpers**

```ts
function getPanelWindow(panelId: PanelId): BrowserWindow | null
function ensurePanelWindow(panelId: PanelId): BrowserWindow
function showPanel(panelId: PanelId): void
function hidePanel(panelId: PanelId): void
function togglePanel(panelId: PanelId): void
function hideAllPanels(): void
```

Rules:

- Visible panel: `setSkipTaskbar(false)`, `showInactive()`, `moveTop()`.
- Hidden panel: `setSkipTaskbar(true)`, `hide()`, click-through true.
- Tray remains always visible.

**Step 3: Replace existing usages**

Current functions to update:

- `showOverlayPassive()` → `showPanel('quest')` or generic wrapper.
- `toggleOverlay()` → `togglePanel('quest')`.
- `navigateOverlay('item')` → `showPanel('trade')`.
- `navigateOverlay('quest')` → `showPanel('quest')`.
- `overlay:hide` IPC → hide sender panel if possible; otherwise hide all.
- `overlay:set-click-through` → apply to sender panel or active panel.

**Step 4: Keep initial state**

App startup should create tray and maybe create windows lazily.

Recommended MVP:

- Lazy-create panels on first open to reduce startup noise.
- Or create all hidden panels at startup for easier IPC state replay.

Prefer create all hidden initially for simpler state sync.

**Step 5: Verify**

```bash
npm run typecheck
npm test
```

**Step 6: Commit**

```bash
git add src/main/main.ts
git commit -m "feat: manage trade and quest as separate panel windows"
```

---

### Task 9: Persist panel bounds from main process

**Objective:** Remember each panel’s position/size after the user moves/resizes it.

**Files:**
- Modify: `src/main/main.ts`
- Modify: `src/shared/settings/appSettings.ts` if needed
- Test: settings tests / static tests

**Step 1: Add debounced bounds save**

In main process:

```ts
const boundsSaveTimers: Partial<Record<PanelId, NodeJS.Timeout>> = {};

function schedulePanelBoundsSave(panelId: PanelId, win: BrowserWindow): void {
  clearTimeout(boundsSaveTimers[panelId]);
  boundsSaveTimers[panelId] = setTimeout(async () => {
    const bounds = win.getBounds();
    appSettings = normalizeSettingsForKnownAreas({
      ...appSettings,
      panels: {
        ...appSettings.panels,
        [panelId]: {
          ...appSettings.panels[panelId],
          bounds
        }
      }
    });
    await settingsStore.save(appSettings);
    overlayWindowOrPanelsSendSettingsChanged();
  }, 300);
}
```

Implementation detail: `settingsStore` currently local to `createApp`; either:

- Store it in module-level `settingsStore` variable, or
- Register handlers inside `createApp` with closure access.

**Step 2: Hook events**

For each panel window:

```ts
win.on('move', () => schedulePanelBoundsSave(panelId, win));
win.on('resize', () => schedulePanelBoundsSave(panelId, win));
```

**Step 3: Save visible state**

On show/hide:

```ts
panels[panelId].visible = win.isVisible();
```

Do not auto-open visible panels on app start yet unless user asks; start hidden to avoid surprise.

**Step 4: Screen bounds safety**

When restoring bounds:

- If saved x/y are off-screen, center on primary display.
- Use Electron `screen.getDisplayMatching` or `screen.getPrimaryDisplay()`.

**Step 5: Verify manually**

1. Open Quest panel.
2. Drag to a new location.
3. Hide app.
4. Quit from tray.
5. Start app again.
6. Press F6.
7. Expected: Quest panel opens at saved location.

**Step 6: Commit**

```bash
git add src/main/main.ts src/shared/settings/appSettings.ts tests
git commit -m "feat: persist panel bounds"
```

---

## Phase 3 — Renderer split into independent panels

### Task 10: Add panel-id detection in renderer

**Objective:** Render one feature per window based on URL query.

**Files:**
- Modify: `src/renderer/App.tsx`
- Test: optional pure helper test if extracted

**Step 1: Add helper**

```ts
function getInitialPanelId(): PanelId {
  const value = new URLSearchParams(window.location.search).get('panel');
  return value === 'trade' || value === 'quest' || value === 'settings' ? value : 'quest';
}
```

**Step 2: Replace `Route` with `PanelId` for initial split**

Current:

```ts
type Route = 'item' | 'quest' | 'settings';
```

New:

```ts
import type { PanelId } from '../shared/settings/appSettings';
```

Map old item route to `trade`.

**Step 3: Render only the selected panel**

For trade panel:

```tsx
<PanelShell panelId="trade" title="시세" subtitle="아이템 시세 검색">
  <ItemPanel settings={settings} />
</PanelShell>
```

For quest:

```tsx
<PanelShell panelId="quest" title="퀘스트 가이드" subtitle="캠페인 체크리스트">
  <QuestPanel ... />
</PanelShell>
```

For settings:

```tsx
<PanelShell panelId="settings" title="설정" subtitle="ExileLens KR 설정">
  <SettingsPanel ... />
</PanelShell>
```

**Step 4: Remove tab navigation from panel header**

Panel header should contain:

- Title.
- Drag handle area.
- Optional buttons:
  - `시세 열기`
  - `퀘스트 열기`
  - `설정`
  - `숨기기`

But clicking “시세 열기” should open the other window, not change route inside this window.

This likely needs new preload IPC:

```ts
showPanel(panelId: PanelId): Promise<void>
hideCurrentPanel(): Promise<void>
```

**Step 5: Verify**

Run dev or packaged app:

- Open Quest with F6.
- Open Trade from tray or hotkey.
- Both windows can exist separately.
- Hiding one does not hide the other unless “hide all” is selected.

**Step 6: Commit**

```bash
git add src/renderer/App.tsx src/preload/index.ts src/shared/settings/appSettings.ts
git commit -m "feat: render trade and quest as independent panels"
```

---

### Task 11: Extract large panels into separate components

**Objective:** Make the codebase maintainable after panel split.

**Files:**
- Create: `src/renderer/components/PanelShell.tsx`
- Create: `src/renderer/panels/TradePanel.tsx`
- Create: `src/renderer/panels/QuestPanel.tsx`
- Create: `src/renderer/panels/SettingsPanel.tsx`
- Modify: `src/renderer/App.tsx`

**Step 1: Move `ItemPanel` to `TradePanel.tsx`**

Rename user-facing component from Item to Trade where appropriate:

```ts
export function TradePanel({ settings }: { settings: AppSettings }): React.ReactElement
```

**Step 2: Move `QuestPanel` and related components**

Move these functions together:

- `QuestPanel`
- `AllAreaProgressBoard`
- `AreaProgressCard`
- `QuestStatusList`
- `ChecklistGroup`
- `formatActLabel`

**Step 3: Move `SettingsPanel`**

Move settings/diagnostics components together.

**Step 4: Keep `App.tsx` as composition root only**

Target `App.tsx` length: under 250 lines.

**Step 5: Verify**

```bash
npm run typecheck
npm test
npm run build
```

**Step 6: Commit**

```bash
git add src/renderer
git commit -m "refactor: split renderer panels into focused modules"
```

---

## Phase 4 — Hotkeys, tray, and taskbar policy

### Task 12: Update hotkey behavior for independent panels

**Objective:** Make hotkeys match the new panel model.

**Files:**
- Modify: `src/main/hotkeys/registerHotkeys.ts`
- Modify: `src/main/main.ts`
- Modify: tests under `tests/main/registerHotkeys.test.ts`

**Recommended mapping:**

```text
F6: toggle Quest Guide panel
Ctrl+Shift+Q: show Quest Guide panel
Ctrl+Shift+D: show Trade panel
Alt+Q / Alt+D: legacy aliases if already present
```

**Step 1: Update tests**

Assert callbacks are called:

- `toggleQuestPanel`
- `showQuestPanel`
- `showTradePanel`

**Step 2: Update implementation**

Rename callback interface from overlay route language to panel language.

**Step 3: Verify**

```bash
npm test -- tests/main/registerHotkeys.test.ts
npm run typecheck
```

**Step 4: Commit**

```bash
git add src/main/hotkeys/registerHotkeys.ts src/main/main.ts tests/main/registerHotkeys.test.ts
git commit -m "feat: route hotkeys to independent panels"
```

---

### Task 13: Update tray menu for independent panels

**Objective:** Give users direct tray control over Trade, Quest, Settings, and hide all.

**Files:**
- Modify: `src/main/main.ts`
- Test: `tests/safety/staticSafety.test.ts`

**Tray menu target:**

```text
퀘스트 가이드 열기/숨기기
시세 패널 열기/숨기기
설정 열기
모든 패널 숨기기
---
종료
```

**Step 1: Update `updateTrayMenu()`**

Use each panel visibility state.

**Step 2: Add static test**

Assert source contains menu labels or helper names:

```ts
expect(mainSource).toContain('모든 패널 숨기기');
expect(mainSource).toContain("showPanel('quest')");
expect(mainSource).toContain("showPanel('trade')");
```

**Step 3: Verify**

```bash
npm test -- tests/safety/staticSafety.test.ts
```

**Step 4: Commit**

```bash
git add src/main/main.ts tests/safety/staticSafety.test.ts
git commit -m "feat: add tray controls for independent panels"
```

---

## Phase 5 — Drag/resize polish and click-through safety

### Task 14: Add draggable headers and resize handles/policy

**Objective:** Make panels naturally movable and optionally resizable.

**Files:**
- Modify: `src/renderer/styles/globals.css`
- Modify: `src/renderer/components/PanelShell.tsx`
- Modify: `src/main/windows/panelWindow.ts`

**Step 1: Add CSS drag region**

```css
.panel-shell-header {
  -webkit-app-region: drag;
  cursor: move;
}

.panel-shell-header button,
.panel-shell-header nav,
button,
input,
select,
textarea,
a,
[data-no-drag='true'] {
  -webkit-app-region: no-drag;
}
```

**Step 2: Decide resize policy**

MVP option:

```ts
resizable: true
minWidth: 360
minHeight: 320
```

Because frameless Windows resize affordance can be subtle, add a small CSS hint:

```css
.panel-resize-hint {
  position: absolute;
  right: 8px;
  bottom: 8px;
  pointer-events: none;
}
```

**Step 3: Verify manually**

- Drag Trade panel by header.
- Drag Quest panel by header.
- Buttons still clickable.
- Inputs/selects still usable.
- Bounds save after move/resize.

**Step 4: Commit**

```bash
git add src/renderer src/main/windows
git commit -m "feat: add draggable resizable panel chrome"
```

---

### Task 15: Revisit click-through policy for independent panels

**Objective:** Keep POE2 playable while allowing panel movement and scrolling.

**Files:**
- Modify: `src/renderer/App.tsx` or `PanelShell.tsx`
- Modify: `src/main/main.ts`
- Test: `tests/safety/staticSafety.test.ts`

**Policy:**

- Outside every panel: click-through.
- Inside a visible panel: panel receives pointer/wheel input.
- Optional future setting: “game input priority mode”.

**Step 1: Ensure pointer detection is per-window**

Current renderer checks `.overlay-shell`. After split, use `.panel-shell`.

```ts
return target.closest('.panel-shell') != null;
```

**Step 2: Apply click-through to the sender panel**

Currently `setOverlayClickThrough` applies to a single `overlayWindow`. New implementation should know which `webContents` sent the IPC event:

```ts
ipcMain.handle('overlay:set-click-through', (event, enabled: boolean) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.setIgnoreMouseEvents(enabled, { forward: true });
});
```

**Step 3: Verify**

- Quest panel can scroll anywhere inside panel.
- Game clicks pass through outside panel.
- Trade panel input fields still work.
- Moving a panel does not permanently disable click-through.

**Step 4: Commit**

```bash
git add src/main/main.ts src/renderer tests/safety/staticSafety.test.ts
git commit -m "fix: apply click-through per panel window"
```

---

## Phase 6 — Settings UI for panel management

### Task 16: Add panel layout controls to Settings

**Objective:** Let users reset/move/manage panels if they lose a window off-screen.

**Files:**
- Modify: `src/renderer/panels/SettingsPanel.tsx`
- Modify: `src/preload/index.ts`
- Modify: `src/main/main.ts`

**Controls:**

```text
패널 위치 초기화
퀘스트 패널 열기
시세 패널 열기
모든 패널 숨기기
표시 중 작업표시줄에 보이기: on/off future setting
```

**Step 1: Add preload APIs**

```ts
showPanel(panelId: PanelId): Promise<void>;
hidePanel(panelId: PanelId): Promise<void>;
resetPanelBounds(panelId?: PanelId): Promise<AppSettings>;
```

**Step 2: Add main IPC handlers**

Implement reset by deleting saved bounds and re-centering panel.

**Step 3: Add Settings buttons**

Make sure buttons have `data-no-drag="true"` or are inside no-drag region.

**Step 4: Verify**

- Move Quest far away.
- Click reset from settings.
- Quest reopens in default safe location.

**Step 5: Commit**

```bash
git add src/main/main.ts src/preload/index.ts src/renderer/panels/SettingsPanel.tsx
git commit -m "feat: add panel layout controls"
```

---

## Phase 7 — Documentation and release workflow

### Task 17: Update README usage docs

**Objective:** Document separate panels, dragging, tray, hotkeys, and GitHub workflow.

**Files:**
- Modify: `README.md`
- Modify: `docs/mvp-validation.md` if needed

**Content to add:**

```markdown
## Panel layout

- F6 toggles Quest Guide.
- Ctrl+Shift+D opens Trade.
- Ctrl+Shift+Q opens Quest Guide.
- Drag any panel by its top bar.
- Panel positions are saved automatically.
- Use tray menu or Settings → Reset Panel Positions if a panel is off-screen.
```

Also document:

```text
GitHub repo
CI status
Release zip path
Safety policy
```

**Step 2: Commit**

```bash
git add README.md docs
git commit -m "docs: describe independent panels and layout persistence"
```

---

### Task 18: Add release checklist and version tags

**Objective:** Make future versions reproducible.

**Files:**
- Create: `docs/release-checklist.md`
- Modify: `package.json` if version bump scripts are desired

**Checklist content:**

```markdown
# Release Checklist

1. npm ci
2. npm run ci
3. npm run audit:low
4. npm run dist:smoke
5. Verify packaged app launches
6. Verify tray icon
7. Verify F6 Quest panel
8. Verify Ctrl+Shift+D Trade panel
9. Verify panel bounds persist after restart
10. git tag vX.Y.Z
11. gh release create vX.Y.Z release/ExileLens\ KR-X.Y.Z-x64.zip --generate-notes
```

**Step 2: Commit**

```bash
git add docs/release-checklist.md package.json
git commit -m "docs: add release checklist"
```

---

## Validation Matrix

Run after implementation phases:

```bash
npm run typecheck
npm test
npm run build
npm run package:smoke
npm run package
npm run dist
npm run package:smoke
npm audit --audit-level=low
```

Manual validation:

1. Start packaged app.
2. Confirm tray icon appears while no panel is visible.
3. Press F6.
   - Quest panel appears.
   - Quest panel appears in taskbar.
4. Drag Quest panel to a new location.
5. Press F6 again.
   - Quest panel hides.
   - Taskbar entry disappears.
   - Tray remains.
6. Press F6 again.
   - Quest panel reappears at saved location.
7. Open Trade panel via tray or `Ctrl+Shift+D`.
   - Trade appears independently from Quest.
8. Move Trade panel separately.
9. Restart app.
10. Open both panels.
    - Each restores its own saved bounds.
11. Verify click-through:
    - Outside panels: game receives clicks.
    - Inside panels: panel scroll/click works.
12. Verify Settings reset can recover off-screen panels.

---

## Risks and Tradeoffs

### Risk: multiple windows complicate IPC state replay

Mitigation:

- Broadcast settings/progress/area updates to all panel windows.
- Add helper:

```ts
function sendToAllPanels(channel: string, payload: unknown): void
```

### Risk: click-through per window becomes confusing

Mitigation:

- Apply `setIgnoreMouseEvents` to the sender window using `BrowserWindow.fromWebContents(event.sender)`.
- Keep transparent areas pass-through.
- Add diagnostics if a panel is stuck in click-through mode.

### Risk: hidden panels still consume memory

Mitigation:

- Hidden windows are acceptable for MVP.
- Later optimize by lazy creating/destroying panels.

### Risk: saved bounds can be off-screen after monitor changes

Mitigation:

- Validate bounds against Electron `screen.getAllDisplays()` before applying.
- Add Settings button to reset panel positions.

### Risk: GitHub auth unavailable

Mitigation:

- Initialize local git and commits first.
- If `gh auth status` fails, stop and ask user to authenticate.
- Do not embed tokens in repo or logs.

---

## Recommended Execution Order

1. Local git baseline.
2. CI scripts and GitHub Actions.
3. GitHub repo creation/push.
4. Panel settings model.
5. Atomic settings writes.
6. Panel window factory.
7. Main-process panel registry.
8. Bounds persistence.
9. Renderer panel split.
10. Component extraction.
11. Hotkeys/tray update.
12. Drag/resize polish.
13. Settings reset controls.
14. README/release docs.
15. Package and manual validation.

---

## Definition of Done

This project stage is done when:

- GitHub repo exists and current code is pushed to `main`.
- GitHub Actions CI passes on `main`.
- Quest Guide and Trade are separate windows/panels.
- Each panel can be moved by the user.
- Each panel remembers position and size across restart.
- Hiding a panel removes it from taskbar.
- App tray remains visible while app runs.
- F6 toggles Quest Guide without affecting Trade panel unexpectedly.
- Trade hotkey/tray action opens Trade panel independently.
- All automated tests pass.
- Packaged app manual validation passes.
