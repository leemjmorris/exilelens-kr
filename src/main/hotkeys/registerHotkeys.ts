import { globalShortcut } from 'electron';

export interface ShortcutRegistrar {
  unregisterAll: () => void;
  register: (accelerator: string, callback: () => void) => boolean;
}

export type HotkeyAction = 'toggleOverlay' | 'showGuideOverlay';

export interface HotkeyRegistrationResult {
  accelerator: string;
  action: HotkeyAction;
  registered: boolean;
}

interface HotkeyHandlers {
  toggleOverlay: () => void;
  showGuideOverlay: () => void;
}

const HOTKEYS: Array<{ accelerator: string; action: HotkeyAction }> = [
  { accelerator: 'F6', action: 'toggleOverlay' },
  { accelerator: 'Ctrl+Shift+Q', action: 'showGuideOverlay' },
  { accelerator: 'Alt+Q', action: 'showGuideOverlay' }
];

export function registerHotkeys(
  handlers: HotkeyHandlers,
  registrar: ShortcutRegistrar = globalShortcut
): HotkeyRegistrationResult[] {
  registrar.unregisterAll();

  return HOTKEYS.map(({ accelerator, action }) => ({
    accelerator,
    action,
    registered: registrar.register(accelerator, handlers[action])
  }));
}
