import { describe, expect, it } from 'vitest';
import { areaDefinitions, areaChecklists } from '../../src/shared/quests/data';
import { applyQuestEvidenceToProgress, parseQuestEvidenceFromClientLogLines } from '../../src/shared/quests/questEvidence';
import { isObjectiveCompleted, type QuestProgress } from '../../src/shared/quests/checklist';

describe('quest evidence parsing and auto-completion', () => {
  it('parses reward-acquired evidence with the current Client.txt area context', () => {
    const events = parseQuestEvidenceFromClientLogLines(
      [
        '2026/06/19 01:34:10 10626093 7fbd1225 [INFO Client 3124] [SCENE] Set Source [데샤르의 첨탑]',
        '2026/06/19 01:34:13 10629562 3ef23347 [INFO Client 3124] : 부캐발사대 님이 [Resistances|번개] 저항 +10%을(를) 획득했습니다.'
      ],
      areaDefinitions
    );

    expect(events).toContainEqual({
      type: 'area-entered',
      areaId: 'act2-spires-of-deshar',
      areaNameKo: '데샤르의 첨탑',
      confidence: 'high'
    });
    expect(events).toContainEqual({
      type: 'reward-acquired',
      areaId: 'act2-spires-of-deshar',
      areaNameKo: '데샤르의 첨탑',
      rewardText: '부캐발사대 님이 [Resistances|번개] 저항 +10%을(를) 획득했습니다.',
      confidence: 'high'
    });
  });

  it('auto-completes high-confidence essential reward objectives only', () => {
    const progress: QuestProgress = { completedObjectiveIds: {}, manualObjectiveStates: {}, autoObjectiveStates: {} };
    const events = parseQuestEvidenceFromClientLogLines(
      [
        '2026/06/19 01:34:10 10626093 7fbd1225 [INFO Client 3124] [SCENE] Set Source [데샤르의 첨탑]',
        '2026/06/19 01:34:13 10629562 3ef23347 [INFO Client 3124] : 부캐발사대 님이 [Resistances|번개] 저항 +10%을(를) 획득했습니다.',
        '2026/06/19 12:59:00 13079343 7fbd1225 [INFO Client 5404] [SCENE] Set Source [지콰니의 기계실]',
        '2026/06/19 12:59:40 13102875 3ef23347 [INFO Client 5404] : 부캐발사대 님이 [Resistances|화염] 저항 +10%을(를) 획득했습니다.',
        '2026/06/21 16:14:10 24527000 7fbd1225 [INFO Client 15264] [SCENE] Set Source [버려진 감옥]',
        '2026/06/21 16:14:18 24535015 3ef23347 [INFO Client 15264] : 부캐발사대 님이 [Flask|플라스크]로 회복하는 생명력 30% 증가을(를) 획득했습니다.'
      ],
      areaDefinitions
    );

    const next = applyQuestEvidenceToProgress(progress, areaChecklists, events);

    expect(isObjectiveCompleted(next, 'act2-spires-of-deshar', 'act2-spires-garukhan-lightning-resistance')).toBe(true);
    expect(isObjectiveCompleted(next, 'act3-jiquanis-machinarium', 'act3-machinarium-blackjaw-fire-resistance')).toBe(true);
    expect(isObjectiveCompleted(next, 'act4-abandoned-prison', 'act4-abandoned-prison-goddess-justice')).toBe(true);
  });

  it('keeps explicit manual incomplete choices above automatic reward evidence', () => {
    const progress: QuestProgress = {
      completedObjectiveIds: {},
      manualObjectiveStates: {
        'act2-spires-of-deshar': {
          'act2-spires-garukhan-lightning-resistance': false
        }
      },
      autoObjectiveStates: {}
    };
    const events = parseQuestEvidenceFromClientLogLines(
      [
        '2026/06/19 01:34:10 10626093 7fbd1225 [INFO Client 3124] [SCENE] Set Source [데샤르의 첨탑]',
        '2026/06/19 01:34:13 10629562 3ef23347 [INFO Client 3124] : 부캐발사대 님이 [Resistances|번개] 저항 +10%을(를) 획득했습니다.'
      ],
      areaDefinitions
    );

    const next = applyQuestEvidenceToProgress(progress, areaChecklists, events);

    expect(isObjectiveCompleted(next, 'act2-spires-of-deshar', 'act2-spires-garukhan-lightning-resistance')).toBe(false);
    expect(next.autoObjectiveStates?.['act2-spires-of-deshar']?.['act2-spires-garukhan-lightning-resistance']).toBe(true);
  });
});
