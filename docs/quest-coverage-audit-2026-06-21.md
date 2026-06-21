# Quest / Client.txt Coverage Audit — 2026-06-21

## Scope

Audited the user's real Korean Kakao POE2 log:

```text
C:\Kakaogames\Path of Exile2\logs\KakaoClient.txt
```

Coverage target:

- Act 1
- Act 2
- Act 3
- Act 4
- Interlude act groups under `act: 0`
- Korean Client.txt scene names
- Internal `Generating level ... area "..."` codes

## Result

Command:

```bash
npm run quest:coverage -- "C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt"
```

Verified result after this pass:

```text
Area definitions: 83
Detected area tokens: 1142
Matched area ids: 43
Unmatched tokens: 0
Matched areas without checklist: 0
```

This means every area token that appears in the current real Client.txt sample is now either:

1. mapped to a known `AreaDefinition`, and
2. backed by an `AreaChecklist` entry.

## Important policy

Do not invent Korean quest names or quest objectives from region progression alone.

For locations whose region/code is known but quest text is not confirmed, the area is mapped with an empty checklist. This prevents low-confidence/blank region detection while avoiding false quest names.

Current evidence-only empty checklist areas:

| Area ID | Korean scene | Code | Reason |
| --- | --- | --- | --- |
| `act3-mysterious-refuge` | `신비한 피난처` | `ExpeditionSubArea_Kalguur_Act3` | Region observed in Client.txt; no confirmed Korean quest objective in log. |
| `act4-singing-caverns` | `노래하는 암굴` | `G4_3_2` | Region observed in Client.txt; no confirmed Korean quest objective in log. |
| `act4-excavation-site` | `발굴터` | `G4_10` | Region observed in Client.txt; no confirmed Korean quest objective in log. |

## Safe mappings added/confirmed from Client.txt evidence

### Act 2

| Korean scene | Code | Area |
| --- | --- | --- |
| `드레드노트` | `G2_12` | `act2-dreadnought` |

### Act 3

| Korean scene | Code | Area |
| --- | --- | --- |
| `신비한 피난처` | `ExpeditionSubArea_Kalguur_Act3` | `act3-mysterious-refuge` |
| `혼돈의 사원` | `G3_10_Airlock` | `act3-trial-of-chaos` |

### Act 4

| Korean scene | Code | Area |
| --- | --- | --- |
| `노래하는 암굴` | `G4_3_2` | `act4-singing-caverns` |
| `발굴터` | `G4_10` | `act4-excavation-site` |
| `선조들의 심판` | `G4_4_3` | `act4-trial-of-the-ancestors` |
| `바알 유적` | `IncursionHub` | `act4-vaal-ruins` |

## Data quality findings

The current checklist covers campaign progression and reward reminders, but some labels still contain English names or temporary wording in objective details. These are not matching failures, but they should be refined only when Korean client text or reliable log evidence is available.

Examples requiring future Korean-client verification:

- `Flame Ruby`
- `Mastodon Tusks`
- `Water Goddess`
- `Lightless Passage`
- `Rathbreaker`
- `Balbala/Djinn Barya`
- `Jamanra`
- `Omniphobia`
- `Great White One`
- `objective 확인` wording in some Act 4 optional entries

## Regression coverage

Added/updated test coverage in:

```text
tests/quests/clientLogCoverageAudit.test.ts
```

The test now fails if known Korean Client.txt scene names or area codes regress back to unmatched coverage.

## Verification commands used

```bash
npm run typecheck
npm test -- tests/quests/clientLogCoverageAudit.test.ts tests/quests/campaignDataCoverage.test.ts tests/quests/act23DataSmoke.test.ts
npm run quest:coverage -- "C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt"
```
