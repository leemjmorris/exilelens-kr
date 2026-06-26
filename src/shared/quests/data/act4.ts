import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist, ChecklistObjective } from '../checklist';

// POE2 Act 4 quest/area seed data from poe2wiki quest category pages collected on 2026-06-19.
// Korean area/quest wording is marked needsVerification until confirmed from the Korean client.
export const act4Areas: AreaDefinition[] = [
  { id: 'act4-kingsmarch', act: 4, nameKo: '킹스마치', nameEn: 'Kingsmarch', logNamesKo: ['킹스마치', 'Kingsmarch'], areaIdAliases: ['g4_town'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-search-start', 'act4-dark-mists-turn-in', 'act4-utopia-start', 'act4-hostile-takeover'] },
  { id: 'act4-abandoned-prison', act: 4, nameKo: '버려진 감옥', nameEn: 'Abandoned Prison', logNamesKo: ['버려진 감옥', 'Abandoned Prison'], areaIdAliases: ['g4_5_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-abandoned-prison-prisoner', 'act4-abandoned-prison-forgotten-cell', 'act4-abandoned-prison-armoury', 'act4-abandoned-prison-goddess-justice'] },
  { id: 'act4-solitary-confinement', act: 4, nameKo: '독방 감금실', nameEn: 'Solitary Confinement', logNamesKo: ['독방 감금실', '독방', 'Solitary Confinement'], areaIdAliases: ['g4_5_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-abandoned-prison-prisoner'] },
  { id: 'act4-kedge-bay', act: 4, nameKo: '케지 만', nameEn: 'Kedge Bay', logNamesKo: ['케지 만', '닻의 만', 'Kedge Bay'], areaIdAliases: ['g4_2_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-dark-mists-kedge-bay'] },
  { id: 'act4-journeys-end', act: 4, nameKo: '여정의 끝', nameEn: "Journey's End", logNamesKo: ['여정의 끝', "Journey's End"], areaIdAliases: ['g4_2_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-dark-mists-captain-hartlin', 'act4-omniphobia-passive'] },
  { id: 'act4-isle-of-kin', act: 4, nameKo: '친족의 섬', nameEn: 'Isle of Kin', logNamesKo: ['친족의 섬', '혈족의 섬', 'Isle of Kin'], areaIdAliases: ['g4_1_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-land-of-the-kin-isle', 'act4-blind-beast'] },
  { id: 'act4-volcanic-warrens', act: 4, nameKo: '화산 굴', nameEn: 'Volcanic Warrens', logNamesKo: ['화산 굴', '화산 땅굴', 'Volcanic Warrens'], areaIdAliases: ['g4_1_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-land-of-the-kin-krutog', 'act4-trial-ancestors-eye'] },
  { id: 'act4-shrike-island', act: 4, nameKo: '쉬라이크 섬', nameEn: 'Shrike Island', logNamesKo: ['쉬라이크 섬', '때까치 섬', 'Shrike Island'], areaIdAliases: ['g4_7'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-shrike-island-boss'] },
  { id: 'act4-whakapanu-island', act: 4, nameKo: '와카파누 섬', nameEn: 'Whakapanu Island', logNamesKo: ['와카파누 섬', 'Whakapanu Island'], areaIdAliases: ['g4_3_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-whakapanu-diamora', 'act4-great-white-one', 'act4-siren-pearl'] },
  { id: 'act4-singing-caverns', act: 4, nameKo: '노래하는 암굴', nameEn: 'Singing Caverns', logNamesKo: ['노래하는 암굴', 'Singing Caverns'], areaIdAliases: ['g4_3_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: [] },
  { id: 'act4-ngakanu', act: 4, nameKo: '응가카누', nameEn: 'Ngakanu', logNamesKo: ['응가카누', '심연 지하', 'Ngakanu'], areaIdAliases: ['g4_11_1a', 'g4_11_1b', 'abyss_depths3'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-abyss'] },
  { id: 'act4-tribal-heart', act: 4, nameKo: '부족의 심장부', nameEn: 'Tribal Heart', logNamesKo: ['부족의 심장부', 'Tribal Heart'], areaIdAliases: ['g4_11_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-tukohama-chief-tavakai'] },
  { id: 'act4-plunders-point', act: 4, nameKo: '약탈자의 거점', nameEn: "Plunder's Point", logNamesKo: ['약탈자의 거점', '약탈의 거점', "Plunder's Point"], areaIdAliases: ['g4_13'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-forgotten-bounty', 'act4-lonely-outpost'] },
  { id: 'act4-halls-of-the-dead', act: 4, nameKo: '망자의 전당', nameEn: 'Halls of the Dead', logNamesKo: ['망자의 전당', '죽음의 전당', 'Halls of the Dead'], areaIdAliases: ['g4_4_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-ngamahu-test', 'act4-tasalio-test', 'act4-tawhoa-test', 'act4-navali-rest'] },
  { id: 'act4-trial-of-the-ancestors', act: 4, nameKo: '조상들의 시련', nameEn: 'Trial of the Ancestors', logNamesKo: ['조상들의 시련', '선조들의 심판', '히네코라의 눈', 'Trial of the Ancestors'], areaIdAliases: ['g4_4_1', 'g4_4_3'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-trial-ancestors-complete'] },
  { id: 'act4-vaal-ruins', act: 4, nameKo: '바알 유적', nameEn: 'Vaal Ruins', logNamesKo: ['바알 유적', 'Vaal Ruins'], areaIdAliases: ['incursionhub'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-fate-of-the-vaal-start'] },
  { id: 'act4-atziris-temple', act: 4, nameKo: '앗지리의 사원', nameEn: "Atziri's Temple", logNamesKo: ['앗지리의 사원', "Atziri's Temple"], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-fate-of-the-vaal-atziri'] },
  { id: 'act4-arastas', act: 4, nameKo: '아라스타스', nameEn: 'Arastas', logNamesKo: ['아라스타스', 'Arastas'], areaIdAliases: ['g4_8b'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-utopia-arastas'] },
  { id: 'act4-excavation-site', act: 4, nameKo: '발굴터', nameEn: 'Excavation Site', logNamesKo: ['발굴터', 'Excavation Site'], areaIdAliases: ['g4_10'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: [] },
  { id: 'act4-shoreline-hideout', act: 4, nameKo: '해안 은신처', nameEn: 'Shoreline Hideout', logNamesKo: ['해안 은신처', 'Shoreline Hideout'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-hostile-takeover-hideout'] },
  { id: 'act4-ziggurat-refuge', act: 4, nameKo: '지구라트 피난처', nameEn: 'Ziggurat Refuge', logNamesKo: ['지구라트 피난처', 'Ziggurat Refuge'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-siege-of-oriath-refuge'] }
];

export const act4Checklists: AreaChecklist[] = act4Areas.map((area) => objectives(area.id, []));

function objective(areaId: string, id: string, labelKo: string, kind: 'required' | 'optional', notesKo: string): AreaChecklist {
  return objectives(areaId, [[id, labelKo, kind, notesKo]]);
}

function objectives(areaId: string, entries: Array<[string, string, 'required' | 'optional', string]>): AreaChecklist {
  return {
    areaId,
    needsVerification: true,
    objectives: entries.map(([id, labelKo, kind, notesKo]) => ({
      id,
      labelKo,
      kind,
      notesKo,
      needsVerification: true,
      autoComplete: getAutoCompleteRules(areaId, id)
    }))
  };
}


function getAutoCompleteRules(areaId: string, objectiveId: string) {
  if (areaId === 'act4-abandoned-prison' && objectiveId === 'act4-abandoned-prison-goddess-justice') {
    return [
      {
        type: 'reward-acquired' as const,
        areaId,
        includes: ['[Flask|플라스크]로 회복하는 생명력 30% 증가'],
        confidence: 'high' as const
      }
    ];
  }
  if (areaId === 'act4-ngakanu' && objectiveId === 'act4-abyss') {
    return [
      {
        type: 'reward-acquired' as const,
        includes: ['[Armour|방어도]', '[Evasion|회피]', '[EnergyShield|에너지 보호막] 30% 증가'],
        confidence: 'high' as const
      }
    ];
  }
  if (areaId === 'act4-trial-of-the-ancestors' && objectiveId === 'act4-trial-ancestors-complete') {
    return [
      {
        type: 'reward-acquired' as const,
        includes: ['패시브 스킬 포인트 2포인트를 획득했습니다'],
        confidence: 'high' as const
      }
    ];
  }
  if (areaId === 'act4-halls-of-the-dead' && ['act4-ngamahu-test', 'act4-tasalio-test', 'act4-tawhoa-test'].includes(objectiveId)) {
    const rewardByObjective: Record<string, string[]> = {
      'act4-ngamahu-test': ['[Dexterity|민첩] +5'],
      'act4-tasalio-test': ['[Resistances|냉기] 저항 +5%'],
      'act4-tawhoa-test': ['[Resistances|화염] 저항 +5%']
    };
    return [
      {
        type: 'reward-acquired' as const,
        includes: rewardByObjective[objectiveId],
        confidence: 'high' as const
      }
    ];
  }
  if (areaId === 'act4-halls-of-the-dead' && objectiveId === 'act4-navali-rest') {
    return [
      {
        type: 'reward-acquired' as const,
        includes: ['최대 마나 5% 증가'],
        confidence: 'high' as const
      }
    ];
  }
  return undefined;
}
