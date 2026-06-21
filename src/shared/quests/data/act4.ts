import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist } from '../checklist';

// POE2 Act 4 quest/area seed data from poe2wiki quest category pages collected on 2026-06-19.
// Korean area/quest wording is marked needsVerification until confirmed from the Korean client.
export const act4Areas: AreaDefinition[] = [
  { id: 'act4-kingsmarch', act: 4, nameKo: '킹스마치', nameEn: 'Kingsmarch', logNamesKo: ['킹스마치', 'Kingsmarch'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-search-start', 'act4-dark-mists-turn-in', 'act4-utopia-start', 'act4-hostile-takeover'] },
  { id: 'act4-abandoned-prison', act: 4, nameKo: '버려진 감옥', nameEn: 'Abandoned Prison', logNamesKo: ['버려진 감옥', 'Abandoned Prison'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-abandoned-prison-prisoner', 'act4-abandoned-prison-forgotten-cell', 'act4-abandoned-prison-armoury', 'act4-abandoned-prison-goddess-justice'] },
  { id: 'act4-solitary-confinement', act: 4, nameKo: '독방 감금실', nameEn: 'Solitary Confinement', logNamesKo: ['독방 감금실', '독방', 'Solitary Confinement'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-abandoned-prison-prisoner'] },
  { id: 'act4-kedge-bay', act: 4, nameKo: '케지 만', nameEn: 'Kedge Bay', logNamesKo: ['케지 만', 'Kedge Bay'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-dark-mists-kedge-bay'] },
  { id: 'act4-journeys-end', act: 4, nameKo: '여정의 끝', nameEn: "Journey's End", logNamesKo: ['여정의 끝', "Journey's End"], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-dark-mists-captain-hartlin', 'act4-omniphobia-passive'] },
  { id: 'act4-isle-of-kin', act: 4, nameKo: '친족의 섬', nameEn: 'Isle of Kin', logNamesKo: ['친족의 섬', 'Isle of Kin'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-land-of-the-kin-isle', 'act4-blind-beast'] },
  { id: 'act4-volcanic-warrens', act: 4, nameKo: '화산 굴', nameEn: 'Volcanic Warrens', logNamesKo: ['화산 굴', 'Volcanic Warrens'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-land-of-the-kin-krutog', 'act4-trial-ancestors-eye'] },
  { id: 'act4-shrike-island', act: 4, nameKo: '쉬라이크 섬', nameEn: 'Shrike Island', logNamesKo: ['쉬라이크 섬', '때까치 섬', 'Shrike Island'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-shrike-island-boss'] },
  { id: 'act4-whakapanu-island', act: 4, nameKo: '와카파누 섬', nameEn: 'Whakapanu Island', logNamesKo: ['와카파누 섬', '응가카누', 'Whakapanu Island'], areaIdAliases: ['g4_11_1a'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-whakapanu-diamora', 'act4-great-white-one', 'act4-siren-pearl', 'act4-tribal-medicine'] },
  { id: 'act4-plunders-point', act: 4, nameKo: '약탈자의 거점', nameEn: "Plunder's Point", logNamesKo: ['약탈자의 거점', '약탈의 거점', "Plunder's Point"], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-forgotten-bounty', 'act4-lonely-outpost'] },
  { id: 'act4-halls-of-the-dead', act: 4, nameKo: '망자의 전당', nameEn: 'Halls of the Dead', logNamesKo: ['망자의 전당', 'Halls of the Dead'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-ngamahu-test', 'act4-tasalio-test', 'act4-tawhoa-test', 'act4-navali-rest'] },
  { id: 'act4-trial-of-the-ancestors', act: 4, nameKo: '조상들의 시련', nameEn: 'Trial of the Ancestors', logNamesKo: ['조상들의 시련', '선조들의 심판', 'Trial of the Ancestors'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-trial-ancestors-complete'] },
  { id: 'act4-vaal-ruins', act: 4, nameKo: '바알 유적', nameEn: 'Vaal Ruins', logNamesKo: ['바알 유적', 'Vaal Ruins'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-fate-of-the-vaal-start'] },
  { id: 'act4-atziris-temple', act: 4, nameKo: '앗지리의 사원', nameEn: "Atziri's Temple", logNamesKo: ['앗지리의 사원', "Atziri's Temple"], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-fate-of-the-vaal-atziri'] },
  { id: 'act4-arastas', act: 4, nameKo: '아라스타스', nameEn: 'Arastas', logNamesKo: ['아라스타스', 'Arastas'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-utopia-arastas'] },
  { id: 'act4-shoreline-hideout', act: 4, nameKo: '해안 은신처', nameEn: 'Shoreline Hideout', logNamesKo: ['해안 은신처', 'Shoreline Hideout'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-hostile-takeover-hideout'] },
  { id: 'act4-ziggurat-refuge', act: 4, nameKo: '지구라트 피난처', nameEn: 'Ziggurat Refuge', logNamesKo: ['지구라트 피난처', 'Ziggurat Refuge'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act4-siege-of-oriath-refuge'] }
];

export const act4Checklists: AreaChecklist[] = [
  objectives('act4-kingsmarch', [
    ['act4-search-start', '탐색: 도리아니와 대화 후 킹스마치에서 선박 증서와 선도자 무기 조각 추적 시작', 'required', '4장 메인 허브'],
    ['act4-follow-tavakai', '타바카이 따라가기: 타바카이 추적 동선 확인', 'required', '4장 메인 연결 퀘스트'],
    ['act4-greater-blank-runes', '상위 빈 룬: 상위 빈 룬 관련 보상/안내 확인', 'optional', '룬 보상 안내'],
    ['act4-dark-mists-turn-in', '어둑한 안개: 베리시움 가시와 환영 사건 처리 후 투젠/대닉에게 보고', 'required', 'Kedge Bay/Journey’s End 완료 후'],
    ['act4-utopia-start', '유토피아: 선교사 로란디스에게서 아라스타스 진행 시작', 'required', '4장 메인 퀘스트'],
    ['act4-hostile-takeover', '적대적 영역: 앤지에게 은신처 개방 퀘스트 수령', 'optional', '은신처 안내']
  ]),
  objectives('act4-abandoned-prison', [
    ['act4-abandoned-prison-prisoner', '포로: 독방 감금실에서 포로 쓰러뜨리기', 'optional', '버려진 감옥 선택 퀘스트 보상: 목걸이/미가공 스킬 젬. poe2db Act4KillPrisoner 기준'],
    ['act4-abandoned-prison-forgotten-cell', '잊혀진 감방: 감방 objective 확인', 'optional', '버려진 감옥 지역 Objectives 기준'],
    ['act4-abandoned-prison-armoury', '병기 창고: 병기 창고 objective 확인', 'optional', '버려진 감옥 지역 Objectives 기준'],
    ['act4-abandoned-prison-goddess-justice', '정의의 여신: 플라스크 생명력 또는 마나 회복 30% 영구 보상 선택', 'required', '0.5.0 기준 꼭 챙길 Act 4 영구 보상']
  ]),
  objective('act4-solitary-confinement', 'act4-abandoned-prison-prisoner', '포로: 강화 문을 열고 포로 처치', 'optional', '버려진 감옥 선택 퀘스트 완료 단계'),
  objective('act4-kedge-bay', 'act4-dark-mists-kedge-bay', '어둑한 안개: 케지 만 탐험 후 여정의 끝 진입', 'required', '4장 보조 메인 섬 퀘스트'),
  objectives('act4-journeys-end', [
    ['act4-dark-mists-captain-hartlin', '어둑한 안개: 하틀린 선장 처치 후 프레야 하틀린/탕마주 사건 처리', 'required', '환영 안내 포함'],
    ['act4-omniphobia-passive', '여정의 끝: Omniphobia, Fear Manifest 처치로 패시브 스킬 2포인트 보상 챙기기', 'required', '0.5.0 기준 꼭 챙길 Act 4 영구 보상']
  ]),
  objectives('act4-isle-of-kin', [
    ['act4-land-of-the-kin-isle', '혈족의 땅: 혈족의 섬 탐험 후 화산 굴 진입', 'required', '4장 보조 메인 섬 퀘스트'],
    ['act4-blind-beast', '눈먼 짐승: 눈먼 짐승 처치 후 상위 빈 룬 보상 챙기기', 'required', '0.5.0 기준 꼭 챙길 Act 4 보상']
  ]),
  objectives('act4-volcanic-warrens', [
    ['act4-land-of-the-kin-krutog', '혈족의 땅: 혈족의 군주 크루토그 처치 및 무기 조각 회수', 'required', '탐색 진행 조각'],
    ['act4-trial-ancestors-eye', '선조들의 심판: 히네코라의 눈 획득 가능 여부 확인', 'optional', '선조들의 심판 unlock']
  ]),
  objective('act4-shrike-island', 'act4-shrike-island-boss', '때까치 섬: 하늘의 재앙 처치', 'required', '4장 섬 퀘스트'),
  objectives('act4-whakapanu-island', [
    ['act4-whakapanu-diamora', '와카파누 섬: 죽음의 노래 디아모라 처치', 'required', '4장 섬 퀘스트'],
    ['act4-great-white-one', '거대한 흰 존재: Great White One 처치 후 방어/회피/에너지 보호막 계열 영구 보상 선택', 'required', '0.5.0 기준 꼭 챙길 Act 4 영구 보상'],
    ['act4-siren-pearl', '사이렌 진주: 사이렌 진주 관련 목표/보상 확인', 'optional', '4장 한국 서버 퀘스트 목록 기준'],
    ['act4-tribal-medicine', '부족의 의술: 거대한 흰 존재/부족의 심장 관련 선택 진행', 'optional', 'Ngakanu/Kaimana 선택 퀘스트']
  ]),
  objectives('act4-plunders-point', [
    ['act4-forgotten-bounty', '잊힌 하사품: 찢어진 지도 조각/탐험 보상 진행', 'optional', 'Plunder’s Point 선택 퀘스트'],
    ['act4-lonely-outpost', '외딴 초소: 약탈의 거점에서 외딴 초소 퀘스트 목표 확인', 'optional', '한국 클라이언트 약탈의 거점에서 확인된 선택 퀘스트']
  ]),
  objectives('act4-halls-of-the-dead', [
    ['act4-ngamahu-test', "나마후의 시험: 망자의 전당 시험 완료", 'required', '0.5.0 기준 저항/능력치 선택 영구 보상'],
    ['act4-tasalio-test', "타살리오의 시험: 망자의 전당 시험 완료", 'required', '0.5.0 기준 저항/능력치 선택 영구 보상'],
    ['act4-tawhoa-test', "타호아의 시험: 망자의 전당 시험 완료", 'required', '0.5.0 기준 저항/능력치 선택 영구 보상'],
    ['act4-navali-rest', "나발리의 안식: 최대 마나 5% 영구 보상 챙기기", 'required', '0.5.0 기준 꼭 챙길 Act 4 영구 보상']
  ]),
  objective('act4-trial-of-the-ancestors', 'act4-trial-ancestors-complete', '선조들의 심판: 히네코라와 대화해 시험 완료 및 패시브 스킬 2포인트 보상 챙기기', 'required', '0.5.0 기준 꼭 챙길 Act 4 영구 보상'),
  objective('act4-vaal-ruins', 'act4-fate-of-the-vaal-start', '바알의 운명: 바알 유적에서 알바/도리아니 소환 및 사원 추적', 'optional', '바알의 운명 리그 퀘스트'),
  objective('act4-atziris-temple', 'act4-fate-of-the-vaal-atziri', '바알의 운명: 왕실 설계자/앗지리 처치 및 금고 개방', 'optional', '바알의 운명 리그 퀘스트'),
  objective('act4-arastas', 'act4-utopia-arastas', '유토피아: 아라스타스 탐험 후 종복 마리우스와 대화', 'required', '4장 메인 퀘스트'),
  objective('act4-shoreline-hideout', 'act4-hostile-takeover-hideout', '적대적 영역: 해안 은신처 확보 후 앤지에게 보고', 'optional', '은신처 해금'),
  objective('act4-ziggurat-refuge', 'act4-siege-of-oriath-refuge', '오리아스 공성전: 세 막간 완료 후 오리아스로 이동, 지구라트 피난처 도달', 'required', 'Act 4 전환/후속 진행')
];

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
  if (areaId === 'act4-whakapanu-island' && objectiveId === 'act4-great-white-one') {
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
