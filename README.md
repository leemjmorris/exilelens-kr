# ExileLens KR

POE2 한국어 오버레이 MVP입니다. 현재 범위는 지역 감지 기반 퀘스트 체크리스트, 안전한 오버레이 제어,
그리고 POE 스타일 아이템 텍스트 캡처/파싱, 공식 POE2 거래소 API 검색 및 안전한 거래소 수동 검색 fallback입니다.

## 실행/검증

```bash
export PATH="/c/Users/happy/dev/tools/node-v22.13.1-win-x64:$PATH"
npm run typecheck
npm test
npm run build
npm run package:smoke
npm run package
npm run package:smoke
npm run dev
```

릴리스 패키징은 `electron-builder` 기반입니다.

- `npm run package`: Windows unpacked directory를 `release/win-unpacked`에 생성합니다.
- `npm run dist`: Windows zip 배포본을 `release/`에 생성합니다.
- `npm run package:smoke`: package metadata, 빌드 산출물, 패키지 산출물(있는 경우), `Escape` 전역 단축키 미등록을 확인합니다.
- 자세한 MVP 검증 절차와 수동 체크리스트는 [`docs/mvp-validation.md`](docs/mvp-validation.md)를 참고하세요.
- 알려진 제한/검증 공백은 [`docs/known-issues.md`](docs/known-issues.md)에 정리되어 있습니다.

## 릴리스/라이선스 메모

- `productName`은 `ExileLens KR`, 앱 ID는 `kr.exilelens.overlay`입니다.
- 현재 저장소는 MVP 검증용이며 `UNLICENSED`로 표시되어 있습니다. 재배포/공개 전 명시적 라이선스를 결정하세요.
- 실제 앱 아이콘은 아직 없습니다. `buildResources/README.md`에 placeholder 상태를 남겼으며, 배포 전 `.ico`를 추가하고 `package.json`의 electron-builder `win.icon`에 연결하세요.

## 안전 경계

- 게임 메모리 읽기, 패킷 검사, 클라이언트 수정, 자동 클릭, 전투/거래 자동화, 매크로를 하지 않습니다.
- 전역 단축키는 현재 `F6`(오버레이 켜기/끄기), `Ctrl+Shift+D`(시세 패널 표시), `Ctrl+Shift+Q`(퀘스트 패널 표시)를 기본으로 등록하고, 기존 `Alt+O`/`Alt+D`/`Alt+Q`도 보조 별칭으로 유지합니다.
- `Escape`는 전역 단축키로 등록하지 않습니다. 게임의 ESC 입력을 빼앗지 않기 위한 회귀 테스트가 있습니다.
- 단축키로 오버레이를 표시할 때는 `showInactive()`를 사용하여 게임 포커스를 최대한 유지합니다. 체크리스트를 조작하려면 사용자가 오버레이를 직접 클릭합니다.
- 오버레이 숨김은 헤더의 `숨기기` 버튼으로 수행합니다.
- 아이템 캡처는 사용자가 `아이템 캡처` 버튼을 누를 때만 실행합니다. 현재 클립보드 텍스트를 저장하고,
  클립보드를 잠시 비운 뒤 활성 창에 `Ctrl+C` 복사 요청을 한 번 보내고, 복사된 텍스트를 읽은 후 기존
  클립보드를 복원합니다.
- 아이템 캡처는 가격 조회를 위한 복사 텍스트만 다룹니다. 메모리 읽기, 패킷 검사, 클라이언트 수정,
  자동 클릭, 거래/전투 자동화는 하지 않습니다.
- 자동 캡처가 실패하거나 테스트/개발 환경에서 사용할 수 없으면 시세 탭의 수동 붙여넣기 영역에 아이템
  텍스트를 직접 넣어 동일 파서를 사용할 수 있습니다.
- 거래소 기능은 공식 POE2 거래소 API(`/api/trade2/search/poe2/{league}` + `/api/trade2/fetch/...`)에 읽기 전용 검색 요청을 보내 상위 결과 가격을 표시합니다.
- UI의 `공식 API 검색`은 가격 결과를 읽어오기만 하며, 자동 귓속말/자동 클릭/자동 거래는 하지 않습니다.
- UI의 `초안 복사`는 fallback 검색 텍스트를 클립보드에 복사하고, `공식 거래소 열기`는 허용된 공식 거래소 URL만 외부 브라우저로 엽니다.

## 설정

설정 탭에서 다음을 변경할 수 있습니다.

- `Client.txt` 경로: POE2 로그 파일 위치입니다. `Client.txt 자동 찾기` 버튼을 누르면 KakaoGames/Daum/문서/Steam/GGG/Epic 후보 경로를 검색해 발견한 로그를 저장하고 데모 모드를 끕니다.
- 데모 모드: 켜면 `Client.txt` 감시를 끄고 샘플 지역 데이터를 표시합니다.
- 거래소 리그: 공식 POE2 거래소 리그 API에서 현재 선택 가능한 리그를 불러와 드롭다운으로 표시합니다. 기본 추천은 현재 소프트코어 챌린지 리그이며, 실패 시 Standard/Hardcore fallback을 사용합니다.

경로가 비어 있으면 Windows 문서 폴더 아래의 기본 POE2 `Client.txt` 위치를 자동으로 시도합니다. 현재 퀘스트 데이터는 Act 1 플레이스홀더이며, 검증이 필요한 항목은 UI에 `검증 필요`로 표시됩니다.

## 퀘스트 지역 수동 보정

퀘스트 탭의 `지역 수동 보정` 섹션에서 로컬 `areaDefinitions`에 등록된 Act/지역을 직접 선택할 수 있습니다.

- `Client.txt` 감지가 실패했거나 감지 지역이 틀렸을 때 선택 즉시 현재 지역 카드와 체크리스트가 해당 지역으로 바뀝니다.
- 선택한 지역 ID는 설정 파일에 `manualAreaOverrideId`로 저장되어 앱을 다시 열어도 유지됩니다.
- 수동 보정 중에는 자동/데모 지역 표시보다 수동 선택이 우선합니다.
- `자동/데모 감지로 복귀` 버튼을 누르면 수동 보정을 해제하고, 데모 모드이면 샘플 지역으로, 데모 모드가 꺼져 있고 `Client.txt` 경로가 있으면 로그 감시 모드로 돌아갑니다.
- 이 기능은 UI 선택과 설정 저장만 수행하며 게임 입력, 메모리, 패킷, 파일 수정을 하지 않습니다.

## 진단/About

설정 탭 하단의 `Diagnostics / About` 영역은 앱 버전, Electron `userData` 설정 저장 위치, 현재 동작 모드(데모/Client.txt/수동 보정), 안전 상태를 표시합니다. 안전 상태에는 `Escape` 전역 단축키 미등록, 전역 단축키 등록 상태(`F6`/`Ctrl+Shift+D`/`Ctrl+Shift+Q` 및 보조 `Alt+O`/`Alt+D`/`Alt+Q`), 메모리/패킷 접근 및 자동 클릭·거래 자동화가 없다는 점을 명시합니다.

## 아이템 텍스트 파서

시세 탭은 현재 가격 API 연동 전 단계의 안전한 vertical slice입니다.

- `희귀도/Rarity`, 이름, 베이스 타입, `아이템 레벨/Item Level`을 추출합니다.
- 요구사항, 기본 수치, 옵션/모드 라인을 가능한 한 분류합니다.
- 알 수 없는 한국어/영어 줄은 실패시키지 않고 원문 및 미분류 라인으로 보존합니다.
- 한국어 예시 fixture는 검증용 샘플이며 실제 POE2 한국어 클라이언트 출력과 다를 수 있습니다.

## 거래소 검색 API 제한 사항

- `src/main/trade/officialTradeApi.ts`는 공식 POE2 거래소 API에 `POST /api/trade2/search/poe2/{league}` 검색 요청을 보내고, 반환된 listing id를 `GET /api/trade2/fetch/...`로 조회합니다.
- `src/shared/trade/officialTradeApi.ts`는 파싱된 아이템 이름/베이스 타입으로 공식 API 요청 payload를 만듭니다.
- 검색은 사용자가 `공식 API 검색` 버튼을 누를 때만 실행됩니다. 반복 polling, 자동 귓속말, 자동 클릭, 자동 거래는 하지 않습니다.
- 공식 API 실패/빈 결과/네트워크 오류 시 UI에 오류를 표시하고, `초안 복사`와 `공식 거래소 열기` fallback을 유지합니다.
- API 결과는 공식 거래소 listing의 상위 가격 표시일 뿐이며, 시세 보장/추천가/자동 가격 책정이 아닙니다.
- 자동 귓속말, 자동 클릭, 거래 자동화, 게임 입력 매크로는 범위 밖이며 구현하지 않습니다.
