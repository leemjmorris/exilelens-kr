# ExileLens KR

ExileLens KR은 **Path of Exile 2 한국어 클라이언트용 Windows 오버레이**입니다.

현재 목표는 POE2 플레이 중 별도 브라우저/메모장을 오가지 않고 다음 정보를 안전하게 확인하는 것입니다.

- 공식 거래소 기반 아이템 시세 검색
- 현재 지역 기준 퀘스트/지역 체크리스트
- Act 1~4 및 막간 퀘스트 진행 현황 수동 관리
- `Client.txt` 읽기 전용 지역 감지
- 게임 조작을 방해하지 않는 click-through 오버레이

> 안전 원칙: ExileLens KR은 게임 메모리 읽기, 패킷 분석, 클라이언트 변조, 자동 클릭, 자동 거래, 전투/이동 매크로를 하지 않습니다.

---

## 현재 상태

- Platform: Windows
- App framework: Electron + React + TypeScript
- Package target: Windows unpacked directory + zip
- Product name: `ExileLens KR`
- App ID: `kr.exilelens.overlay`
- License: currently `UNLICENSED`
- Repository visibility: intended to remain **public**

---

## 주요 기능

### 1. 안전한 분리형 오버레이

ExileLens KR은 하나의 앱/트레이/백그라운드 프로세스 안에서 기능별 오버레이 창을 분리합니다.

- `F6`: 퀘스트 오버레이 표시/숨김
- `Ctrl+Shift+Q`: 퀘스트 오버레이 표시
- `Ctrl+Shift+D`: 시세 오버레이 표시
- 보조 단축키: `Alt+O`, `Alt+D`, `Alt+Q`
- 퀘스트 창: 크기 조절/위치 이동 가능, 위치·크기 저장, 표시 중 항상 위 유지
- 시세 창: 아이템 검색 시 필요할 때 표시, 헤더의 `×` 버튼으로 숨김
- `Escape`는 전역 단축키로 등록하지 않음
- 오버레이 표시 시 `showInactive()`를 사용해 게임 포커스를 최대한 유지
- 오버레이 바깥 투명 영역은 click-through로 게임 조작 통과
- 오버레이 UI 위에서만 마우스/휠 입력을 받아 버튼, 드롭다운, 스크롤 사용 가능

### 2. 시스템 트레이 / 작업표시줄 동작

앱이 실행 중이면 시스템 트레이 아이콘이 항상 표시됩니다.

- 앱 실행 중: 시스템 트레이 아이콘 유지
- 퀘스트/시세 창 숨김: 작업표시줄에서 제거
- `F6` 또는 `Ctrl+Shift+Q`로 퀘스트 창 표시: 작업표시줄에 표시, 항상 위 유지
- `Ctrl+Shift+D`로 시세 창 표시: 작업표시줄에 표시
- 각 창을 숨기면 해당 창은 작업표시줄에서 제거
- 트레이 메뉴:
  - 퀘스트 오버레이 열기/숨기기
  - 시세 오버레이 열기/숨기기
  - 전체 오버레이 숨기기
  - 종료

### 3. 단일 스크롤 컨테이너 UI

오버레이는 다음 구조를 사용합니다.

```text
overlay-shell
├─ overlay-header   # 시세 / 퀘스트 / 설정 / 숨기기 탑바
└─ overlay-content  # 탑바 아래 전체 컨텐츠 단일 스크롤 영역
```

- 탑바는 고정
- 스크롤바는 컨텐츠 영역 하나만 사용
- 카드/본문/빈 공간 위에서도 휠 스크롤 가능

### 4. `Client.txt` 읽기 전용 지역 감지

설정된 POE2 로그 파일을 읽기 전용으로 tail하여 현재 지역을 감지합니다.

지원하는 로그 패턴:

1. `Generating level N area "areaId" with seed ...`
2. `[SCENE] Set Source [ZoneName]`
3. `You have entered ...`
4. 한국어 `...에 입장했습니다` / `... 입장`

특징:

- Kakao client 로그 경로 지원
- Steam/GGG/Epic/문서 폴더 후보 경로 탐색
- UTF-8 한국어 로그에서 byte offset과 JS string offset이 어긋나는 문제 방지
- `(null)`, `(unknown)`, `Act N`, `3장` 같은 placeholder는 지역으로 처리하지 않음
- 수동 지역 보정 지원

### 5. 퀘스트 체크리스트

퀘스트 탭에서 현재 지역과 전체 지역의 퀘스트 체크리스트를 볼 수 있습니다.

현재 포함 범위:

- Act 1
- Act 2
- Act 3
- 막간 / Interlude
- Act 4

중요 정책:

- **지역 도달만으로 퀘스트를 완료 처리하지 않습니다.**
- 완료/미완료는 사용자가 직접 클릭한 상태를 기준으로 저장합니다.
- 현재 지역 감지는 “이 지역에서 해야 할 퀘스트를 보여주기 위한 강조/탐색 용도”입니다.
- 실제 퀘스트 완료를 안정적으로 식별할 수 있는 신뢰 가능한 로그 신호가 발견되기 전까지 자동 완료 판정은 하지 않습니다.

이 정책은 “지나친 퀘스트를 찾는 것”이 핵심 목표이기 때문에 중요합니다.

### 6. 공식 거래소 기반 시세 검색

시세 탭은 POE2 아이템 텍스트를 파싱하고 공식 거래소 API로 검색합니다.

지원 흐름:

1. 사용자가 아이템 위에서 캡처 버튼 클릭
2. 오버레이가 잠시 숨겨짐
3. 활성 창에 `Ctrl+C` 복사 요청 1회 전송
4. 클립보드에서 아이템 텍스트 읽기
5. 기존 클립보드 복원
6. 아이템 파싱
7. 공식 POE2 거래소 API 검색
8. 상위 listing 가격 표시

안전 경계:

- 사용자가 버튼을 누를 때만 캡처
- 반복 polling 없음
- 자동 귓속말 없음
- 자동 클릭 없음
- 자동 거래 없음
- 자동 가격 책정/추천가 보장 없음

Fallback:

- 수동 붙여넣기
- 검색 초안 복사
- 공식 거래소 URL 열기

### 7. 설정 / 진단

설정 탭에서 다음을 관리합니다.

- `Client.txt` / `KakaoClient.txt` 경로
- Client 로그 자동 찾기
- 데모 모드
- 거래소 리그 선택
- 지역 수동 보정
- Diagnostics / About

Diagnostics에는 다음이 표시됩니다.

- 앱 버전
- userData 저장 경로
- 현재 모드: demo / client_log / manual_override
- 전역 단축키 상태
- 안전 경계 상태

---

## 설치 / 개발 환경

### 요구 사항

- Windows
- Node.js 22.x 권장
- npm

이 개발 환경에서는 Node.js가 다음 위치에 설치되어 있습니다.

```bash
export PATH="/c/Users/happy/dev/tools/node-v22.13.1-win-x64:$PATH"
```

일반 Windows PowerShell에서는 본인 Node.js 설치 경로가 PATH에 있으면 됩니다.

### 의존성 설치

```bash
npm install
```

### 개발 실행

```bash
npm run dev
```

### 타입체크 / 테스트 / 빌드

```bash
npm run typecheck
npm test
npm run build
npm run package:smoke
```

또는 CI 동일 검증:

```bash
npm run ci
```

### 패키징

Windows unpacked 앱:

```bash
npm run package
```

출력:

```text
release/win-unpacked/ExileLens KR.exe
```

Windows zip 배포본:

```bash
npm run dist
```

출력:

```text
release/ExileLens KR-0.1.0-x64.zip
```

패키지 smoke test:

```bash
npm run package:smoke
```

보안 audit:

```bash
npm run audit:low
```

---

## 테스트 커버리지

Vitest 기반 테스트가 포함되어 있습니다.

주요 테스트 범위:

- 지역 로그 파서
- Kakao/한국어 `Client.txt` byte-offset tail 처리
- 지역 매칭 / alias / placeholder 필터링
- 수동 지역 보정
- Act 1~4 / 막간 데이터 커버리지
- 퀘스트 완료 정책: 지역 기준 자동 완료 금지
- 아이템 텍스트 파서
- 공식 거래소 API payload / 응답 처리
- 전역 단축키 등록
- item clipboard capture
- 설정 저장/정규화
- 안전 정적 분석
- 패키징 smoke test

현재 검증 명령 예시:

```bash
npm run typecheck
npm test
npm run build
npm run package:smoke
```

---

## GitHub 연동

현재 remote는 SSH 사용을 권장합니다.

```bash
git remote -v
```

정상 예시:

```text
origin  git@github.com:leemjmorris/exilelens-kr.git (fetch)
origin  git@github.com:leemjmorris/exilelens-kr.git (push)
```

SSH 확인:

```bash
ssh -T git@github.com
```

성공 예시:

```text
Hi leemjmorris! You've successfully authenticated, but GitHub does not provide shell access.
```

push 전 확인:

```bash
git fetch origin
git status --short --branch
```

---

## 데이터 출처 / 검증 상태

퀘스트/지역 seed 데이터는 공개 wiki와 POE2 DB 한국어 페이지를 참고해 구성했습니다.

참고 문서:

- [`docs/data-sources.md`](docs/data-sources.md)
- [`docs/known-issues.md`](docs/known-issues.md)
- [`docs/mvp-validation.md`](docs/mvp-validation.md)

주의:

- 일부 한국어 퀘스트/목표 문구는 실제 한국 서버 클라이언트에서 계속 검증 필요
- 퀘스트 완료 여부는 현재 게임 내부 상태를 읽지 않음
- 완료 상태는 사용자가 직접 체크한 로컬 상태로 관리

---

## 안전 경계

ExileLens KR은 다음을 하지 않습니다.

- 게임 메모리 읽기
- 게임 프로세스 쓰기/패치
- 패킷 캡처/가로채기
- 자동 이동/전투/스킬 사용
- 자동 클릭
- 자동 귓속말
- 자동 거래
- 매크로 반복 실행
- 게임 클라이언트 파일 변조

앱이 사용하는 입력은 다음으로 제한됩니다.

- 사용자가 직접 누른 단축키
- 사용자가 직접 누른 UI 버튼
- 읽기 전용 `Client.txt` 로그
- 사용자가 복사하거나 붙여넣은 아이템 텍스트
- 공식 POE2 거래소의 읽기 전용 검색 API

---

## 알려진 제한

- 실제 앱 아이콘은 아직 placeholder 상태입니다.
- 일부 퀘스트 목표 문구는 한국 서버 UI 기준 추가 검증이 필요합니다.
- `Client.txt`에는 신뢰 가능한 “퀘스트 완료” 로그가 확인되지 않아 자동 완료 판정은 비활성입니다.
- 아이템 캡처는 활성 창/focus 상태에 따라 실패할 수 있으며, 수동 붙여넣기 fallback을 제공합니다.
- 공식 거래소 API 결과는 listing 기반 참고 정보이며 시세 보장/추천가가 아닙니다.

---

## 추천 다음 작업

- 실제 앱 아이콘 `.ico` 추가
- 릴리스용 installer target 추가 여부 결정
- 한국 서버 Act/퀘스트 UI 스크린샷 기반 문구 검증
- 완료 보상/영구 보상 체크리스트 강화
- 퀘스트 검색/필터 기능 추가
- 수동 완료 상태 export/import 추가
- GitHub Release 자동 업로드 workflow 추가

---

## License

현재 `package.json` 기준 라이선스는 `UNLICENSED`입니다.

공개 저장소로 유지하더라도, 재사용/배포 허용 범위를 명확히 하려면 이후 MIT/Apache-2.0/GPL 등 명시적 라이선스를 선택하는 것이 좋습니다.
