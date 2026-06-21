export type AppMode = 'demo' | 'client_log' | 'manual_override';

export interface HotkeyDiagnostic {
  accelerator: string;
  action: 'toggleOverlay' | 'showItemOverlay' | 'showQuestOverlay' | 'showQuestDetailOverlay';
  registered: boolean;
}

export interface AppDiagnostics {
  appVersion: string;
  userDataPath: string;
  mode: AppMode;
  safety: {
    globalShortcuts: string[];
    hotkeys: HotkeyDiagnostic[];
    escapeRegisteredGlobally: false;
    noMemoryOrPacketAutomation: true;
    noClickOrTradeAutomation: true;
  };
}
