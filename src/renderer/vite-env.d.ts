/// <reference types="vite/client" />

import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import type { QuestProgress } from '../shared/quests/checklist';
import type { AppSettings } from '../shared/settings/appSettings';
import type { ClientLogDiscoveryResult } from '../shared/settings/clientLogDiscovery';
import type { AppDiagnostics, HotkeyDiagnostic } from '../shared/diagnostics/appDiagnostics';
import type { CharacterProgressState } from '../shared/characters/characterProgress';

declare global {
  interface Window {
    exileLens?: {
      showOverlay: () => Promise<void>;
      hideOverlay: () => Promise<void>;
      resizeOverlayBy: (deltaX: number, deltaY: number) => Promise<void>;
      moveOverlayBy: (deltaX: number, deltaY: number) => Promise<void>;
      setOverlayClickThrough: (enabled: boolean) => Promise<void>;
      onAreaDetected: (callback: (state: AreaDetectionState) => void) => () => void;
      onQuestProgress: (callback: (progress: QuestProgress) => void) => () => void;
      onCharacterProgressState: (callback: (state: CharacterProgressState) => void) => () => void;
      onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
      getQuestProgress: () => Promise<QuestProgress>;
      updateQuestProgress: (progress: QuestProgress) => Promise<QuestProgress>;
      getCharacterProgressState: () => Promise<CharacterProgressState>;
      rescanCharacters: () => Promise<CharacterProgressState>;
      createOrSelectCharacter: (name: string) => Promise<CharacterProgressState>;
      getDiagnostics: () => Promise<AppDiagnostics>;
      logDiagnostic: (message: string, details?: unknown) => Promise<void>;
      retryHotkeys: () => Promise<HotkeyDiagnostic[]>;
      getSettings: () => Promise<AppSettings>;
      detectClientLogPath: () => Promise<ClientLogDiscoveryResult>;
      updateSettings: (settings: AppSettings) => Promise<AppSettings>;
    };
  }
}

export {};
