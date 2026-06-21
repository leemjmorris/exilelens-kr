import { globalShortcut } from 'electron';

export interface ShortcutRegistrar {
  unregisterAll: () => void;
  register: (accelerator: string, callback: () => void) => boolean;
}

export type HotkeyAction = 'toggleOverlay' | 'showItemOverlay' | 'showQuestOverlay' | 'showQuestDetailOverlay';

export interface HotkeyRegistrationResult {
  accelerator: string;
  action: HotkeyAction;
  registered: boolean;
}

interface HotkeyHandlers {
  toggleOverlay: () => void;
  showItemOverlay: () => void;
  showQuestOverlay: () => void;
  showQuestDetailOverlay: () => void;
}

// Primary hotkeys follow the lower-conflict patterns used by other POE2 overlays.
// Legacy Alt aliases stay registered as fallbacks while users get used to the new defaults.
const HOTKEYS: Array<{ accelerator: string; action: HotkeyAction }> = [
  { accelerator: 'F6', action: 'toggleOverlay' },
  { accelerator: 'Ctrl+Shift+D', action: 'showItemOverlay' },
  { accelerator: 'Ctrl+Shift+Q', action: 'showQuestOverlay' },
  { accelerator: 'Alt+O', action: 'showQuestDetailOverlay' },
  { accelerator: 'Alt+D', action: 'showItemOverlay' },
  { accelerator: 'Alt+Q', action: 'showQuestOverlay' }
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
