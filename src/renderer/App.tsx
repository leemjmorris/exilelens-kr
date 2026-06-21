import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { AreaDetectionState } from '../shared/quests/areaMatcher';
import {
  createEmptyQuestProgress,
  normalizeManualQuestProgress,
  groupChecklistObjectives,
  buildAreaProgressGroups,
  isObjectiveCompleted,
  toggleObjectiveCompletion,
  type ChecklistObjective,
  type AreaProgressSummary,
  type QuestProgress
} from '../shared/quests/checklist';
import { areaDefinitions, areaChecklists, findChecklistForArea, getDemoAreaDetection } from '../shared/quests/data';
import { buildManualAreaOverride, listAvailableAreasByAct } from '../shared/quests/areaSelection';
import { DEFAULT_APP_SETTINGS, normalizeAppSettings, type AppSettings } from '../shared/settings/appSettings';
import { parseCopiedItemText, type ParsedItemText } from '../shared/items/itemParser';
import { buildTradeSearchDraft } from '../shared/trade/tradeSearchDraft';
import type { AppDiagnostics } from '../shared/diagnostics/appDiagnostics';
import type { OfficialTradeSearchResult } from '../shared/trade/officialTradeApi';
import { FALLBACK_POE2_TRADE_LEAGUES, type TradeLeague } from '../shared/trade/leagueApi';
import './styles/globals.css';

type Route = 'item' | 'quest' | 'settings';

const LOCAL_PROGRESS_KEY = 'exilelens.questProgress';

function App(): React.ReactElement {
  const [route, setRoute] = useState<Route>('quest');
  const [currentArea, setCurrentArea] = useState<AreaDetectionState>(getDemoAreaDetection());
  const [progress, setProgress] = useState<QuestProgress>(() => loadLocalProgress());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [diagnostics, setDiagnostics] = useState<AppDiagnostics | null>(null);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string>('');
  const [areaActionStatus, setAreaActionStatus] = useState<string>('');
  const [areaActionPending, setAreaActionPending] = useState<boolean>(false);

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
      // Capture only over the visible overlay surface so wheel scrolling works across cards/content.
      // Transparent space outside the shell stays click-through to POE2.
      return target.closest('.overlay-shell') != null;
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
    return window.exileLens?.onNavigate((nextRoute) => setRoute(nextRoute)) ?? (() => undefined);
  }, []);

  useEffect(() => {
    function handleOverlayKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;

      // Renderer-local only: this runs only while the overlay document has focus.
      // Do not use Electron globalShortcut for Escape; it would steal ESC from POE2 globally.
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
      unsubscribeSettings?.();
    };
  }, []);

  const checklist = useMemo(() => findChecklistForArea(currentArea.areaId), [currentArea.areaId]);

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

  async function saveSettings(nextSettings: AppSettings): Promise<void> {
    const normalized = normalizeAppSettings(nextSettings);
    setSettings(normalized);
    setSettingsSavedMessage('저장 중...');

    const persisted = await window.exileLens?.updateSettings?.(normalized);
    setSettings(normalizeAppSettings(persisted ?? normalized));
    const nextDiagnostics = await window.exileLens?.getDiagnostics?.();
    if (nextDiagnostics != null) setDiagnostics(nextDiagnostics);
    setSettingsSavedMessage('저장됨');
  }

  async function setManualAreaOverride(areaId: string): Promise<void> {
    if (areaActionPending) return;
    const manualArea = buildManualAreaOverride(areaDefinitions, areaId);
    if (manualArea == null) return;

    setAreaActionPending(true);
    setAreaActionStatus('수동 보정 저장 중...');
    try {
      setCurrentArea(manualArea);
      const normalized = normalizeAppSettings({ ...settings, manualAreaOverrideId: manualArea.areaId });
      setSettings(normalized);
      const persisted = await window.exileLens?.updateSettings?.(normalized);
      if (persisted != null) setSettings(normalizeAppSettings(persisted));
      setAreaActionStatus(`${manualArea.areaNameKo ?? '선택 지역'} 수동 보정을 저장했습니다.`);
    } catch (error) {
      setAreaActionStatus(`수동 보정 저장 실패: ${formatErrorMessage(error)}`);
    } finally {
      setAreaActionPending(false);
    }
  }

  async function restoreAutomaticAreaDetection(): Promise<void> {
    if (areaActionPending) return;
    setAreaActionPending(true);
    setAreaActionStatus('자동/데모 감지로 복귀 중...');
    try {
      const normalized = normalizeAppSettings({ ...settings, manualAreaOverrideId: undefined });
      setSettings(normalized);
      setCurrentArea(getDemoAreaDetection());
      const persisted = await window.exileLens?.updateSettings?.(normalized);
      const nextSettings = normalizeAppSettings(persisted ?? normalized);
      setSettings(nextSettings);
      setAreaActionStatus(
        nextSettings.demoMode
          ? '수동 보정을 해제하고 데모 감지로 복귀했습니다.'
          : '수동 보정을 해제했습니다. Client.txt 자동 감지 결과를 기다립니다.'
      );
    } catch (error) {
      setAreaActionStatus(`자동/데모 복귀 실패: ${formatErrorMessage(error)}`);
    } finally {
      setAreaActionPending(false);
    }
  }

  return (
    <main className="overlay-shell">
      <header className="overlay-header">
        <div>
          <strong>ExileLens KR</strong>
          <span>POE2 한국어 오버레이</span>
        </div>
        <nav>
          <button onClick={() => setRoute('item')}>시세</button>
          <button onClick={() => setRoute('quest')}>퀘스트</button>
          <button onClick={() => setRoute('settings')}>설정</button>
          <button className="hide-button" onClick={() => void window.exileLens?.hideOverlay?.()}>숨기기</button>
        </nav>
      </header>
      <div className="overlay-content" data-overlay-interactive="true">
        {route === 'item' && <ItemPanel settings={settings} />}
        {route === 'quest' && (
          <QuestPanel
            currentArea={currentArea}
            checklist={checklist}
            progress={progress}
            manualAreaOverrideId={settings.manualAreaOverrideId}
            areaActionStatus={areaActionStatus}
            areaActionPending={areaActionPending}
            onToggleObjective={toggleObjective}
            onSelectManualArea={setManualAreaOverride}
            onRestoreAutomatic={restoreAutomaticAreaDetection}
          />
        )}
        {route === 'settings' && (
          <SettingsPanel
            settings={settings}
            diagnostics={diagnostics}
            savedMessage={settingsSavedMessage}
            onSave={saveSettings}
            onDiagnosticsChange={setDiagnostics}
          />
        )}
      </div>
    </main>
  );
}

function ItemPanel({ settings }: { settings: AppSettings }): React.ReactElement {
  const [rawText, setRawText] = useState<string>('');
  const [parsed, setParsed] = useState<ParsedItemText>(() => parseCopiedItemText(''));
  const [status, setStatus] = useState<string>('아이템 위에 마우스를 올린 뒤 캡처를 누르거나, 아래에 직접 붙여넣으세요.');
  const [tradeStatus, setTradeStatus] = useState<string>('공식 거래소 API 대기 중');
  const [officialTradeResult, setOfficialTradeResult] = useState<OfficialTradeSearchResult | null>(null);
  const tradeDraft = useMemo(
    () => buildTradeSearchDraft(parsed, { league: settings.league, language: 'ko' }),
    [parsed, settings.league]
  );

  function parseManualText(nextRawText: string): void {
    setRawText(nextRawText);
    setParsed(parseCopiedItemText(nextRawText));
    setStatus(nextRawText.trim().length > 0 ? '수동 입력을 파싱했습니다.' : '아이템 텍스트 대기 중');
    setOfficialTradeResult(null);
    setTradeStatus(nextRawText.trim().length > 0 ? '공식 거래소 API 검색 준비됨' : '공식 거래소 API 대기 중');
  }

  async function captureItem(): Promise<void> {
    setStatus('캡처 중... 오버레이가 잠시 숨겨지고 활성 창에 Ctrl+C 한 번만 전송됩니다.');
    const result = await window.exileLens?.captureItemText?.();
    if (result?.ok === true) {
      setRawText(result.rawText);
      setParsed(result.parsed);
      setStatus('클립보드에서 아이템 텍스트를 캡처했습니다. 기존 클립보드는 복원되었습니다.');
      setOfficialTradeResult(null);
      setTradeStatus('공식 거래소 API 검색 준비됨');
      return;
    }

    setStatus(
      result?.reason === 'copy-failed'
        ? `자동 캡처 실패: ${result.error ?? '알 수 없는 오류'} — 수동 붙여넣기를 사용하세요.`
        : '아이템 텍스트를 감지하지 못했습니다. POE2 아이템에 마우스를 올린 상태인지 확인하거나 수동 붙여넣기를 사용하세요.'
    );
  }

  async function copyTradeDraft(): Promise<void> {
    await window.exileLens?.writeClipboardText?.(tradeDraft.queryText);
    setTradeStatus('검색 초안을 클립보드에 복사했습니다. 공식 거래소에 직접 붙여넣어 검색하세요.');
  }

  async function searchOfficialTradeApi(): Promise<void> {
    setTradeStatus('공식 거래소 API 검색 중...');
    setOfficialTradeResult(null);
    const result = await window.exileLens?.searchOfficialTrade?.(parsed);
    if (result == null) {
      setTradeStatus('공식 거래소 API IPC가 연결되지 않았습니다. 앱을 다시 빌드/실행하세요.');
      return;
    }

    if (!result.ok) {
      setTradeStatus(`공식 거래소 API 실패: ${result.message}`);
      return;
    }

    setOfficialTradeResult(result);
    setTradeStatus(`공식 거래소 API 연결 성공: ${result.total}개 결과, 상위 ${result.listings.length}개 가격을 가져왔습니다.`);
  }

  async function openTradeSearch(): Promise<void> {
    await window.exileLens?.openExternalUrl?.(tradeDraft.searchUrl);
    setTradeStatus('공식 거래소 페이지를 외부 브라우저로 열었습니다. 초안 키워드를 수동 입력하세요.');
  }

  return (
    <section className="panel item-panel">
      <div className="item-card">
        <span className="eyebrow">Safe Item Capture</span>
        <h1>아이템 텍스트 파서</h1>
        <p>
          캡처 버튼은 사용자 클릭 시에만 현재 클립보드를 보존하고, 활성 창에 Ctrl+C 복사 요청을 한 번 보낸 뒤
          클립보드를 복원합니다. 실패하면 수동 붙여넣기로 동일 파서를 테스트할 수 있습니다.
        </p>
      </div>

      <div className="item-actions">
        <button onClick={() => void captureItem()}>아이템 캡처</button>
        <span>{status}</span>
      </div>

      <div className="item-grid">
        <label className="field-row raw-item-input">
          <span>원문 아이템 텍스트</span>
          <textarea
            value={rawText}
            placeholder="Ctrl+C로 복사한 POE/POE2 아이템 텍스트를 여기에 붙여넣기"
            onChange={(event) => parseManualText(event.target.value)}
          />
        </label>

        <section className="parsed-item-summary">
          <h2>파싱 결과</h2>
          <dl>
            <dt>희귀도</dt>
            <dd>{parsed.rarity ?? '미감지'}</dd>
            <dt>이름</dt>
            <dd>{parsed.name ?? '미감지'}</dd>
            <dt>베이스</dt>
            <dd>{parsed.baseType ?? '없음/미감지'}</dd>
            <dt>아이템 레벨</dt>
            <dd>{parsed.itemLevel ?? '미감지'}</dd>
          </dl>
          <ItemLineGroup title="요구사항" lines={parsed.requirements} />
          <ItemLineGroup title="기본 수치" lines={parsed.stats} />
          <ItemLineGroup title="옵션/모드" lines={parsed.mods} />
          <ItemLineGroup title="미분류 보존 줄" lines={parsed.unknownLines} />
        </section>

        <section className="trade-draft-panel">
          <h2>검색 초안</h2>
          <p className="trade-warning">
            공식 POE2 거래소 API에 직접 검색 요청을 보내고, 상위 결과 가격을 읽어옵니다. 자동 귓속말/자동 거래/자동 클릭은 하지 않습니다.
          </p>
          <dl>
            <dt>리그</dt>
            <dd>{tradeDraft.league}</dd>
            <dt>상태</dt>
            <dd>공식 API 검색 사용 가능 / 수동 검색 초안 fallback 유지</dd>
            <dt>거래소 URL</dt>
            <dd>{tradeDraft.searchUrl}</dd>
          </dl>
          <ItemLineGroup title="검색 키워드" lines={tradeDraft.keywords} />
          <OfficialTradeResultPanel result={officialTradeResult} />
          <label className="field-row trade-query">
            <span>복사용 초안</span>
            <textarea readOnly value={tradeDraft.queryText} />
          </label>
          <div className="trade-actions">
            <button onClick={() => void searchOfficialTradeApi()}>공식 API 검색</button>
            <button onClick={() => void copyTradeDraft()}>초안 복사</button>
            <button onClick={() => void openTradeSearch()}>공식 거래소 열기</button>
            <span>{tradeStatus}</span>
          </div>
        </section>
      </div>
    </section>
  );
}

function OfficialTradeResultPanel({ result }: { result: OfficialTradeSearchResult | null }): React.ReactElement {
  if (result == null) return <p className="empty-state">공식 API 검색 결과 없음</p>;

  return (
    <div className="item-line-group">
      <h3>공식 거래소 API 결과</h3>
      <p>
        총 {result.total}개 결과 · 쿼리 ID {result.queryId}
      </p>
      {result.listings.length === 0 ? (
        <p className="empty-state">상위 가격 결과 없음</p>
      ) : (
        <ul>
          {result.listings.map((listing, index) => (
            <li key={listing.id}>
              #{index + 1} {listing.itemName != null && listing.itemName.length > 0 ? `${listing.itemName} ` : ''}
              {listing.typeLine ?? '아이템'} — {formatTradePrice(listing.price)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatTradePrice(price: OfficialTradeSearchResult['listings'][number]['price']): string {
  if (price == null) return '가격 미표시';
  return `${price.amount} ${price.currency}`;
}

function ItemLineGroup({ title, lines }: { title: string; lines: string[] }): React.ReactElement {
  return (
    <div className="item-line-group">
      <h3>{title}</h3>
      {lines.length === 0 ? <p className="empty-state">없음</p> : <ul>{lines.map((line) => <li key={`${title}-${line}`}>{line}</li>)}</ul>}
    </div>
  );
}

function SettingsPanel({
  settings,
  diagnostics,
  savedMessage,
  onSave,
  onDiagnosticsChange
}: {
  settings: AppSettings;
  diagnostics: AppDiagnostics | null;
  savedMessage: string;
  onSave: (settings: AppSettings) => Promise<void>;
  onDiagnosticsChange: (diagnostics: AppDiagnostics) => void;
}): React.ReactElement {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [detectMessage, setDetectMessage] = useState<string>('');
  const [tradeLeagues, setTradeLeagues] = useState<TradeLeague[]>(FALLBACK_POE2_TRADE_LEAGUES);
  const [leagueMessage, setLeagueMessage] = useState<string>('공식 리그 목록 불러오기 대기 중');

  async function detectClientLogPath(): Promise<void> {
    setDetectMessage('Client.txt/KakaoClient.txt 자동 검색 중...');
    const result = await window.exileLens?.detectClientLogPath?.();
    if (result == null) {
      setDetectMessage('Client.txt 자동 찾기 기능을 사용할 수 없습니다. 앱을 다시 빌드/실행하거나 경로를 직접 입력하세요.');
      return;
    }

    if (result.clientLogPath.length === 0) {
      setDetectMessage(`자동 검색 실패: 후보 ${result.candidates.length}개에서 로그 파일을 찾지 못했습니다.`);
      return;
    }

    const nextDraft = { ...draft, clientLogPath: result.clientLogPath, demoMode: false };
    setDraft(nextDraft);
    await onSave(nextDraft);
    setDetectMessage(`발견 및 저장됨: ${result.clientLogPath} — Client.txt 감시를 시작합니다.`);
  }

  async function refreshTradeLeagues(autoSelectRecommended = false): Promise<void> {
    setLeagueMessage('공식 POE2 리그 목록 불러오는 중...');
    const result = await window.exileLens?.getTradeLeagues?.();
    if (result == null) {
      setTradeLeagues(FALLBACK_POE2_TRADE_LEAGUES);
      setLeagueMessage('공식 리그 목록 기능을 사용할 수 없습니다. 기본 리그 목록을 사용합니다.');
      return;
    }

    const nextLeagues = result.ok ? result.leagues : result.fallbackLeagues;
    setTradeLeagues(nextLeagues);
    if (autoSelectRecommended && settings.league === 'Standard' && result.recommendedLeague !== settings.league) {
      setDraft((previous) => ({ ...previous, league: result.recommendedLeague }));
    }
    setLeagueMessage(
      result.ok
        ? `공식 리그 ${nextLeagues.length}개 불러옴 · 추천: ${result.recommendedLeague}`
        : `공식 리그 API 실패: ${result.message} · 기본 리그 목록 사용`
    );
  }

  async function retryHotkeys(): Promise<void> {
    await window.exileLens?.retryHotkeys?.();
    const nextDiagnostics = await window.exileLens?.getDiagnostics?.();
    if (nextDiagnostics != null) onDiagnosticsChange(nextDiagnostics);
  }

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    void refreshTradeLeagues(true);
  }, []);

  return (
    <section className="panel settings-panel">
      <div className="settings-card">
        <span className="eyebrow">Safe Overlay Settings</span>
        <h1>설정</h1>
        <p>
          ESC 및 게임 기본 키는 전역 단축키로 등록하지 않습니다. 오버레이는 헤더의 숨기기 버튼 또는
          Alt+D/Alt+Q 표시 단축키로만 제어합니다.
        </p>
      </div>

      <label className="field-row">
        <span>Client.txt 경로</span>
        <input
          value={draft.clientLogPath}
          placeholder="예: C:\\Kakaogames\\Path of Exile2\\logs\\KakaoClient.txt"
          onChange={(event) => setDraft({ ...draft, clientLogPath: event.target.value })}
        />
      </label>

      <div className="settings-actions">
        <button onClick={() => void detectClientLogPath()}>Client.txt 자동 찾기</button>
        {detectMessage.length > 0 ? <span>{detectMessage}</span> : null}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={draft.demoMode}
          onChange={(event) => setDraft({ ...draft, demoMode: event.target.checked })}
        />
        <span>데모 모드 사용(Client.txt 감시 끄기)</span>
      </label>

      <label className="field-row">
        <span>거래소 리그</span>
        <select value={draft.league} onChange={(event) => setDraft({ ...draft, league: event.target.value })}>
          {ensureSelectedLeagueOption(tradeLeagues, draft.league).map((league) => (
            <option key={league.id} value={league.id}>
              {league.text}
            </option>
          ))}
        </select>
      </label>

      <div className="settings-actions">
        <button onClick={() => void refreshTradeLeagues(false)}>리그 목록 새로고침</button>
        {leagueMessage.length > 0 ? <span>{leagueMessage}</span> : null}
      </div>

      <div className="settings-actions">
        <button onClick={() => void onSave(draft)}>설정 저장</button>
        {savedMessage.length > 0 ? <span>{savedMessage}</span> : null}
      </div>

      <DiagnosticsPanel diagnostics={diagnostics} onRetryHotkeys={retryHotkeys} />
    </section>
  );
}

function ensureSelectedLeagueOption(leagues: TradeLeague[], selectedLeague: string): TradeLeague[] {
  if (leagues.some((league) => league.id === selectedLeague)) return leagues;
  const trimmed = selectedLeague.trim();
  if (trimmed.length === 0) return leagues;
  return [{ id: trimmed, realm: 'poe2', text: `${trimmed} (저장된 값)` }, ...leagues];
}

function DiagnosticsPanel({
  diagnostics,
  onRetryHotkeys
}: {
  diagnostics: AppDiagnostics | null;
  onRetryHotkeys: () => Promise<void>;
}): React.ReactElement {
  const modeLabel =
    diagnostics?.mode === 'client_log'
      ? 'Client.txt 감시'
      : diagnostics?.mode === 'manual_override'
        ? '수동 지역 보정'
        : '데모/자동 대기';

  return (
    <section className="diagnostics-card">
      <span className="eyebrow">Diagnostics / About</span>
      <h2>진단 및 안전 상태</h2>
      <dl>
        <dt>앱 버전</dt>
        <dd>{diagnostics?.appVersion ?? '불러오는 중'}</dd>
        <dt>현재 모드</dt>
        <dd>{modeLabel}</dd>
        <dt>설정 저장 위치</dt>
        <dd>{diagnostics?.userDataPath ?? 'Electron userData 경로'}</dd>
        <dt>전역 단축키</dt>
        <dd>
          {diagnostics?.safety.globalShortcuts.join(', ') ?? 'F6, Ctrl+Shift+D, Ctrl+Shift+Q, Alt+O, Alt+D, Alt+Q'} (ESC 전역 등록 없음)
          {diagnostics?.safety.hotkeys != null ? (
            <ul className="inline-status-list">
              {diagnostics.safety.hotkeys.map((hotkey) => (
                <li key={hotkey.accelerator}>
                  {hotkey.accelerator}: {hotkey.registered ? '등록됨' : '등록 실패'}
                </li>
              ))}
            </ul>
          ) : null}
          <button onClick={() => void onRetryHotkeys()}>단축키 재등록</button>
        </dd>
        <dt>자동화 안전</dt>
        <dd>메모리/패킷 접근 없음, 자동 클릭·거래 자동화 없음</dd>
      </dl>
    </section>
  );
}

function QuestPanel({
  currentArea,
  checklist,
  progress,
  manualAreaOverrideId,
  areaActionStatus,
  areaActionPending,
  onToggleObjective,
  onSelectManualArea,
  onRestoreAutomatic
}: {
  currentArea: AreaDetectionState;
  checklist: ReturnType<typeof findChecklistForArea>;
  progress: QuestProgress;
  manualAreaOverrideId?: string;
  areaActionStatus: string;
  areaActionPending: boolean;
  onToggleObjective: (areaId: string, objectiveId: string) => Promise<void>;
  onSelectManualArea: (areaId: string) => Promise<void>;
  onRestoreAutomatic: () => Promise<void>;
}): React.ReactElement {
  const grouped = checklist == null ? { required: [], optional: [] } : groupChecklistObjectives(checklist.objectives);
  const sourceLabel =
    currentArea.detectedFrom === 'client_log'
      ? 'Client.txt'
      : currentArea.detectedFrom === 'manual_override'
        ? '수동 보정'
        : '데모/자동 대기';
  const confidenceLabel = currentArea.confidence === 'high' ? '높음' : currentArea.confidence === 'medium' ? '중간' : '낮음';
  const areaGroups = useMemo(() => listAvailableAreasByAct(areaDefinitions), []);
  const progressGroups = useMemo(
    () => buildAreaProgressGroups(areaDefinitions, areaChecklists, progress, currentArea.areaId),
    [progress, currentArea.areaId]
  );

  return (
    <section className="panel quest-panel">
      <div className="current-area-card">
        <span className="eyebrow">Current Area</span>
        <h1>{currentArea.areaNameKo ?? '지역 미감지'}</h1>
        <p>
          출처: {sourceLabel} · 신뢰도: {confidenceLabel}
          {currentArea.act != null ? ` · Act ${currentArea.act}` : ''}
        </p>
      </div>

      <section className="area-override-card">
        <div>
          <span className="eyebrow">Area Correction</span>
          <h2>지역 수동 보정</h2>
          <p>
            Client.txt 감지가 실패했거나 다른 지역 체크리스트가 필요하면 로컬 데이터에서 직접 선택하세요.
            수동 보정은 설정에 저장되며, 자동 복귀 버튼으로 해제할 수 있습니다.
          </p>
        </div>
        <div className="area-override-actions">
          <label className="field-row area-select">
            <span>현재 체크리스트 지역</span>
            <select
              value={manualAreaOverrideId ?? currentArea.areaId ?? ''}
              disabled={areaActionPending}
              onChange={(event) => void onSelectManualArea(event.target.value)}
            >
              <option value="" disabled>
                지역 선택
              </option>
              {areaGroups.map((group) => (
                <optgroup key={group.act} label={formatActLabel(group.act)}>
                  {group.areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nameKo}{area.nameEn != null ? ` / ${area.nameEn}` : ''}{area.isTown ? ' (마을)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button disabled={manualAreaOverrideId == null || areaActionPending} onClick={() => void onRestoreAutomatic()}>
            {areaActionPending ? '처리 중...' : '자동/데모 감지로 복귀'}
          </button>
          {areaActionStatus.length > 0 ? <span className="status-pill">{areaActionStatus}</span> : null}
        </div>
      </section>

      {checklist == null ? (
        <p className="empty-state">이 지역에 연결된 체크리스트가 아직 없습니다.</p>
      ) : (
        <div className="checklist-grid">
          <ChecklistGroup
            title="[필수]"
            areaId={checklist.areaId}
            objectives={grouped.required}
            progress={progress}
            onToggleObjective={onToggleObjective}
          />
          <ChecklistGroup
            title="[선택]"
            areaId={checklist.areaId}
            objectives={grouped.optional}
            progress={progress}
            onToggleObjective={onToggleObjective}
          />
        </div>
      )}

      <AllAreaProgressBoard
        progressGroups={progressGroups}
        progress={progress}
        onToggleObjective={onToggleObjective}
      />
    </section>
  );
}

function AllAreaProgressBoard({
  progressGroups,
  progress,
  onToggleObjective
}: {
  progressGroups: ReturnType<typeof buildAreaProgressGroups>;
  progress: QuestProgress;
  onToggleObjective: (areaId: string, objectiveId: string) => Promise<void>;
}): React.ReactElement {
  const totalAreas = progressGroups.reduce((sum, group) => sum + group.areas.length, 0);
  const totalObjectives = progressGroups.reduce(
    (sum, group) => sum + group.areas.reduce((areaSum, area) => areaSum + area.totalObjectives, 0),
    0
  );
  const totalCompleted = progressGroups.reduce(
    (sum, group) => sum + group.areas.reduce((areaSum, area) => areaSum + area.completedObjectives.length, 0),
    0
  );

  return (
    <section className="all-area-progress-board" data-overlay-interactive="true">
      <div className="all-area-progress-header">
        <div>
          <span className="eyebrow">Campaign Quest Progress</span>
          <h2>전체 지역 퀘스트 현황</h2>
          <p>
            완료는 직접 체크했거나 향후 신뢰 가능한 완료 신호가 감지된 항목만 표시합니다. 현재 지역은 해야 할 퀘스트를 찾기 위한 강조 용도이며, 지역 이동만으로 완료 처리하지 않습니다.
          </p>
        </div>
        <strong>
          {totalCompleted}/{totalObjectives} 완료 · {totalAreas}개 지역
        </strong>
      </div>

      <div className="act-progress-list">
        {progressGroups.map((group) => (
          <section key={group.act} className="act-progress-group">
            <h3>{formatActLabel(group.act)}</h3>
            <div className="area-progress-list">
              {group.areas.map((area) => (
                <AreaProgressCard
                  key={area.areaId}
                  area={area}
                  progress={progress}
                  onToggleObjective={onToggleObjective}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function AreaProgressCard({
  area,
  progress,
  onToggleObjective
}: {
  area: AreaProgressSummary;
  progress: QuestProgress;
  onToggleObjective: (areaId: string, objectiveId: string) => Promise<void>;
}): React.ReactElement {
  const completedCount = area.completedObjectives.length;
  const incompleteCount = area.incompleteObjectives.length;

  return (
    <article className={`area-progress-card ${area.isCurrentArea ? 'area-progress-current' : ''}`}>
      <header>
        <div>
          <h4>
            {area.areaNameKo}
            {area.areaNameEn != null ? <small> / {area.areaNameEn}</small> : null}
          </h4>
          <span>
            완료 {completedCount} · 미완료 {incompleteCount}
            {area.needsVerification ? ' · 검증 필요' : ''}
            {area.isCurrentArea ? ' · 현재 지역' : ''}
          </span>
        </div>
      </header>

      {area.totalObjectives === 0 ? (
        <p className="empty-state">등록된 퀘스트 항목 없음</p>
      ) : (
        <div className="area-progress-columns">
          <QuestStatusList
            title="완료"
            areaId={area.areaId}
            objectives={area.completedObjectives}
            progress={progress}
            onToggleObjective={onToggleObjective}
          />
          <QuestStatusList
            title="미완료"
            areaId={area.areaId}
            objectives={area.incompleteObjectives}
            progress={progress}
            onToggleObjective={onToggleObjective}
          />
        </div>
      )}
    </article>
  );
}

function QuestStatusList({
  title,
  areaId,
  objectives,
  progress,
  onToggleObjective
}: {
  title: string;
  areaId: string;
  objectives: ChecklistObjective[];
  progress: QuestProgress;
  onToggleObjective: (areaId: string, objectiveId: string) => Promise<void>;
}): React.ReactElement {
  return (
    <section className="quest-status-list">
      <h5>{title}</h5>
      {objectives.length === 0 ? (
        <p className="empty-state">없음</p>
      ) : (
        <ul>
          {objectives.map((objective) => {
            const completed = isObjectiveCompleted(progress, areaId, objective.id);
            return (
              <li key={objective.id}>
                <button
                  className={`objective compact-objective ${completed ? 'objective-completed' : ''}`}
                  onClick={() => void onToggleObjective(areaId, objective.id)}
                >
                  <span className="objective-check">{completed ? '✓' : '○'}</span>
                  <span>
                    {objective.labelKo}
                    {objective.needsVerification ? <em>검증 필요</em> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function formatActLabel(act: number): string {
  return act === 0 ? '막간' : `Act ${act}`;
}

function ChecklistGroup({
  title,
  areaId,
  objectives,
  progress,
  onToggleObjective
}: {
  title: string;
  areaId: string;
  objectives: ChecklistObjective[];
  progress: QuestProgress;
  onToggleObjective: (areaId: string, objectiveId: string) => Promise<void>;
}): React.ReactElement {
  return (
    <section className="checklist-group">
      <h2>{title}</h2>
      {objectives.length === 0 ? (
        <p className="empty-state">항목 없음</p>
      ) : (
        <ul>
          {objectives.map((objective) => {
            const completed = isObjectiveCompleted(progress, areaId, objective.id);
            return (
              <li key={objective.id}>
                <button
                  className={`objective ${completed ? 'objective-completed' : ''}`}
                  onClick={() => void onToggleObjective(areaId, objective.id)}
                >
                  <span className="objective-check">{completed ? '✓' : '○'}</span>
                  <span>
                    {objective.labelKo}
                    {objective.needsVerification ? <em>검증 필요</em> : null}
                    {objective.notesKo != null ? <small>{objective.notesKo}</small> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function loadLocalProgress(): QuestProgress {
  try {
    const raw = window.localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (raw == null) return createEmptyQuestProgress();
    const parsed = JSON.parse(raw) as Partial<QuestProgress>;
    return normalizeManualQuestProgress({
      completedObjectiveIds: parsed.completedObjectiveIds ?? {},
      manualObjectiveStates: parsed.manualObjectiveStates ?? {}
    });
  } catch {
    return createEmptyQuestProgress();
  }
}

function saveLocalProgress(progress: QuestProgress): void {
  window.localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
}

createRoot(document.getElementById('root')!).render(<App />);
