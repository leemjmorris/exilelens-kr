import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import {
  createEmptyQuestProgress,
  isObjectiveCompleted,
  toggleObjectiveCompletion,
  type AreaChecklist,
  type ChecklistObjective,
  type QuestProgress
} from '../shared/quests/checklist';
import { areaDefinitions, areaChecklists, findChecklistForArea, getDemoAreaDetection } from '../shared/quests/data';
import { buildManualAreaOverride, listAvailableAreasByAct } from '../shared/quests/areaSelection';
import { DEFAULT_APP_SETTINGS, normalizeAppSettings, type AppSettings } from '../shared/settings/appSettings';
import type { AppDiagnostics } from '../shared/diagnostics/appDiagnostics';
import {
  createEmptyCharacterProgressState,
  createOrSelectCharacter as createOrSelectCharacterLocally,
  getActiveCharacterProgress,
  isCharacterOnboardingRequired,
  type CharacterProgressState
} from '../shared/characters/characterProgress';
import './styles/globals.css';

const LOCAL_PROGRESS_KEY = 'exilelens.questProgress';

function App(): React.ReactElement {
  const [currentArea, setCurrentArea] = useState<AreaDetectionState>(getDemoAreaDetection());
  const [progress, setProgress] = useState<QuestProgress>(() => loadLocalProgress());
  const [characterState, setCharacterState] = useState<CharacterProgressState>(() => createEmptyCharacterProgressState());
  const [newCharacterName, setNewCharacterName] = useState('');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [diagnostics, setDiagnostics] = useState<AppDiagnostics | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    function handleWindowError(event: ErrorEvent): void {
      void window.exileLens?.logDiagnostic?.('window error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error instanceof Error ? event.error.stack : undefined
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent): void {
      const reason = event.reason;
      void window.exileLens?.logDiagnostic?.('unhandled rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined
      });
    }

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    let lastClickThrough: boolean | null = null;
    let scheduled = false;

    function shouldCaptureOverlayPointer(clientX: number, clientY: number): boolean {
      const target = document.elementFromPoint(clientX, clientY);
      if (!(target instanceof Element)) return false;
      return target.closest('.guide-hud-shell') != null;
    }

    function applyClickThrough(nextClickThrough: boolean): void {
      if (lastClickThrough === nextClickThrough) return;
      lastClickThrough = nextClickThrough;
      void window.exileLens?.setOverlayClickThrough?.(nextClickThrough);
    }

    function handlePointerMove(event: PointerEvent): void {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        applyClickThrough(!shouldCaptureOverlayPointer(event.clientX, event.clientY));
      });
    }

    function handlePointerLeave(): void {
      applyClickThrough(true);
    }

    applyClickThrough(true);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      void window.exileLens?.setOverlayClickThrough?.(true);
    };
  }, []);

  useEffect(() => {
    function handleOverlayKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      void window.exileLens?.hideOverlay?.();
    }

    window.addEventListener('keydown', handleOverlayKeyDown);
    return () => window.removeEventListener('keydown', handleOverlayKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribeArea = window.exileLens?.onAreaDetected((state) => setCurrentArea(state));
    const unsubscribeProgress = window.exileLens?.onQuestProgress((nextProgress) => {
      setProgress(nextProgress);
      saveLocalProgress(nextProgress);
    });
    const unsubscribeCharacterState = window.exileLens?.onCharacterProgressState((nextState) => {
      setCharacterState(nextState);
      const activeProgress = getActiveCharacterProgress(nextState);
      if (activeProgress != null) {
        setProgress(activeProgress);
        saveLocalProgress(activeProgress);
      }
    });
    const unsubscribeSettings = window.exileLens?.onSettingsChanged((nextSettings) => {
      const normalized = normalizeAppSettings(nextSettings);
      setSettings(normalized);
      const manualArea = buildManualAreaOverride(areaDefinitions, normalized.manualAreaOverrideId);
      if (manualArea != null) setCurrentArea(manualArea);
    });

    void window.exileLens?.getQuestProgress?.().then((nextProgress) => {
      setProgress(nextProgress);
      saveLocalProgress(nextProgress);
    });

    void window.exileLens?.getCharacterProgressState?.().then((nextState) => {
      setCharacterState(nextState);
      const activeProgress = getActiveCharacterProgress(nextState);
      if (activeProgress != null) {
        setProgress(activeProgress);
        saveLocalProgress(activeProgress);
      }
    });

    void window.exileLens?.getSettings?.().then((nextSettings) => {
      const normalized = normalizeAppSettings(nextSettings);
      setSettings(normalized);
      const manualArea = buildManualAreaOverride(areaDefinitions, normalized.manualAreaOverrideId);
      if (manualArea != null) setCurrentArea(manualArea);
    });

    void window.exileLens?.getDiagnostics?.().then((nextDiagnostics) => setDiagnostics(nextDiagnostics));

    return () => {
      unsubscribeArea?.();
      unsubscribeProgress?.();
      unsubscribeCharacterState?.();
      unsubscribeSettings?.();
    };
  }, []);

  const checklist = useMemo(() => findChecklistForArea(currentArea.areaId), [currentArea.areaId]);
  const currentObjectives = checklist?.objectives ?? [];
  const allEssentialRows = useMemo(() => buildEssentialRows(areaChecklists), []);
  const incompleteTotal = allEssentialRows.filter((row) => !isObjectiveCompleted(progress, row.areaId, row.objective.id)).length;
  const completedTotal = allEssentialRows.length - incompleteTotal;
  const onboardingRequired = isCharacterOnboardingRequired(characterState);
  const activeCharacter = characterState.activeCharacterId != null ? characterState.characters[characterState.activeCharacterId] : undefined;
  const characterList = Object.values(characterState.characters);

  async function toggleObjective(areaId: string, objectiveId: string): Promise<void> {
    const nextProgress = toggleObjectiveCompletion(progress, areaId, objectiveId);
    setProgress(nextProgress);
    saveLocalProgress(nextProgress);
    const persisted = await window.exileLens?.updateQuestProgress?.(nextProgress);
    if (persisted != null) {
      setProgress(persisted);
      saveLocalProgress(persisted);
    }
  }

  async function createOrSelectCharacter(name: string): Promise<void> {
    try {
      const optimistic = createOrSelectCharacterLocally(characterState, name);
      setCharacterState(optimistic);
      const optimisticProgress = getActiveCharacterProgress(optimistic) ?? createEmptyQuestProgress();
      setProgress(optimisticProgress);
      saveLocalProgress(optimisticProgress);
      const persisted = await window.exileLens?.createOrSelectCharacter?.(name);
      if (persisted != null) {
        setCharacterState(persisted);
        const activeProgress = getActiveCharacterProgress(persisted) ?? createEmptyQuestProgress();
        setProgress(activeProgress);
        saveLocalProgress(activeProgress);
      }
      setNewCharacterName('');
      setStatus(`${name.trim()} 캐릭터 선택됨`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '캐릭터 선택 실패');
    }
  }

  async function saveSettings(nextSettings: AppSettings): Promise<void> {
    const normalized = normalizeAppSettings(nextSettings);
    setSettings(normalized);
    setStatus('저장 중...');
    const persisted = await window.exileLens?.updateSettings?.(normalized);
    setSettings(normalizeAppSettings(persisted ?? normalized));
    const nextDiagnostics = await window.exileLens?.getDiagnostics?.();
    if (nextDiagnostics != null) setDiagnostics(nextDiagnostics);
    setStatus('저장됨');
  }

  async function setManualAreaOverride(areaId: string): Promise<void> {
    const manualArea = buildManualAreaOverride(areaDefinitions, areaId);
    if (manualArea == null) return;
    setCurrentArea(manualArea);
    await saveSettings({ ...settings, manualAreaOverrideId: manualArea.areaId });
    setStatus(`${manualArea.areaNameKo ?? '선택 지역'} 수동 보정 저장됨`);
  }

  async function restoreAutomaticAreaDetection(): Promise<void> {
    setCurrentArea(getDemoAreaDetection());
    await saveSettings({ ...settings, manualAreaOverrideId: undefined });
    setStatus(settings.demoMode ? '데모 감지로 복귀' : 'Client.txt 자동 감지로 복귀');
  }

  function startHudMove(event: React.PointerEvent<HTMLElement>): void {
    if (event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('button, input, select, textarea, a, .objective, .guide-resize-grip, [data-no-hud-drag="true"]') != null) return;

    event.preventDefault();
    const startX = event.screenX;
    const startY = event.screenY;
    let lastX = startX;
    let lastY = startY;

    function onPointerMove(moveEvent: PointerEvent): void {
      const deltaX = moveEvent.screenX - lastX;
      const deltaY = moveEvent.screenY - lastY;
      lastX = moveEvent.screenX;
      lastY = moveEvent.screenY;
      if (deltaX !== 0 || deltaY !== 0) void window.exileLens?.moveOverlayBy?.(deltaX, deltaY);
    }

    function onPointerUp(): void {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      void window.exileLens?.setOverlayClickThrough?.(false);
    }

    void window.exileLens?.setOverlayClickThrough?.(false);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  return (
    <main className="guide-hud-shell" onPointerDown={startHudMove}>
      <div className="guide-drag-strip" />
      <header className="guide-header">
        <div>
          <span className="guide-eyebrow">액트 가이드</span>
          <h1>{currentArea.areaNameKo ?? '지역 감지 대기 중'}</h1>
          <p>{formatActLabel(currentArea.act)} · {formatDetectionSource(currentArea.detectedFrom)} · 캐릭터 {activeCharacter?.displayName ?? '미선택'}</p>
        </div>
        <div className="guide-counts" data-no-hud-drag="true">
          <strong>{incompleteTotal}</strong>
          <span>남음</span>
          <em>{completedTotal}/{allEssentialRows.length}</em>
        </div>
      </header>

      <section className="guide-character-card" data-no-hud-drag="true">
        <div className="section-title-row">
          <h2>{onboardingRequired ? '캐릭터를 먼저 선택하세요' : `현재 캐릭터: ${activeCharacter?.displayName ?? '미선택'}`}</h2>
          <button type="button" onClick={() => setSettingsOpen((open) => !open)}>{settingsOpen ? '설정 닫기' : '설정'}</button>
        </div>
        {characterList.length > 0 ? (
          <select value={characterState.activeCharacterId ?? ''} onChange={(event) => void createOrSelectCharacter(event.target.value)}>
            {characterList.map((character) => <option key={character.id} value={character.id}>{character.displayName}</option>)}
          </select>
        ) : null}
        <form className="character-create-row" onSubmit={(event) => { event.preventDefault(); void createOrSelectCharacter(newCharacterName); }}>
          <input value={newCharacterName} onChange={(event) => setNewCharacterName(event.target.value)} placeholder="방금 만든 캐릭터 이름 입력" />
          <button type="submit">새 캐릭터 추가</button>
        </form>
        {status ? <p className="status-line">{status}</p> : null}
      </section>

      {onboardingRequired ? (
        <section className="guide-current-card onboarding-card" data-no-hud-drag="true">
          <h2>캐릭터 진행도를 분리해 저장합니다</h2>
          <p className="empty-note">목록에 없어도 괜찮습니다. 캐릭터 이름을 직접 입력하면 즉시 새 프로필이 만들어지고 이 캐릭터 기준으로 체크리스트가 저장됩니다.</p>
        </section>
      ) : (
        <>
          <section className="guide-current-card">
            <div className="section-title-row">
              <h2>현재 지역 필수 보상</h2>
            </div>
            {currentObjectives.length > 0 ? (
              <ObjectiveList areaId={currentArea.areaId ?? ''} objectives={currentObjectives} progress={progress} onToggle={toggleObjective} />
            ) : (
              <p className="empty-note">이 지역에는 표시할 필수 보상/해금 체크가 없습니다.</p>
            )}
          </section>

          <section className="guide-all-card">
            <h2>전체 필수 체크리스트</h2>
            <div className="guide-objective-list">
              {allEssentialRows.map((row) => (
                <button
                  key={`${row.areaId}:${row.objective.id}`}
                  type="button"
                  className={`objective ${isObjectiveCompleted(progress, row.areaId, row.objective.id) ? 'completed' : ''}`}
                  onClick={() => void toggleObjective(row.areaId, row.objective.id)}
                >
                  <span className="objective-area">{formatActLabel(row.act)} · {row.areaNameKo}</span>
                  <span>{row.objective.labelKo}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {settingsOpen ? (
        <section className="guide-settings" data-no-hud-drag="true">
          <h2>감지 설정</h2>
          <label>
            Client.txt 경로
            <input
              value={settings.clientLogPath}
              onChange={(event) => setSettings({ ...settings, clientLogPath: event.target.value })}
              placeholder="C:\\Kakaogames\\Path of Exile2\\logs\\KakaoClient.txt"
            />
          </label>
          <div className="settings-row">
            <button type="button" onClick={() => void window.exileLens?.detectClientLogPath?.().then((result) => saveSettings({ ...settings, clientLogPath: result.clientLogPath, demoMode: result.clientLogPath.length === 0 }))}>자동 찾기</button>
            <button type="button" onClick={() => void saveSettings(settings)}>저장</button>
            <button type="button" onClick={() => void restoreAutomaticAreaDetection()}>자동 감지 복귀</button>
          </div>
          <label>
            지역 수동 보정
            <select value={settings.manualAreaOverrideId ?? ''} onChange={(event) => void (event.target.value ? setManualAreaOverride(event.target.value) : restoreAutomaticAreaDetection())}>
              <option value="">자동 감지 사용</option>
              {listAvailableAreasByAct(areaDefinitions).map((group) => (
                <optgroup key={group.act} label={formatActLabel(group.act)}>
                  {group.areas.map((area) => <option key={area.id} value={area.id}>{area.nameKo}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <p className="status-line">{status || diagnostics?.mode || '대기 중'}</p>
        </section>
      ) : null}

      <GuideResizeGrip />
    </main>
  );
}

interface EssentialRow {
  areaId: string;
  act: number;
  areaNameKo: string;
  objective: ChecklistObjective;
}

function buildEssentialRows(checklists: AreaChecklist[]): EssentialRow[] {
  const areaById = new Map(areaDefinitions.map((area) => [area.id, area]));
  return checklists.flatMap((checklist) => {
    const area = areaById.get(checklist.areaId);
    if (area == null) return [];
    return checklist.objectives.map((objective) => ({ areaId: checklist.areaId, act: area.act, areaNameKo: area.nameKo, objective }));
  });
}

function ObjectiveList({ areaId, objectives, progress, onToggle }: { areaId: string; objectives: ChecklistObjective[]; progress: QuestProgress; onToggle: (areaId: string, objectiveId: string) => Promise<void> }): React.ReactElement {
  return (
    <div className="guide-objective-list">
      {objectives.map((objective) => (
        <button
          key={objective.id}
          type="button"
          className={`objective ${isObjectiveCompleted(progress, areaId, objective.id) ? 'completed' : ''}`}
          onClick={() => void onToggle(areaId, objective.id)}
        >
          <span>{objective.labelKo}</span>
          {objective.notesKo ? <small>{objective.notesKo}</small> : null}
        </button>
      ))}
    </div>
  );
}

function GuideResizeGrip(): React.ReactElement {
  function startResize(event: React.PointerEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.screenX;
    const startY = event.screenY;
    let lastX = startX;
    let lastY = startY;

    function onPointerMove(moveEvent: PointerEvent): void {
      const deltaX = moveEvent.screenX - lastX;
      const deltaY = moveEvent.screenY - lastY;
      lastX = moveEvent.screenX;
      lastY = moveEvent.screenY;
      void window.exileLens?.resizeOverlayBy?.(deltaX, deltaY);
    }

    function onPointerUp(): void {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      void window.exileLens?.setOverlayClickThrough?.(false);
    }

    void window.exileLens?.setOverlayClickThrough?.(false);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  return <button type="button" className="guide-resize-grip" aria-label="액트 가이드 창 크기 조절" onPointerDown={startResize} />;
}

function loadLocalProgress(): QuestProgress {
  try {
    const raw = window.localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw == null ? createEmptyQuestProgress() : JSON.parse(raw) as QuestProgress;
  } catch {
    return createEmptyQuestProgress();
  }
}

function saveLocalProgress(progress: QuestProgress): void {
  try {
    window.localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage failures; main process persistence remains source of truth.
  }
}

function formatActLabel(act: number | undefined): string {
  if (act == null) return 'ACT ?';
  return act === 0 ? '막간' : `ACT ${act}`;
}

function formatDetectionSource(source: AreaDetectionState['detectedFrom']): string {
  if (source === 'client_log') return 'Client.txt 감지';
  if (source === 'manual_override') return '수동 보정';
  return '데모/대기';
}

createRoot(document.getElementById('root')!).render(<App />);
