import { describe, expect, it, vi } from 'vitest';
import { registerHotkeys, type ShortcutRegistrar } from '../../src/main/hotkeys/registerHotkeys';

function createRegistrar(registerImpl?: (accelerator: string) => boolean): ShortcutRegistrar & { registered: string[] } {
  const registered: string[] = [];
  return {
    registered,
    unregisterAll: vi.fn(),
    register: vi.fn((accelerator: string) => {
      registered.push(accelerator);
      return registerImpl?.(accelerator) ?? true;
    })
  };
}

const EXPECTED_HOTKEYS = ['F6', 'Ctrl+Shift+D', 'Ctrl+Shift+Q', 'Alt+O', 'Alt+D', 'Alt+Q'];

describe('registerHotkeys', () => {
  it('registers click-equivalent overlay hotkeys and never Escape globally', () => {
    const registrar = createRegistrar();

    const results = registerHotkeys(
      {
        toggleOverlay: vi.fn(),
        showItemOverlay: vi.fn(),
        showQuestOverlay: vi.fn(),
        showQuestDetailOverlay: vi.fn()
      },
      registrar
    );

    expect(registrar.registered).toEqual(EXPECTED_HOTKEYS);
    expect(registrar.registered).not.toContain('Escape');
    expect(results).toEqual([
      { accelerator: 'F6', action: 'toggleOverlay', registered: true },
      { accelerator: 'Ctrl+Shift+D', action: 'showItemOverlay', registered: true },
      { accelerator: 'Ctrl+Shift+Q', action: 'showQuestOverlay', registered: true },
      { accelerator: 'Alt+O', action: 'showQuestDetailOverlay', registered: true },
      { accelerator: 'Alt+D', action: 'showItemOverlay', registered: true },
      { accelerator: 'Alt+Q', action: 'showQuestOverlay', registered: true }
    ]);
  });

  it('reports failed hotkey registrations for diagnostics instead of silently ignoring them', () => {
    const registrar = createRegistrar((accelerator) => accelerator !== 'Ctrl+Shift+Q');

    const results = registerHotkeys(
      {
        toggleOverlay: vi.fn(),
        showItemOverlay: vi.fn(),
        showQuestOverlay: vi.fn(),
        showQuestDetailOverlay: vi.fn()
      },
      registrar
    );

    expect(results.find((result) => result.accelerator === 'Ctrl+Shift+Q')?.registered).toBe(false);
  });
});
