# External POE2 Quest Source Audit — 2026-06-21

## Goal

Compare ExileLens KR local quest data against external POE2 quest sources, especially Korean client names, before changing overlay data.

This audit intentionally separates:

1. **Quest titles** — official/source title of the quest.
2. **Quest objectives** — current in-game step text such as a boss/location target.
3. **Area detection** — Client.txt scene/code mapping.
4. **Reward reminders** — permanent stat/passive/spirit/resistance/etc. reminders.

Mixing these caused earlier mistakes, e.g. treating a current objective as the whole quest name or inventing a quest title from an area.

---

## Sources checked

### Primary structured sources

| Source | URL | Notes |
| --- | --- | --- |
| POE2 Wiki quest index | https://www.poe2wiki.net/wiki/Quest | English quest list grouped by Act 1/2/3/4/Interludes. |
| POE2 Wiki quest category | https://www.poe2wiki.net/wiki/Category:Quests | Cross-check source for quest pages. |
| POE2DB Korean quest page | https://poe2db.tw/kr/Quest | Korean quest names and rewards; strongest Korean-title source found. |
| POE2DB Act 4 | https://poe2db.tw/kr/Act_4 | Korean Act 4 areas/boss/item snippets surfaced in Naver results and direct fetch. |
| POE2Tools Act 4 | https://poe2tools.net/quests/act-4/ | Korean route/required quest guide surfaced from Naver search. |

### Korean community / article sources surfaced by search

| Source | URL | Notes |
| --- | --- | --- |
| Inven permanent reward article | https://www.inven.co.kr/webzine/news/?news=301655 | Korean article on act rewards/permanent stats; useful for reward validation. |
| Gameple required quest summary | https://www.gameple.co.kr/news/articleView.html?idxno=211295 | Korean article on required quests/rewards. |
| Gamechosun stat reward summary | https://www.gamechosun.co.kr/webzine/article/view.php?no=210980 | Korean reward-focused summary. |
| Naver Blog Act 4 guide | https://blog.naver.com/civile74/223990418826 | Search snippet explicitly mentions Act 4 `부족의 의술`, `와카파누 섬`, `노래하는 암굴`, `상어 지느러미`. |
| Arca POE2 patch notes thread | https://arca.live/b/poe2/172305357 | Search snippet mentions `4장 부족의 의술 퀘스트`. |
| Korean POE cafe / Inven posts | https://cafe.naver.com/poekorea and https://www.inven.co.kr/board/poe/6317/30387 | Search snippets show player discussion of Act 4 quest blockers such as shark-fin usage. |

Search engines used:

- Naver search pages
- Bing search pages
- DuckDuckGo HTML was attempted but returned no usable results in this environment.

---

## External quest lists extracted

### POE2 Wiki English quest index

#### Act 1

- Reaching Clearfell
- Treacherous Ground
- The Hunt Begins
- Cracks in the Earth
- Secrets in the Dark
- The Mysterious Shade
- Sorrow Among Stones
- The Trail of Corruption
- Ominous Altars
- The Lost Lute
- Finding the Forge
- The Mad Wolf of Ogham

#### Act 2

- Earning Passage
- The Well of Souls
- A Theft of Ivory
- The City of Seven Waters
- A Crown of Stone
- Ancient Vows
- Ascent to Power
- Tradition's Toll

#### Act 3

- Legacy of the Vaal
- Treasures of Utzaal
- The Slithering Dead
- Tribal Vengeance
- The Trials of Chaos

#### Act 4

- The Search
- Shrike Island
- Land of the Kin
- Whakapanu Island
- Abandoned Prison
- Dark Mists
- Utopia
- Tribal Medicine
- Forgotten Bounty
- Trial of the Ancestors
- Tawhoa's Test
- Tasalio's Test
- Ngamahu's Test
- Hostile Takeover

#### Interludes

- Recruit the Ezomytes
- Recruit the Maraketh
- Recruit the Vaal

---

## POE2DB Korean quest-title candidates

These were found from `https://poe2db.tw/kr/Quest` and are the best Korean title candidates so far.

### Act 1 candidates

- 클리어펠을 향해
- 변덕스러운 대지
- 사냥의 시작
- 땅에 생긴 균열
- 어둠 속의 비밀
- 수수께끼의 그늘
- 돌들 사이의 슬픔
- 타락의 흔적
- 불길한 제단
- 잃어버린 류트
- 대장간 찾기
- 오검의 미친 늑대

### Act 2 candidates

- 통행의 자격
- 타락의 흔적
- 영혼의 우물
- 상아 도둑
- 일곱 갈래 물의 도시
- 돌의 왕관
- 고대의 맹세
- 힘의 상승
- 관례의 대가
- 세케마의 시련

### Act 3 candidates

- 바알의 유산
- 웃자알의 보물
- 기어가는 망자
- 부족의 복수
- 시련의 대가의 도전
- 사원 탐험하기

### Act 4 candidates

- 탐색
- 눈먼 짐승
- 때까치 섬
- 와카파누 섬
- 버려진 감옥
- 부족의 의술
- 어둑한 안개
- 선조들의 심판
- 심연 파헤치기
- 트라투스의 검투사
- 속박
- 기쁨과 고통
- 역병 걸린 자에게 안식은 없다
- 빈 룬
- 상위 빈 룬
- 타호아의 시험
- 타살리오의 시험
- 나마후의 시험
- 사이렌 진주
- 땅에 생긴 균열
- 오리아스 공성전
- 룬 탐구자

### Other / trial / side candidates surfaced

- 세케마의 시련
- 시련의 대가의 도전
- 사원 탐험하기
- 수수께끼의 그늘

---

## Local data comparison — likely gaps or mismatches

Automated string comparison against local objective prefixes produced these review targets.

### Act 1

| External KR title | Local status | Notes |
| --- | --- | --- |
| 클리어펠을 향해 | Mismatch | Local uses `클리어펠에 도달하기`. POE2DB title likely better. |
| 땅에 생긴 균열 | Missing/misplaced | POE2DB shows this as a quest title/reward entry. Local has `Cracks in the Earth` concept under `act1-clearfell-encampment-cracks`, but Korean title may be absent. |

### Act 2

| External KR title | Local status | Notes |
| --- | --- | --- |
| 세케마의 시련 | Area present, quest title not represented as standalone | Local has area `act2-trial-of-the-sekhemas` and objective `힘의 상승: 세케마의 시련 완료...`. Decide if HUD should show `세케마의 시련` as its own quest title or only as the trial area objective. |

### Act 3

| External KR title | Local status | Notes |
| --- | --- | --- |
| 시련의 대가의 도전 | Mismatch | Local uses `혼돈의 시련`. POE2DB shows `시련의 대가의 도전` as a quest/reward title candidate. Need distinguish quest title vs trial mechanic. |
| 사원 탐험하기 | Missing | POE2DB Korean candidate exists; likely related to Temple/Incursion/Vaal side content. Need map to area before adding. |

### Act 4

| External KR title | Local status | Notes |
| --- | --- | --- |
| 부족의 의술 | Conflicting with current local user-confirmed objective | POE2DB/Wiki/community snippets strongly show `부족의 의술`. Local currently has `토코하마 부족장 타바카이`, from user in-game observation. Likely solution: quest title `부족의 의술`, objective detail `토코하마 부족장 타바카이`. Do not blindly overwrite without UI model change. |
| 트라투스의 검투사 | Missing | POE2DB Act 4 candidate. Need area/Client.txt evidence before adding to HUD. |
| 속박 | Missing | POE2DB Act 4 candidate. Need area/Client.txt evidence. |
| 기쁨과 고통 | Missing | POE2DB Act 4 candidate. Need area/Client.txt evidence. |
| 역병 걸린 자에게 안식은 없다 | Missing | POE2DB Act 4 candidate. Need area/Client.txt evidence. |
| 심연 파헤치기 | Mismatch | Local uses `심연`. User saw `심연`, POE2DB title is `심연 파헤치기`. Likely quest title vs UI-short title mismatch. |
| 빈 룬 | Partially represented | Local has `상위 빈 룬`; POE2DB has both `빈 룬` and `상위 빈 룬`. |

---

## Important finding: `부족의 심장부` issue

External sources disagree with the current local representation:

- POE2 Wiki Act 4 lists `Tribal Medicine`.
- POE2DB Korean lists `부족의 의술`.
- Naver search snippets found Korean guide text: `"부족의 의술" 시작`, `상어 지느러미의 용도 찾기`.
- Arca search snippet mentions `4장 부족의 의술 퀘스트`.
- User reported the in-game text shown in `부족의 심장부` was `토코하마 부족장 타바카이`.

Most likely interpretation:

```text
Quest title: 부족의 의술
Current objective/step/boss: 토코하마 부족장 타바카이
```

Recommended model change before fixing:

```ts
interface QuestObjective {
  id: string;
  questTitleKo: string;
  objectiveKo: string;
  labelKo: string; // backward-compatible display text
  kind: 'required' | 'optional';
  notesKo: string;
}
```

Then render can show:

```text
부족의 의술
- 토코하마 부족장 타바카이 처치/확인
```

This prevents future conflicts where a user sees a step title but sources list a quest title.

---

## Recommended next implementation pass

Do **not** bulk-edit all quest labels yet. The safe next pass is:

1. Add `questTitleKo` / `objectiveKo` optional fields to objective data.
2. Keep existing `labelKo` as compatibility display.
3. Add tests proving title/objective separation.
4. Convert only high-confidence mismatches:
   - `클리어펠에 도달하기` → title `클리어펠을 향해`, objective `클리어펠 야영지 진입`.
   - `심연` → title candidate `심연 파헤치기`, objective can include user-observed short `심연`.
   - `토코하마 부족장 타바카이` → title `부족의 의술`, objective `토코하마 부족장 타바카이`.
5. Add missing POE2DB candidates only when area/Client.txt/source context is clear.
6. Re-run:
   - `npm run typecheck`
   - `npm test`
   - `npm run quest:coverage -- "C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt"`

---

## Current conclusion

Local area matching is strong after the previous Client.txt coverage pass, but quest/title quality is incomplete.

Primary source of future bugs is no longer area detection; it is the lack of a data model distinction between:

- quest title,
- current objective text,
- reward reminder,
- area name.

Fix that model first, then safely import Korean titles from POE2DB/Wiki/community evidence.
