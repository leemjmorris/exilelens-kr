import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist, ChecklistObjective } from '../checklist';

// POE2 Act 3 area seed data. Korean names are sourced from poe2db.tw/kr page titles on 2026-06-19.
// Quest linkage is based on poe2wiki quest pages/category data collected on 2026-06-19; KR quest wording remains needsVerification.
export const act3Areas: AreaDefinition[] = [
  { id: 'act3-sandswept-marsh', act: 3, nameKo: '모래에 휩쓸린 습지', nameEn: 'Sandswept Marsh', logNamesKo: ['모래에 휩쓸린 습지', '모래 쓸린 늪', 'Sandswept Marsh'], areaIdAliases: ['g3_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-sandswept-marsh-entry', 'act3-sandswept-marsh-orok-campfire'] },
  { id: 'act3-ziggurat-encampment', act: 3, nameKo: '지구라트 야영지', nameEn: 'Ziggurat Encampment', logNamesKo: ['지구라트 야영지', 'Ziggurat Encampment'], areaIdAliases: ['g3_town'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-ziggurat-legacy-hub', 'act3-slithering-dead-turn-in', 'act3-treasures-utzaal-turn-in'] },
  { id: 'act3-infested-barrens', act: 3, nameKo: '들끓는 불모지', nameEn: 'Infested Barrens', logNamesKo: ['들끓는 불모지', 'Infested Barrens'], areaIdAliases: ['g3_2_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-infested-barrens'] },
  { id: 'act3-mysterious-refuge', act: 3, nameKo: '신비한 피난처', nameEn: 'Mysterious Refuge', logNamesKo: ['신비한 피난처', 'Mysterious Refuge'], areaIdAliases: ['expeditionsubarea_kalguur_act3'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: [] },
  { id: 'act3-matlan-waterways', act: 3, nameKo: '마틀란 수로', nameEn: 'The Matlan Waterways', logNamesKo: ['마틀란 수로', 'The Matlan Waterways'], areaIdAliases: ['g3_2_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-matlan-waterways'] },
  { id: 'act3-jungle-ruins', act: 3, nameKo: '밀림 유적', nameEn: 'Jungle Ruins', logNamesKo: ['밀림 유적', '정글 폐허', 'Jungle Ruins'], areaIdAliases: ['g3_3'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-jungle-ruins', 'act3-jungle-ruins-silverfist-passive'] },
  { id: 'act3-venom-crypts', act: 3, nameKo: '독액 지하실', nameEn: 'The Venom Crypts', logNamesKo: ['독액 지하실', 'The Venom Crypts'], areaIdAliases: ['g3_4'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-slithering-dead-venom-draught'] },
  { id: 'act3-chimeral-wetlands', act: 3, nameKo: '키메랄 습지대', nameEn: 'Chimeral Wetlands', logNamesKo: ['키메랄 습지대', '키마에라 습지', 'Chimeral Wetlands'], areaIdAliases: ['g3_5'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-chimera', 'act3-trials-chaos-ultimatum'] },
  { id: 'act3-jiquanis-machinarium', act: 3, nameKo: '지콰니의 기계실', nameEn: "Jiquani's Machinarium", logNamesKo: ['지콰니의 기계실', "Jiquani's Machinarium"], areaIdAliases: ['g3_6_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-machinarium', 'act3-machinarium-blackjaw-fire'] },
  { id: 'act3-jiquanis-sanctum', act: 3, nameKo: '지콰니의 지성소', nameEn: "Jiquani's Sanctum", logNamesKo: ['지콰니의 지성소', "Jiquani's Sanctum"], areaIdAliases: ['g3_6_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-sanctum'] },
  { id: 'act3-azak-bog', act: 3, nameKo: '아자크 습지대', nameEn: 'The Azak Bog', logNamesKo: ['아자크 습지대', 'The Azak Bog'], areaIdAliases: ['g3_7'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-tribal-vengeance-ignagduk'] },
  { id: 'act3-drowned-city', act: 3, nameKo: '물에 잠긴 도시', nameEn: 'The Drowned City', logNamesKo: ['물에 잠긴 도시', 'The Drowned City'], areaIdAliases: ['g3_8'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-drowned-city'] },
  { id: 'act3-molten-vault', act: 3, nameKo: '녹아내린 금고', nameEn: 'The Molten Vault', logNamesKo: ['녹아내린 금고', 'The Molten Vault'], areaIdAliases: ['g3_9'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-treasures-utzaal-mektul'] },
  { id: 'act3-trial-of-chaos', act: 3, nameKo: '혼돈의 시련', nameEn: 'The Trial of Chaos', logNamesKo: ['혼돈의 시련', '혼돈의 사원', 'Temple of Chaos', 'The Trial of Chaos'], areaIdAliases: ['g3_10_airlock'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-trials-chaos-complete'] },
  { id: 'act3-apex-of-filth', act: 3, nameKo: '오물의 정점', nameEn: 'Apex of Filth', logNamesKo: ['오물의 정점', 'Apex of Filth'], areaIdAliases: ['g3_11'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-apex-of-filth'] },
  { id: 'act3-temple-of-kopec', act: 3, nameKo: '코펙의 사원', nameEn: 'Temple of Kopec', logNamesKo: ['코펙의 사원', 'Temple of Kopec'], areaIdAliases: ['g3_12'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-kopec'] },
  { id: 'act3-utzaal', act: 3, nameKo: '웃자알', nameEn: 'Utzaal', logNamesKo: ['웃자알', 'Utzaal'], areaIdAliases: ['g3_14'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-utzaal', 'act3-treasures-utzaal'] },
  { id: 'act3-aggorat', act: 3, nameKo: '아고라트', nameEn: 'Aggorat', logNamesKo: ['아고라트', 'Aggorat'], areaIdAliases: ['g3_16'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-aggorat', 'act3-aggorat-sacrificial-heart'] },
  { id: 'act3-black-chambers', act: 3, nameKo: '검은 내실', nameEn: 'The Black Chambers', logNamesKo: ['검은 내실', 'The Black Chambers'], areaIdAliases: ['g3_17'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act3-legacy-black-chambers'] }
];

const act3EssentialObjectives: Record<string, ChecklistObjective[]> = {
  'act3-sandswept-marsh': [required('act3-sandswept-marsh-campfire-jewelers-orb', '모래에 휩쓸린 습지: 아자크 모닥불 상자를 열어 하위 쥬얼러 오브 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')],
  'act3-jungle-ruins': [required('act3-jungle-ruins-silverfist-passive', '밀림 유적: 강력한 은빛주먹 처치로 패시브 스킬 2포인트 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')],
  'act3-venom-crypts': [required('act3-venom-crypts-venom-draught-choice', '독액 지하실: 독액 영약을 전달하고 영약 선택 보상 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')],
  'act3-azak-bog': [required('act3-azak-bog-ignagduk-spirit', '아자크 습지대: 습지대 마녀 이그나두크 처치로 정신력 +30 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')],
  'act3-jiquanis-machinarium': [required('act3-machinarium-blackjaw-fire-resistance', '지콰니의 기계실: 잔류하는 기계턱 처치로 화염 저항 +10% 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')],
  'act3-molten-vault': [required('act3-molten-vault-mektul-reforge-bench', '녹아내린 금고: 제련 장인 메크툴 처치로 제련 작업대 해금하기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')],
  'act3-aggorat': [required('act3-aggorat-sacrificial-heart-passive', '아고라트: 희생의 심장을 제단에 바쳐 패시브 스킬 2포인트 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 3 일반')]
};

export const act3Checklists: AreaChecklist[] = act3Areas.map((area) => ({ areaId: area.id, needsVerification: true, objectives: act3EssentialObjectives[area.id] ?? [] }));

function required(id: string, labelKo: string, notesKo: string): ChecklistObjective {
  const objective: ChecklistObjective = { id, labelKo, kind: 'required', notesKo, needsVerification: true };
  if (id === 'act3-machinarium-blackjaw-fire-resistance') {
    objective.autoComplete = [
      { type: 'reward-acquired', includes: ['[Resistances|화염] 저항 +10%'], areaId: 'act3-jiquanis-machinarium', confidence: 'high' }
    ];
  }
  return objective;
}

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
  if (areaId === 'act3-jungle-ruins' && objectiveId === 'act3-jungle-ruins-silverfist-passive') {
    return [{ type: 'reward-acquired' as const, areaId, includes: ['패시브 스킬 포인트 2포인트를 획득했습니다'], confidence: 'high' as const }];
  }
  if (areaId === 'act3-jiquanis-machinarium' && objectiveId === 'act3-machinarium-blackjaw-fire') {
    return [{ type: 'reward-acquired' as const, areaId, includes: ['[Resistances|화염] 저항 +10%'], confidence: 'high' as const }];
  }
  if (areaId === 'act3-azak-bog' && objectiveId === 'act3-tribal-vengeance-ignagduk') {
    return [{ type: 'reward-acquired' as const, areaId, includes: ['[Spirit|정신력] +30'], confidence: 'high' as const }];
  }
  if (areaId === 'act3-aggorat' && objectiveId === 'act3-aggorat-sacrificial-heart') {
    return [{ type: 'reward-acquired' as const, areaId, includes: ['패시브 스킬 포인트 2포인트를 획득했습니다'], confidence: 'high' as const }];
  }
  return undefined;
}
