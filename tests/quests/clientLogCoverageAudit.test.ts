import { describe, expect, it } from 'vitest';
import { areaChecklists, areaDefinitions } from '../../src/shared/quests/data';
import { auditClientLogAreaCoverage } from '../../src/shared/quests/clientLogCoverageAudit';

describe('Client.txt area coverage audit', () => {
  it('reports area tokens that cannot be mapped to known campaign data', () => {
    const report = auditClientLogAreaCoverage(
      [
        '2026/06/21 22:52:38 48435281 2caa233f [DEBUG Client 15264] Generating level 53 area "G4_11_2" with seed 118155797',
        '2026/06/21 22:52:40 48437000 7fbd1225 [INFO Client 15264] [SCENE] Set Source [부족의 심장부]',
        '2026/06/21 22:52:42 48439234 4cba6a95 [INFO Client 15264] [LOADING SCREEN] (부족의 심장부) Duration = 4.01257 seconds',
        '2026/06/21 23:01:00 48439234 4cba6a95 [INFO Client 15264] [SCENE] Set Source [미등록 지역]',
        '2026/06/21 23:01:01 48439234 4cba6a95 [DEBUG Client 15264] Generating level 53 area "G9_UNKNOWN" with seed 1',
        '2026/06/21 23:01:02 48439234 4cba6a95 [INFO Client 15264] [SCENE] Set Source [4장]',
        '2026/06/21 23:01:03 48439234 4cba6a95 [INFO Client 15264] [SCENE] Set Source [해안선 은신처]'
      ],
      areaDefinitions,
      areaChecklists
    );

    expect(report.totalAreaTokens).toBe(4);
    expect(report.unmatchedTokens.map((entry) => entry.token)).toEqual(['미등록 지역', 'G9_UNKNOWN']);
    expect(report.matchedAreasWithoutChecklist).toEqual([]);
    expect(report.matchedAreaIds).toContain('act4-tribal-heart');
  });

  it('keeps known Act 4 Client.txt Korean scene names and area codes mapped', () => {
    const report = auditClientLogAreaCoverage(
      [
        '2026/06/21 [DEBUG Client] Generating level 50 area "G4_5_1"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [버려진 감옥]',
        '2026/06/21 [DEBUG Client] Generating level 51 area "G4_5_2"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [독방 감금실]',
        '2026/06/21 [DEBUG Client] Generating level 46 area "G4_2_1"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [닻의 만]',
        '2026/06/21 [DEBUG Client] Generating level 47 area "G4_1_1"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [혈족의 섬]',
        '2026/06/21 [DEBUG Client] Generating level 48 area "G4_1_2"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [화산 땅굴]',
        '2026/06/21 [DEBUG Client] Generating level 50 area "G4_4_2"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [죽음의 전당]',
        '2026/06/21 [DEBUG Client] Generating level 53 area "G4_13"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [약탈의 거점]',
        '2026/06/21 [DEBUG Client] Generating level 49 area "G4_4_1"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [히네코라의 눈]',
        '2026/06/21 [DEBUG Client] Generating level 54 area "Abyss_Depths3"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [심연 지하]',
        '2026/06/21 [DEBUG Client] Generating level 52 area "G4_8b"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [아라스타스]',
        '2026/06/19 [DEBUG Client] Generating level 31 area "G2_12"',
        '2026/06/19 [INFO Client] [SCENE] Set Source [드레드노트]',
        '2026/06/19 [INFO Client] [SCENE] Set Source [혼돈의 사원]',
        '2026/06/21 [DEBUG Client] Generating level 51 area "G4_4_3"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [선조들의 심판]',
        '2026/06/19 [DEBUG Client] Generating level 40 area "IncursionHub"',
        '2026/06/19 [INFO Client] [SCENE] Set Source [바알 유적]',
        '2026/06/21 [DEBUG Client] Generating level 49 area "G4_3_2"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [노래하는 암굴]',
        '2026/06/21 [DEBUG Client] Generating level 52 area "G4_10"',
        '2026/06/21 [INFO Client] [SCENE] Set Source [발굴터]',
        '2026/06/19 [DEBUG Client] Generating level 35 area "ExpeditionSubArea_Kalguur_Act3"',
        '2026/06/19 [INFO Client] [SCENE] Set Source [신비한 피난처]'
      ],
      areaDefinitions,
      areaChecklists
    );

    expect(report.unmatchedTokens).toEqual([]);
    expect(report.matchedAreasWithoutChecklist).toEqual([]);
  });
});
