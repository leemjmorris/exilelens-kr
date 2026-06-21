# ExileLens KR Handoff & Improvement Plan

> **For Hermes:** 이 계획은 Claude에서 이어오던 ExileLens KR 프로젝트를 Hermes가 안전하게 계승하고, 검증 가능한 순서로 개선하기 위한 작업 기준이다.

**Goal:** 현재 동작하는 POE2 한국어 오버레이 MVP를 보존하면서, 실제 한국어/Kakao 환경 검증·공식 API 신뢰도·퀘스트 데이터 품질·배포 완성도를 단계적으로 끌어올린다.

**Architecture:** Electron + React + TypeScript 기반의 비침습형 게임 정보 오버레이를 유지한다. 입력 채널은 `KakaoClient.txt`/`Client.txt` 읽기 전용 tail, 사용자가 명시적으로 누른 클립보드 캡처, 공식 POE2 거래소 API 조회, 로컬 설정/진행 상태로 제한한다.

**Tech Stack:** Electron 39, electron-vite 5, Vite 7, React, TypeScript, Vitest, electron-builder.

---

## Current Verified Baseline

검증 일시: 2026-06-20 21:41 local shell 기준.

작업 경로:

- `C:/Users/happy/dev/exilelens-kr`

실행 결과:

```bash
export PATH="/c/Users/happy/dev/tools/node-v22.13.1-win-x64:$PATH"
npm run typecheck
npm test
npm run build
npm run package:smoke
npm audit --audit-level=low
```

확인된 상태:

- TypeScript typecheck 통과.
- Vitest: `21` test files, `81` tests passed.
- Production build 산출물 생성:
  - `out/main/index.js`
  - `out/preload/index.cjs`
  - `out/renderer/index.html`
- Package smoke 통과:
  - preload가 CommonJS `index.cjs`를 참조.
  - `Escape` 전역 단축키 미등록.
  - 기존 `release/ExileLens KR-0.1.0-x64.zip` 및 `release/win-unpacked/ExileLens KR.exe` 확인.
  - packaged ASAR 안에 `out/preload/index.cjs` 존재, stale `index.js`/`index.mjs` 없음.
- `npm audit --audit-level=low`: `found 0 vulnerabilities`.
- 주의: 현재 `C:/Users/happy/dev/exilelens-kr`는 Git 저장소가 아니다. `git status`가 `fatal: not a git repository`로 실패했다.

---

## Handoff Notes

Claude 대화 원문 자체는 Hermes가 자동으로 읽을 수 없다. 하지만 현재 프로젝트 파일, README/docs, 테스트, Hermes에 누적된 POE2 오버레이 개발 노트로는 계승 가능하다.

Claude 쪽에 남은 별도 문맥이 있다면 다음 중 하나를 추가하면 계승 정확도가 더 올라간다.

- `CLAUDE.md`, `.claude/`, 계획 문서, TODO 파일을 프로젝트 루트에 복사.
- Claude 대화 요약 또는 마지막 요구사항을 `docs/handoff-from-claude.md`로 저장.
- 사용자가 실제로 불편했던 증상/원하는 우선순위를 짧게 붙여넣기.

---

## Safety / Non-goals

계속 유지해야 할 경계:

- 게임 메모리 읽기/쓰기 금지.
- 패킷 가로채기 금지.
- 클라이언트 변조 금지.
- 자동 클릭, 자동 귓속말, 자동 거래, 전투/이동 매크로 금지.
- `Escape` 같은 게임 공통 키를 Electron `globalShortcut`으로 등록하지 않기.
- 오버레이 표시 시 기본은 `showInactive()` + click-through 유지. 사용자가 직접 오버레이 표면을 조작할 때만 제한적으로 pointer capture.

---

## Improvement Roadmap

### Phase 0: Project Control Foundation

**Objective:** 이어받은 프로젝트를 잃지 않고 추적 가능하게 만든다.

**Files:**

- Create/modify: `.gitignore`
- Optional create: `docs/handoff-from-claude.md`
- Optional create: `.hermes/plans/*`

**Tasks:**

1. Git 저장소 초기화 여부 결정.
   - 현재 Git repo가 아니므로, 사용자 확인 후 `git init` 또는 원격 repo 연결을 한다.
   - 확인 전에는 commit/push 작업을 하지 않는다.
2. `.gitignore`에 최소 제외 목록을 확인/추가한다.
   - `node_modules/`
   - `out/`
   - `release/`
   - Electron/userData runtime logs
   - local fixtures 중 개인정보/계정 정보 포함 가능 파일
3. Claude handoff 문서가 있다면 `docs/handoff-from-claude.md`로 정리한다.
4. 매 작업 전후 아래 baseline을 반복한다.

```bash
export PATH="/c/Users/happy/dev/tools/node-v22.13.1-win-x64:$PATH"
npm run typecheck
npm test
npm run build
npm run package:smoke
```

**Validation:**

- `git status --short`가 추적할 파일과 제외할 파일을 명확히 보여야 한다.
- baseline 명령이 모두 통과해야 한다.

---

### Phase 1: Documentation Truth Sync

**Objective:** README/docs가 실제 구현 상태와 어긋나지 않게 정리한다.

**Files:**

- Modify: `README.md`
- Modify: `docs/known-issues.md`
- Modify: `docs/mvp-validation.md`

**Observed issue:**

- `README.md`는 공식 POE2 거래소 API 검색이 구현되어 있다고 설명한다.
- `docs/known-issues.md` line 7은 아직 “safe manual-search draft only”라고 되어 있어 현재 코드/README와 불일치한다.

**Tasks:**

1. `docs/known-issues.md`의 trade 항목을 “공식 API 경로는 구현됨, 단 실제 리그/아이템별 live-price 정확도 fixture 검증 필요”로 수정한다.
2. `docs/mvp-validation.md`에 실제 검증 체크리스트를 추가한다.
   - 공식 리그 dropdown 호출 성공/실패.
   - `공식 API 검색` 성공/빈 결과/오류 표시.
   - fallback `초안 복사`, `공식 거래소 열기` 동작.
3. README의 “현재 퀘스트 데이터” 문장이 최신 Act 1~4/막간 데이터 상태와 맞는지 확인한다.

**Validation:**

```bash
npm run typecheck
npm test
npm run build
npm run package:smoke
```

---

### Phase 2: Real Kakao Client Log Validation

**Objective:** 실제 Kakao POE2 로그에서 지역 자동 감지가 정확히 동작하는지 검증한다.

**Files:**

- Modify: `src/main/poe/clientLog.ts`
- Modify: `src/main/poe/areaWatcher.ts`
- Modify: `src/shared/quests/areaMatcher.ts`
- Modify: `src/shared/quests/data/*.ts`
- Create: `tests/fixtures/client-log/kakao-act1-sample.log` or sanitized fixture files
- Modify: `tests/quests/clientLog.test.ts`
- Modify: `tests/runtime-client-log-smoke.test.ts`
- Modify: `docs/data-sources.md`

**Known local candidate:**

- `C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt`

**Tasks:**

1. 실제 로그에서 개인정보/계정/캐릭터명 등 민감한 부분을 제거한 fixture를 만든다.
2. `Generating level N area "areaId"` 패턴이 실제 Kakao 로그에 있는지 확인한다.
3. `[SCENE] Set Source [ZoneName]` fallback이 어느 상황에서 발생하는지 확인한다.
4. UTF-8 byte offset tailing이 한국어 로그에서 깨지지 않는지 regression fixture를 추가한다.
5. Act/마을/은신처/재접속/챕터 화면 placeholder가 잘 무시되는지 테스트한다.
6. 검증된 `areaId` alias를 `src/shared/quests/data/*`에 추가한다.
7. 검증되지 않은 한국어 명칭은 계속 `needsVerification: true`로 둔다.

**Validation:**

```bash
npm test -- tests/quests/clientLog.test.ts tests/runtime-client-log-smoke.test.ts
npm test
```

Manual validation:

- 게임 실행 중 지역 이동 → 앱의 현재 지역 카드가 로그 변경 후 갱신되는지 확인.
- 오버레이가 visible이어도 기본 game click/move가 막히지 않는지 확인.
- ESC가 게임에 그대로 전달되는지 확인.

---

### Phase 3: Quest Data Quality Upgrade

**Objective:** “놓친 퀘스트 확인”이라는 앱 목적에 맞게 데이터 품질을 끌어올린다.

**Files:**

- Modify: `src/shared/quests/data/act1.ts`
- Modify: `src/shared/quests/data/act2.ts`
- Modify: `src/shared/quests/data/act3.ts`
- Modify: `src/shared/quests/data/interlude.ts`
- Modify: `src/shared/quests/data/act4.ts`
- Modify: `tests/quests/campaignDataCoverage.test.ts`
- Modify: `docs/data-sources.md`

**Rules:**

- 현재 지역/furthest area만으로 퀘스트 완료를 자동 처리하지 않는다.
- 완료는 신뢰 가능한 passive signal 또는 사용자의 명시적 체크만 사용한다.
- 선택 목표는 기본 경고 대상에서 제외한다.
- 완료된 항목은 숨기지 말고 흐리게 표시하고 재활성화 가능하게 유지한다.

**Tasks:**

1. Act별 공식 한국어 퀘스트명/지역명 출처를 `docs/data-sources.md`에 추가한다.
2. 확인된 항목만 `needsVerification: false`로 전환한다.
3. 보상/영구 보상 항목을 별도 필드로 분리하는 방안을 검토한다.
4. required/optional 분류가 실제 게임 흐름과 맞는지 fixture/문서 근거로 갱신한다.
5. 영어 이름이 `labelKo`에 남지 않는 regression test를 유지/확장한다.

**Validation:**

```bash
npm test -- tests/quests/campaignDataCoverage.test.ts tests/quests/act1DataIntegrity.test.ts
npm test
```

---

### Phase 4: Official Trade API Reliability

**Objective:** “API” 버튼이 실제 공식 API 기능으로 계속 신뢰 가능하게 동작하도록 만든다.

**Files:**

- Modify: `src/main/trade/officialTradeApi.ts`
- Modify: `src/shared/trade/officialTradeApi.ts`
- Modify: `src/main/trade/leagueApi.ts`
- Modify: `src/renderer/App.tsx`
- Modify: `tests/main/officialTradeApi.test.ts`
- Modify: `tests/trade/officialTradeApi.test.ts`
- Modify: `docs/mvp-validation.md`

**Tasks:**

1. API 응답이 JSON이 아닐 때도 UI가 깨지지 않도록 defensive parsing을 추가한다.
2. rate-limit/blocked/timeout을 구분해 사용자 메시지를 개선한다.
3. 검색 payload를 rarity별로 더 정확히 만든다.
   - unique: `name` + `type`
   - rare/magic/normal: base `type` 우선
   - unidentified/corrupted/quality 등은 이후 필터 후보로 남김
4. 실제 live API smoke는 기본 test suite에 넣지 않고, 수동 검증 스크립트 또는 문서 절차로 둔다.
5. 결과 UI에 “상위 listing 참고값이며 추천가/자동 가격 책정이 아님”을 계속 표시한다.

**Validation:**

```bash
npm test -- tests/main/officialTradeApi.test.ts tests/trade/officialTradeApi.test.ts tests/main/leagueApi.test.ts tests/trade/leagueApi.test.ts
npm test
```

Manual validation:

- 현재 리그 dropdown 로드.
- Standard fallback.
- 실제 아이템 텍스트 pasted/captured → API result/empty/error UI 확인.

---

### Phase 5: Overlay UX & Diagnostics

**Objective:** 게임 조작 방해를 최소화하면서 문제 보고와 복구를 쉽게 한다.

**Files:**

- Modify: `src/renderer/App.tsx`
- Modify: `src/main/windows/overlayWindow.ts`
- Modify: `src/main/hotkeys/registerHotkeys.ts`
- Modify: `src/shared/diagnostics/appDiagnostics.ts`
- Modify: `tests/safety/staticSafety.test.ts`
- Modify: `tests/main/registerHotkeys.test.ts`

**Tasks:**

1. Diagnostics/About에 “진단 정보 복사” 버튼을 추가한다.
   - app version
   - Electron/userData path
   - active mode: demo/clientLog/manual override
   - detected log path
   - hotkey registration success/failure
   - safety invariant status
2. Hotkey가 등록 실패했을 때 retry/re-register action을 노출한다.
3. overlay shell 위에서 wheel scroll이 안정적으로 동작하는지 수동 검증한다.
4. transparent 영역은 click-through 유지한다.
5. `Escape`는 renderer-local only 정책 유지.

**Validation:**

```bash
npm test -- tests/safety/staticSafety.test.ts tests/main/registerHotkeys.test.ts
npm run package:smoke
```

Manual validation:

- F6 toggle.
- Ctrl+Shift+D/Q panel 이동.
- Alt+O/D/Q legacy aliases.
- overlay hidden/visible 상태에서 POE2 이동/클릭 방해 여부.
- ESC가 게임 메뉴에 전달되는지.

---

### Phase 6: Release Packaging Polish

**Objective:** 실제 배포 가능한 Windows artifact 품질을 개선한다.

**Files:**

- Modify: `package.json`
- Modify: `scripts/smoke-package.mjs`
- Modify: `buildResources/*`
- Modify: `README.md`
- Modify: `docs/mvp-validation.md`

**Tasks:**

1. 정식 `.ico` 아이콘을 추가하고 `package.json` electron-builder `win.icon`에 연결한다.
2. `npm run dist` zip artifact를 항상 smoke 대상에 포함할지 결정한다.
3. `release/`는 Git에 넣지 않을지, 아니면 tagged artifact로만 관리할지 결정한다.
4. package smoke에 다음을 추가한다.
   - `app.asar` 안 main/preload/renderer 파일 존재.
   - forbidden API/static pattern 검사.
   - README 버전/패키지 버전 일치.
5. 배포 전 `docs/mvp-validation.md`의 수동 체크리스트를 실제로 수행하고 결과를 기록한다.

**Validation:**

```bash
npm run typecheck
npm test
npm run build
npm run package
npm run package:smoke
npm run dist
npm run package:smoke
npm audit --audit-level=low
```

---

## Suggested Immediate Next 5 Tasks

1. `docs/known-issues.md`의 공식 API 상태 불일치 수정.
2. 프로젝트 Git 초기화/원격 연결 여부 결정.
3. 실제 `C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt`에서 sanitized client-log fixture 확보.
4. client-log fixture 기반 area detection regression test 추가.
5. Diagnostics/About에 “진단 정보 복사”와 hotkey registration 상태를 더 명확히 표시.

---

## Open Questions

1. 이 프로젝트를 새 Git 저장소로 만들까, 아니면 기존 원격 저장소가 있는가?
2. Claude에서 마지막으로 남긴 TODO/계획/대화 요약이 있는가?
3. 우선순위는 어떤 쪽인가?
   - 실제 게임 로그 자동 감지 정확도
   - 시세/API 정확도
   - 퀘스트 데이터 완성도
   - 오버레이 UX/단축키 안정성
   - 배포 패키지 완성도
4. 실제 POE2 Kakao 로그/스크린샷 fixture를 프로젝트에 sanitized 형태로 저장해도 되는가?
