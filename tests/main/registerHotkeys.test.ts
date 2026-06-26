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

const EXPECTED_HOTKEYS = ['F6', 'Ctrl+Shift+Q', 'Alt+Q'];

describe('registerHotkeys', () => {
  it('registers only act-guide overlay hotkeys and never trade/detail/global Escape hotkeys', () => {
    const registrar = createRegistrar();

    const results = registerHotkeys(
      {
        toggleOverlay: vi.fn(),
        showGuideOverlay: vi.fn()
      },
      registrar
    );

    expect(registrar.registered).toEqual(EXPECTED_HOTKEYS);
    expect(registrar.registered).not.toContain('Escape');
    expect(registrar.registered).not.toContain('Ctrl+Shift+D');
    expect(registrar.registered).not.toContain('Alt+D');
    expect(registrar.registered).not.toContain('Alt+O');
    expect(results).toEqual([
      { accelerator: 'F6', action: 'toggleOverlay', registered: true },
      { accelerator: 'Ctrl+Shift+Q', action: 'showGuideOverlay', registered: true },
      { accelerator: 'Alt+Q', action: 'showGuideOverlay', registered: true }
    ]);
  });

  it('reports failed hotkey registrations for diagnostics instead of silently ignoring them', () => {
    const registrar = createRegistrar((accelerator) => accelerator !== 'Ctrl+Shift+Q');

    const results = registerHotkeys(
      {
        toggleOverlay: vi.fn(),
        showGuideOverlay: vi.fn()
      },
      registrar
    );

    expect(results.find((result) => result.accelerator === 'Ctrl+Shift+Q')?.registered).toBe(false);
  });
});
