import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist } from '../checklist';

// POE2 Act 3 area seed data. Korean names are sourced from poe2db.tw/kr page titles on 2026-06-19.
// Quest linkage is based on poe2wiki quest pages/category data collected on 2026-06-19; KR quest wording remains needsVerification.
export const act3Areas: AreaDefinition[] = [
  { id: 'act3-sandswept-marsh', act: 3, nameKo: '모래에 휩쓸린 습지', nameEn: 'Sandswept Marsh', logNamesKo: ['모래에 휩쓸린 습지', '모래 쓸린 늪', 'Sandswept Marsh'], areaIdAliases: ['g3_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-sandswept-marsh-entry'] },
  { id: 'act3-ziggurat-encampment', act: 3, nameKo: '지구라트 야영지', nameEn: 'Ziggurat Encampment', logNamesKo: ['지구라트 야영지', 'Ziggurat Encampment'], areaIdAliases: ['g3_town'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-ziggurat-legacy-hub', 'act3-slithering-dead-turn-in', 'act3-treasures-utzaal-turn-in'] },
  { id: 'act3-infested-barrens', act: 3, nameKo: '들끓는 불모지', nameEn: 'Infested Barrens', logNamesKo: ['들끓는 불모지', 'Infested Barrens'], areaIdAliases: ['g3_2_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-infested-barrens'] },
  { id: 'act3-matlan-waterways', act: 3, nameKo: '마틀란 수로', nameEn: 'The Matlan Waterways', logNamesKo: ['마틀란 수로', 'The Matlan Waterways'], areaIdAliases: ['g3_2_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-matlan-waterways'] },
  { id: 'act3-jungle-ruins', act: 3, nameKo: '밀림 유적', nameEn: 'Jungle Ruins', logNamesKo: ['밀림 유적', '정글 폐허', 'Jungle Ruins'], areaIdAliases: ['g3_3'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-jungle-ruins'] },
  { id: 'act3-venom-crypts', act: 3, nameKo: '독액 지하실', nameEn: 'The Venom Crypts', logNamesKo: ['독액 지하실', 'The Venom Crypts'], areaIdAliases: ['g3_4'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-slithering-dead-venom-draught'] },
  { id: 'act3-chimeral-wetlands', act: 3, nameKo: '키메랄 습지대', nameEn: 'Chimeral Wetlands', logNamesKo: ['키메랄 습지대', '키마에라 습지', 'Chimeral Wetlands'], areaIdAliases: ['g3_5'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-chimera', 'act3-trials-chaos-ultimatum'] },
  { id: 'act3-jiquanis-machinarium', act: 3, nameKo: '지콰니의 기계실', nameEn: "Jiquani's Machinarium", logNamesKo: ['지콰니의 기계실', "Jiquani's Machinarium"], areaIdAliases: ['g3_6_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-machinarium'] },
  { id: 'act3-jiquanis-sanctum', act: 3, nameKo: '지콰니의 지성소', nameEn: "Jiquani's Sanctum", logNamesKo: ['지콰니의 지성소', "Jiquani's Sanctum"], areaIdAliases: ['g3_6_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-sanctum'] },
  { id: 'act3-azak-bog', act: 3, nameKo: '아자크 습지대', nameEn: 'The Azak Bog', logNamesKo: ['아자크 습지대', 'The Azak Bog'], areaIdAliases: ['g3_7'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-tribal-vengeance-ignagduk'] },
  { id: 'act3-drowned-city', act: 3, nameKo: '물에 잠긴 도시', nameEn: 'The Drowned City', logNamesKo: ['물에 잠긴 도시', 'The Drowned City'], areaIdAliases: ['g3_8'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-drowned-city'] },
  { id: 'act3-molten-vault', act: 3, nameKo: '녹아내린 금고', nameEn: 'The Molten Vault', logNamesKo: ['녹아내린 금고', 'The Molten Vault'], areaIdAliases: ['g3_9'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-treasures-utzaal-mektul'] },
  { id: 'act3-trial-of-chaos', act: 3, nameKo: '혼돈의 시련', nameEn: 'The Trial of Chaos', logNamesKo: ['혼돈의 시련', 'Temple of Chaos', 'The Trial of Chaos'], areaIdAliases: ['g3_10_airlock'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-trials-chaos-complete'] },
  { id: 'act3-apex-of-filth', act: 3, nameKo: '오물의 정점', nameEn: 'Apex of Filth', logNamesKo: ['오물의 정점', 'Apex of Filth'], areaIdAliases: ['g3_11'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-apex-of-filth'] },
  { id: 'act3-temple-of-kopec', act: 3, nameKo: '코펙의 사원', nameEn: 'Temple of Kopec', logNamesKo: ['코펙의 사원', 'Temple of Kopec'], areaIdAliases: ['g3_12'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-kopec'] },
  { id: 'act3-utzaal', act: 3, nameKo: '웃자알', nameEn: 'Utzaal', logNamesKo: ['웃자알', 'Utzaal'], areaIdAliases: ['g3_14'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-utzaal', 'act3-treasures-utzaal'] },
  { id: 'act3-aggorat', act: 3, nameKo: '아고라트', nameEn: 'Aggorat', logNamesKo: ['아고라트', 'Aggorat'], areaIdAliases: ['g3_16'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-aggorat'] },
  { id: 'act3-black-chambers', act: 3, nameKo: '검은 내실', nameEn: 'The Black Chambers', logNamesKo: ['검은 내실', 'The Black Chambers'], areaIdAliases: ['g3_17'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-black-chambers'] }
];

export const act3Checklists: AreaChecklist[] = [
  objective('act3-sandswept-marsh', 'act3-sandswept-marsh-entry', '바알의 유산: Sandswept Marsh 진입 후 지구라트 야영지 도달', 'required', 'Act 3 메인 진입'),
  objectives('act3-ziggurat-encampment', [
    ['act3-ziggurat-legacy-hub', '바알의 유산: Alva/Servi/Oswald 등 Act 3 허브 대화 확인', 'required', 'Act 3 메인 허브'],
    ['act3-slithering-dead-turn-in', '기어가는 망자: Venom Draught 사용/보고 확인', 'optional', 'Venom Crypts 선택 보상'],
    ['act3-treasures-utzaal-turn-in', '웃자알의 보물: Oswald에게 Molten Vault 보상 보고', 'optional', 'Molten Vault 선택 퀘스트']
  ]),
  objective('act3-infested-barrens', 'act3-legacy-infested-barrens', '바알의 유산: Infested Barrens 진행 및 다음 지역 개방', 'required', 'Act 3 메인 루트'),
  objective('act3-matlan-waterways', 'act3-legacy-matlan-waterways', '바알의 유산: Matlan Waterways 수문/진행 장치 확인', 'required', 'Act 3 메인 루트'),
  objective('act3-jungle-ruins', 'act3-legacy-jungle-ruins', '바알의 유산: Jungle Ruins에서 Alva 관련 진행', 'required', 'Act 3 메인 루트'),
  objective('act3-venom-crypts', 'act3-slithering-dead-venom-draught', '기어가는 망자: Venom Crypts 탐험 후 Venom Draught 획득/소모', 'optional', 'Servi 선택 퀘스트'),
  objectives('act3-chimeral-wetlands', [
    ['act3-legacy-chimera', '바알의 유산: Xyclucian, the Chimera 처치', 'required', 'Act 3 메인 루트'],
    ['act3-trials-chaos-ultimatum', '혼돈의 시련: Inscribed Ultimatum 획득 가능 여부 확인', 'optional', 'Trial of Chaos 시작']
  ]),
  objective('act3-jiquanis-machinarium', 'act3-legacy-machinarium', "바알의 유산: Jiquani's Machinarium 장치/동력 진행", 'required', 'Act 3 메인 루트'),
  objective('act3-jiquanis-sanctum', 'act3-legacy-sanctum', "바알의 유산: Jiquani's Sanctum 목표 완료", 'required', 'Act 3 메인 루트'),
  objective('act3-azak-bog', 'act3-tribal-vengeance-ignagduk', '부족의 복수: Ignagduk 처치 및 Servi 보상 확인', 'optional', 'Azak Bog 선택 퀘스트'),
  objective('act3-drowned-city', 'act3-legacy-drowned-city', '바알의 유산: Drowned City 통과 및 후반부 진입', 'required', 'Act 3 메인 루트'),
  objective('act3-molten-vault', 'act3-treasures-utzaal-mektul', '웃자알의 보물: Mektul 처치 후 Molten Vault 보상 획득', 'optional', 'Oswald 선택 퀘스트'),
  objective('act3-trial-of-chaos', 'act3-trials-chaos-complete', "혼돈의 시련: Trialmaster's Challenges 완료", 'optional', 'Ascendancy/Trial 선택 진행'),
  objective('act3-apex-of-filth', 'act3-legacy-apex-of-filth', '바알의 유산: Apex of Filth 목표 완료', 'required', 'Act 3 메인 루트'),
  objective('act3-temple-of-kopec', 'act3-legacy-kopec', '바알의 유산: Temple of Kopec 목표 완료', 'required', 'Act 3 메인 루트'),
  objectives('act3-utzaal', [
    ['act3-legacy-utzaal', '바알의 유산: Utzaal 진입 및 후반 메인 진행', 'required', 'Act 3 후반 루트'],
    ['act3-treasures-utzaal', '웃자알의 보물: Utzaal 보물/Oswald 관련 진행 확인', 'optional', '선택 보상 확인']
  ]),
  objective('act3-aggorat', 'act3-legacy-aggorat', '바알의 유산: Aggorat 진행', 'required', 'Act 3 후반 루트'),
  objective('act3-black-chambers', 'act3-legacy-black-chambers', '바알의 유산: Black Chambers 완료 후 Act 4/후속 진행', 'required', 'Act 3 최종 메인 목표')
];

function objective(areaId: string, id: string, labelKo: string, kind: 'required' | 'optional', notesKo: string): AreaChecklist {
  return objectives(areaId, [[id, labelKo, kind, notesKo]]);
}

function objectives(areaId: string, entries: Array<[string, string, 'required' | 'optional', string]>): AreaChecklist {
  return {
    areaId,
    needsVerification: true,
    objectives: entries.map(([id, labelKo, kind, notesKo]) => ({ id, labelKo, kind, notesKo, needsVerification: true }))
  };
}
