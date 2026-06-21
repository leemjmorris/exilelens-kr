# MVP 검증 가이드

이 문서는 ExileLens KR MVP를 릴리스 후보로 확인하기 위한 자동/수동 검증 절차입니다.
남은 검증 공백과 알려진 제한은 [`docs/known-issues.md`](./known-issues.md)에 별도로 정리합니다.

## 사전 준비

Windows Git Bash/MSYS 셸에서 프로젝트 루트(`C:\Users\happy\dev\exilelens-kr`)로 이동한 뒤 Node 경로를 설정합니다.

```bash
export PATH="/c/Users/happy/dev/tools/node-v22.13.1-win-x64:$PATH"
cd /c/Users/happy/dev/exilelens-kr
npm install
```

## 자동 검증 명령

릴리스 후보마다 아래 명령을 순서대로 실행합니다.

```bash
npm run typecheck
npm test
npm run build
npm run package:smoke
npm run package
npm run package:smoke
```

선택적으로 zip 배포본까지 만들 때는 다음을 실행합니다.

```bash
npm run dist
npm run package:smoke
```

예상 결과:

- `npm run typecheck`: TypeScript 오류 없이 종료 코드 0.
- `npm test`: 모든 Vitest 테스트 통과. 특히 `tests/main/registerHotkeys.test.ts`가 `Escape` 전역 단축키 미등록을 검증해야 합니다.
- `npm run build`: `out/main/index.js`, `out/preload/index.mjs`, `out/renderer/index.html` 생성.
- `npm run package:smoke`: package metadata, 빌드 산출물, `Escape` 미등록 검사 통과. `npm run package` 후에는 `release/win-unpacked/ExileLens KR.exe`도 확인.
- `npm run package`: electron-builder Windows unpacked directory 생성.
- `npm run dist`: electron-builder Windows zip artifact 생성.

## 수동 스모크 체크리스트

패키지 산출물(`release/win-unpacked/ExileLens KR.exe`) 또는 개발 모드(`npm run dev`)로 앱을 실행해 확인합니다.

### 실행/오버레이

- [ ] 앱이 예외 없이 실행되고 오버레이 창이 표시된다.
- [ ] `F6` 또는 보조 `Alt+O`를 누르면 오버레이가 켜지고, 다시 누르면 숨겨진다.
- [ ] `Ctrl+Shift+D` 또는 보조 `Alt+D`를 누르면 시세/아이템 패널이 표시된다.
- [ ] `Ctrl+Shift+Q` 또는 보조 `Alt+Q`를 누르면 퀘스트 패널이 표시된다.
- [ ] 헤더의 `시세`, `퀘스트`, `설정`, `숨기기` 버튼도 같은 기능을 수행한다.
- [ ] POE2가 활성 창일 때 `Escape`는 게임으로 전달되어 게임 메뉴/닫기 동작을 방해하지 않는다.
- [ ] `Escape`는 Electron `globalShortcut`으로 등록되지 않는다. 새 단축키를 추가할 때도 게임 핵심 입력을 빼앗지 않는다.

### 아이템/거래소 흐름

- [ ] 시세 탭의 수동 붙여넣기 영역에 POE 스타일 아이템 텍스트를 넣으면 파싱 결과가 표시된다.
- [ ] `아이템 캡처`는 사용자가 버튼을 눌렀을 때만 시도되며 자동 반복/매크로처럼 동작하지 않는다.
- [ ] 검색 초안은 가격 데이터나 가짜 시세를 표시하지 않고, 수동 검색용 텍스트/공식 거래소 링크만 제공한다.
- [ ] 외부 링크는 `https://www.pathofexile.com/trade2/search/poe2/...`만 열린다.

### 퀘스트/지역 흐름

- [ ] 퀘스트 체크리스트의 필수/선택 항목이 표시되고, 완료 체크 시 흐리게 표시되며 앱 재시작 후 유지된다.
- [ ] `Client.txt` 경로를 설정하면 현재 지역 UI가 로그 기반으로 갱신된다.
- [ ] 데모 모드를 켜면 로그 감시 없이 샘플 지역이 표시된다.
- [ ] `지역 수동 보정`에서 Act/지역을 선택하면 현재 지역과 체크리스트가 즉시 바뀐다.
- [ ] `자동/데모 감지로 복귀`로 수동 보정을 해제할 수 있다.

### 설정/지속성

- [ ] `Client.txt` 경로, 데모 모드, 리그, 수동 지역 보정값이 설정 파일에 저장되고 재시작 후 복원된다.
- [ ] 리그 값은 거래소 URL placeholder/검색 초안에 반영된다.

## 안전 경계

MVP 검증 중 다음 동작은 실패로 간주합니다.

- 게임 메모리 읽기, 패킷 검사, 클라이언트 수정.
- 자동 클릭, 자동 귓속말, 자동 거래, 전투 자동화.
- 사용자가 누른 단일 버튼 동작을 넘어선 반복 입력/매크로.
- `Escape` 전역 단축키 등록.
- 실시간 가격 데이터가 없는데 가격/시세를 만들어 표시하는 행위.

## 릴리스 메모

- 현재 아이콘 파일은 제공되지 않았습니다. `buildResources/README.md`에 placeholder 상태를 명시했고, 실제 배포 전 `.ico` 아이콘을 추가한 뒤 electron-builder `win.icon` 설정을 연결해야 합니다.
- 현재 퀘스트 데이터는 Act 1 placeholder이며 UI에 `검증 필요`로 표시되는 항목은 실제 POE2 한국어 클라이언트 기준 추가 검증이 필요합니다.
