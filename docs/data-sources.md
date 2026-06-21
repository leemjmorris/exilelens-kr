# ExileLens KR 데이터 소스와 검증 상태

최종 업데이트: 2026-06-19

## 범위

이 문서는 현재 앱에 포함된 POE2 Act 1 지역/체크리스트 seed 데이터의 출처와 한계를 기록한다. ExileLens KR은 게임 클라이언트 메모리 읽기, 패킷 가로채기, 클라이언트 변조, 자동 클릭/매크로를 사용하지 않는다. 지역 감지는 사용자가 지정한 `Client.txt` 로그와 수동 오버라이드에만 의존한다.

## 사용한 공개 출처

다음 공개 wiki 페이지를 2026-06-19에 확인했다.

- poe2wiki Act 1: https://www.poe2wiki.net/wiki/Act_1
  - Act 1 지역 진행 표, 지역 연결, 일부 보스명 확인에 사용.
- poe2wiki Quest 목록: https://www.poe2wiki.net/wiki/Quest
  - Act 1 퀘스트 목록과 optional 표기 확인에 사용.
- poe2wiki 개별 퀘스트 페이지:
  - https://www.poe2wiki.net/wiki/Reaching_Clearfell
  - https://www.poe2wiki.net/wiki/Treacherous_Ground
  - https://www.poe2wiki.net/wiki/The_Hunt_Begins
  - https://www.poe2wiki.net/wiki/Cracks_in_the_Earth
  - https://www.poe2wiki.net/wiki/Secrets_in_the_Dark
  - https://www.poe2wiki.net/wiki/The_Mysterious_Shade
  - https://www.poe2wiki.net/wiki/Sorrow_Among_Stones
  - https://www.poe2wiki.net/wiki/The_Trail_of_Corruption
  - https://www.poe2wiki.net/wiki/Ominous_Altars
  - https://www.poe2wiki.net/wiki/The_Lost_Lute
  - https://www.poe2wiki.net/wiki/Finding_the_Forge
  - https://www.poe2wiki.net/wiki/The_Mad_Wolf_of_Ogham

## 현재 반영된 데이터

`src/shared/quests/data/act1.ts`에는 Act 1 진행 표 기반의 주요 지역을 추가했다.

- The Riverbank
- Clearfell Encampment
- Clearfell
- Mud Burrow
- The Grelwood
- The Red Vale
- The Grim Tangle
- Cemetery of the Eternals
- Tomb of the Consort
- Mausoleum of the Praetor
- Hunting Grounds
- Freythorn
- Lost Catacombs
- Ogham Farmlands
- Ogham Village
- The Manor Ramparts
- Ogham Manor

체크리스트는 공개 wiki에서 비교적 신뢰 가능한 수준으로 확인된 Act 1 퀘스트/지역 연결만 seed로 넣었다. 다만 이 데이터는 실제 한국어 클라이언트 로그와 게임 내 한국어 퀘스트 텍스트로 검증된 것이 아니므로 모든 Act 1 체크리스트와 지역의 `needsVerification`을 `true`로 유지한다.

## GitHub POE2 오버레이 조사 반영 (2026-06-19)

공개 오픈소스 POE2 액트 가이드/오버레이 프로젝트들을 비교한 결과, 지역 자동 감지는 지역명 문장보다 `Client.txt`의 안정적인 areaId 로그를 우선하는 방식이 더 강건하다고 판단했다.

확인한 구현 패턴:

- `Lechkolion/poe2-leveling-overlay`: `Generating level N area "areaId"`를 1차로 파싱하고, `[SCENE] Set Source [ZoneName]`을 fallback으로 사용. Kakao/Steam/GGG/Epic 및 `KakaoClient.txt` 후보 경로도 고려.
- `matthewloverton/poe2campaigntracker`: Rust 백엔드에서 `Generating level (N) area "..." with seed`를 읽기 전용으로 tail하며 parser tests 보유.
- `UmbraMalik/poe2-act-companion-overlay`: `Generating level ... area`, `[SCENE] Set Source`, `You have entered`, `Entering area` 등 다중 fallback과 tail bootstrap/폴링 fallback을 사용.
- `zireael31/Poe2-Act-Overlay`: 수동 hotkey route 중심이며 자동 지역 감지는 아직 미구현.

이에 따라 ExileLens KR도 다음 순서로 안전한 읽기 전용 로그 감지를 수행한다.

1. `Generating level N area "areaId" with seed ...` — 언어 독립적인 areaId라서 1차 신호로 사용.
2. `[SCENE] Set Source [ZoneName]` — areaId가 없을 때 fallback으로 사용.
3. 기존 `You have entered ...` 영어 진입 문장.
4. 기존 `...에 입장했습니다` / `... 입장` 한국어 진입 문장.

`(null)`, `(unknown)`, `Act N` 같은 placeholder/타이틀 화면 값은 지역으로 처리하지 않는다. Act 1에는 조사된 areaId alias(`g1_1`, `g1_town`, `g1_2` ... `g1_15`)를 추가했지만 실제 한국어 클라이언트 지역명과 체크리스트 문구는 계속 `needsVerification` 상태로 둔다. 기본 로그 경로 후보에는 Documents `My Games\\Path of Exile 2`의 `Client.txt`/`KakaoClient.txt`와 Kakao/Steam/GGG/Epic의 대표 설치 경로를 포함한다. Windows 레지스트리 기반 설치 경로 탐색은 권한/환경 차이가 있어 후속 과제로 남긴다.

## 검증됨 / 검증 필요

### 공개 출처로 확인한 내용

- Act 1 영어 지역명과 대략적인 진행 순서.
- Act 1 퀘스트 목록과 optional 여부.
- 일부 퀘스트의 영어 목표, 보스, 관련 지역.
- The Lost Lute 보상이 무기 세트 패시브 포인트 2개로 기재되어 있다는 점.

### 아직 검증 필요

- 한국어 Client.txt에 실제로 기록되는 지역명 문자열.
- 한국어 UI에 표시되는 공식 지역명/퀘스트명/목표명/보상명.
- 패치/리그별로 노출 조건이 바뀌는 선택 퀘스트:
  - Cracks in the Earth는 poe2wiki에 Rise of the Abyssal 전용 퀘스트로 기재되어 있어 현 리그 노출 여부 확인 필요.
  - The Hunt Begins 등 리그/콘텐츠 소개 퀘스트의 실제 노출 시점 확인 필요.
- 영구 보상 여부와 정확한 보상 수치:
  - The Lost Lute의 무기 세트 패시브 2포인트는 wiki 기반으로 표기했지만, KR 클라이언트/실제 보상 로그 검증 필요.
- 출처 간 명칭 차이:
  - Act 1 진행 표는 최종 지역을 `Ogham Manor`로 표기한다.
  - The Mad Wolf of Ogham 퀘스트 페이지는 관련 지역을 `The Iron Manor`로 표기한다.
  - 앱은 `Ogham Manor`를 기본 지역명으로 두고 `The Iron Manor`를 영어 로그명 fallback에 포함했다.

## 필요한 사용자 제공 fixture

MVP 정확도를 높이려면 다음 fixture가 필요하다.

1. 한국어 클라이언트의 Act 1 `Client.txt` 입장 로그 샘플
   - 예: 각 지역 진입 시 기록되는 원문 라인.
   - 목적: `logNamesKo`와 지역 감지 정밀도 검증.
2. 한국어 UI 퀘스트 패널 스크린샷 또는 수동 전사 텍스트
   - 목적: `labelKo`, `notesKo`의 공식 번역 반영.
3. 선택 퀘스트 완료/보상 확인 샘플
   - 목적: required/optional 및 영구 보상 표기 정리.
4. 아이템 클립보드 샘플
   - 목적: 아이템 파서와 거래 검색 draft 생성 검증.

## 데이터 무결성 테스트

`tests/quests/act1DataIntegrity.test.ts`에서 다음을 검증한다.

- Act 1 area id 중복 없음.
- 모든 checklist가 존재하는 area를 참조.
- Act 1 objective id 중복 없음.
- 각 area의 `guideStepIds`가 같은 area checklist의 objective id와 연결됨.
- required/optional 그룹이 실제 seed 데이터에서 모두 동작.
