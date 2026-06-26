# Essential Quest Dataset Policy — 2026-06-27

## Decision

The quest HUD no longer tries to display every POE2 campaign/side quest.

The active scope is:

- Act 1
- Act 2
- Act 3
- Interlude / recruit segments: Ezomyte, Maraketh, Vaal
- Act 4

Within that scope, the HUD displays only must-do permanent reward / unlock objectives. Main-route-only quests, flavor quests, side quests without permanent character power, and unverified objective text are intentionally excluded.

The reset started from the supplied 0.5.0 Korean essential rewards guide and then keeps Act 4 / interlude permanent rewards from the previous sourced POE2DB/Wiki audit.

Reference guide:

<https://tamagotch.tistory.com/entry/%ED%8C%A8%EC%8A%A4-%EC%98%A4%EB%B8%8C-%EC%95%A1%EC%9E%90%EC%9D%BC-2-%EC%95%A1%ED%8A%B8-%ED%95%84%EC%88%98-%ED%80%98%EC%8A%A4%ED%8A%B8-%EA%B0%80%EC%9D%B4%EB%93%9C>

External source audit:

- `docs/external-quest-source-audit-2026-06-21.md`

## Included objectives

### Act 1 normal

- 클리어펠: 썩은 무리의 베이라 처치 — 냉기 저항 +10%
- 사냥터: 까마귀종 처치 — 패시브 스킬 2포인트
- 프레이쏜: 의식 제단 4개 + 연무 속의 왕 — 정신력 +30
- 오검 농지: 우나의 류트 전달 — 패시브 스킬 2포인트
- 오검 마을: 대장장이 도구 전달 — 분해 작업대
- 오검 저택: 살아있는 의례 양초덩어리 처치 — 생명력 최대치 +20

### Act 2 normal

- 케스: 위압자 여왕 카발라 처치 — 패시브 스킬 2포인트
- 거신의 계곡: 유물 2개 성소 배치 — 성소 선택 보상
- 데샤르: 마지막 편지 전달 — 패시브 스킬 2포인트
- 데샤르의 첨탑: 가루칸의 자매들 성소 — 번개 저항 +10%

### Act 3 normal

- 모래에 휩쓸린 습지: 아자크 모닥불 상자 — 하위 쥬얼러 오브
- 밀림 유적: 강력한 은빛주먹 처치 — 패시브 스킬 2포인트
- 독액 지하실: 독액 영약 전달 — 영약 선택
- 아자크 습지대: 습지대 마녀 이그나두크 처치 — 정신력 +30
- 지콰니의 기계실: 잔류하는 기계턱 처치 — 화염 저항 +10%
- 녹아내린 금고: 제련 장인 메크툴 처치 — 제련 작업대
- 아고라트: 희생의 심장 사용 — 패시브 스킬 2포인트

### Interlude / recruit segments

- 울븐홀드: Oswin 처치 — 패시브 스킬 2포인트
- 카리 교차로: Skullmaw Stairway 보상 — 최대 생명력 5%
- 카리 교차로: Worm and Scorpion 처치 — 패시브 스킬 2포인트
- 키마: 선택 보상
- 크리아르 마을: Lythara 처치 — 최대 정신력 40
- 울부짖는 동굴: The Abominable Yeti 처치 — 패시브 스킬 2포인트

### Act 4

- 버려진 감옥: 정의의 여신 — 플라스크 생명력/마나 회복 30% 선택
- 여정의 끝: Omniphobia 처치 — 패시브 스킬 2포인트
- 친족의 섬: 눈먼 짐승 처치 — 상위 빈 룬
- 거대한 흰 존재 — 방어/회피/에너지 보호막 계열 영구 보상 선택
- 망자의 전당: 나발리의 안식 — 최대 마나 5%
- 선조들의 심판: 히네코라와 대화 — 패시브 스킬 2포인트

## Excluded by policy

The following are intentionally not displayed in the HUD unless they become part of the must-do permanent reward policy:

- Act 4 side/progression quests such as 부족의 의술, 심연, 외딴 초소, 사이렌 진주, 오리아스 공성전.
- Interlude recruit wrapper objectives such as 에조미어인 모집 / 마라케스인 모집 / 바알인 모집 when they are only route progression and not the reward itself.
- Main-route-only quests that do not grant the listed permanent reward/unlock.
- Unverified quest titles/objective text from earlier all-quests experiments.

Area definitions are kept broad for Client.txt matching, but many areas have an empty checklist. That is expected.

## Audit script behavior

`npm run quest:coverage` is report-only by default. It prints unmatched tokens and areas without essential objectives, but does not fail just because an area has no displayed quest.

Use strict mode only when intentionally auditing area coverage:

```bash
npm run quest:coverage -- --strict "C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt"
```
