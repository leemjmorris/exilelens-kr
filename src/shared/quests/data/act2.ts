import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist, ChecklistObjective } from '../checklist';

// POE2 Act 2 area seed data. Korean names are sourced from poe2db.tw/kr page titles on 2026-06-19.
// Quest linkage is based on poe2wiki quest pages/category data collected on 2026-06-19; KR quest wording remains needsVerification.
export const act2Areas: AreaDefinition[] = [
  { id: 'act2-vastiri-outskirts', act: 2, nameKo: '바스티리 외곽', nameEn: 'Vastiri Outskirts', logNamesKo: ['바스티리 외곽', 'Vastiri Outskirts'], areaIdAliases: ['g2_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-earning-passage-rathbreaker'] },
  { id: 'act2-ardura-caravan', act: 2, nameKo: '아르듀라 카라반', nameEn: 'The Ardura Caravan', logNamesKo: ['아르듀라 카라반', '아르두라 대상', 'The Ardura Caravan'], areaIdAliases: ['g2_town'], isTown: true, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-trail-of-corruption-start', 'act2-crown-stone-turn-in', 'act2-theft-ivory-turn-in', 'act2-city-seven-waters-turn-in'] },
  { id: 'act2-traitors-passage', act: 2, nameKo: '배반자의 통로', nameEn: "Traitor's Passage", logNamesKo: ['배반자의 통로', '반역자의 통로', "Traitor's Passage"], areaIdAliases: ['g2_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-ascent-to-power-balbala'] },
  { id: 'act2-halani-gates', act: 2, nameKo: '할라니 관문', nameEn: 'The Halani Gates', logNamesKo: ['할라니 관문', 'The Halani Gates'], areaIdAliases: ['g2_3', 'g2_3a'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-halani-gates-sandstorm'] },
  { id: 'act2-keth', act: 2, nameKo: '케스', nameEn: 'Keth', logNamesKo: ['케스', 'Keth'], areaIdAliases: ['g2_4_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-ancient-vows-kabala-relic'] },
  { id: 'act2-lost-city', act: 2, nameKo: '잃어버린 도시', nameEn: 'The Lost City', logNamesKo: ['잃어버린 도시', 'The Lost City'], areaIdAliases: ['g2_4_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-ancient-vows-lost-city-relic'] },
  { id: 'act2-buried-shrines', act: 2, nameKo: '묻힌 성소', nameEn: 'Buried Shrines', logNamesKo: ['묻힌 성소', 'Buried Shrines'], areaIdAliases: ['g2_4_3'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-city-seven-waters-essence'] },
  { id: 'act2-mastodon-badlands', act: 2, nameKo: '마스토돈 불모지', nameEn: 'Mastodon Badlands', logNamesKo: ['마스토돈 불모지', '매스토돈 황무지', 'Mastodon Badlands'], areaIdAliases: ['g2_5_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-theft-ivory-find-bone-pits', 'act2-well-of-souls-start'] },
  { id: 'act2-bone-pits', act: 2, nameKo: '뼈 구덩이', nameEn: 'The Bone Pits', logNamesKo: ['뼈 구덩이', '뼈의 구덩이', 'The Bone Pits'], areaIdAliases: ['g2_5_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-theft-ivory-tusks', 'act2-ancient-vows-sun-relic'] },
  { id: 'act2-valley-of-the-titans', act: 2, nameKo: '거신의 계곡', nameEn: 'Valley of the Titans', logNamesKo: ['거신의 계곡', '거인의 계곡', 'Valley of the Titans'], areaIdAliases: ['g2_6'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-crown-stone-ancient-seals', 'act2-ancient-vows-medallion'] },
  { id: 'act2-titan-grotto', act: 2, nameKo: '거신 석굴', nameEn: 'The Titan Grotto', logNamesKo: ['거신 석굴', '거인 동굴', 'The Titan Grotto'], areaIdAliases: ['g2_7'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-crown-stone-flame-ruby'] },
  { id: 'act2-deshar', act: 2, nameKo: '데샤르', nameEn: 'Deshar', logNamesKo: ['데샤르', 'Deshar'], areaIdAliases: ['g2_8'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-traditions-toll-final-letter'] },
  { id: 'act2-path-of-mourning', act: 2, nameKo: '통곡의 길', nameEn: 'Path of Mourning', logNamesKo: ['통곡의 길', 'Path of Mourning'], areaIdAliases: ['g2_9_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-path-mourning-route'] },
  { id: 'act2-spires-of-deshar', act: 2, nameKo: '데샤르의 첨탑', nameEn: 'The Spires of Deshar', logNamesKo: ['데샤르의 첨탑', 'The Spires of Deshar'], areaIdAliases: ['g2_9_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-spires-route', 'act2-spires-garukhan-lightning'] },
  { id: 'act2-mawdun-quarry', act: 2, nameKo: '모둔 채석장', nameEn: 'Mawdun Quarry', logNamesKo: ['모둔 채석장', 'Mawdun Quarry'], areaIdAliases: ['g2_10_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-mawdun-quarry-route'] },
  { id: 'act2-mawdun-mine', act: 2, nameKo: '모둔 광산', nameEn: 'Mawdun Mine', logNamesKo: ['모둔 광산', 'Mawdun Mine'], areaIdAliases: ['g2_10_2'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-mawdun-mine-jamanra'] },
  { id: 'act2-dreadnought', act: 2, nameKo: '드레드노트', nameEn: 'Dreadnought', logNamesKo: ['드레드노트', 'Dreadnought', 'The Dreadnought'], areaIdAliases: ['g2_12', 'g2_12_1'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-dreadnought-jamanra'] },
  { id: 'act2-trial-of-the-sekhemas', act: 2, nameKo: '세케마의 시련', nameEn: 'Trial of the Sekhemas', logNamesKo: ['세케마의 시련', 'Trial of the Sekhemas'], areaIdAliases: ['g2_13'], isTown: false, hasMapThumbnail: false, needsVerification: true, guideStepIds: ['act2-ascent-to-power-trial'] }
];

const act2EssentialObjectives: Record<string, ChecklistObjective[]> = {
  'act2-keth': [required('act2-keth-kabala-passive', '케스: 위압자 여왕 카발라 처치로 패시브 스킬 2포인트 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 2 일반')],
  'act2-valley-of-the-titans': [required('act2-valley-ancient-vows-choice', '거신의 계곡: 카발라/태양 혈족 유물 2개를 성소에 배치하고 성소 선택 보상 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 2 일반')],
  'act2-deshar': [required('act2-deshar-final-letter-passive', '데샤르: 마지막 편지를 전달하고 패시브 스킬 2포인트 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 2 일반')],
  'act2-spires-of-deshar': [required('act2-spires-garukhan-lightning-resistance', '데샤르의 첨탑: 가루칸의 자매들 성소를 상호작용해 번개 저항 +10% 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 2 일반')]
};

export const act2Checklists: AreaChecklist[] = act2Areas.map((area) => ({ areaId: area.id, needsVerification: true, objectives: act2EssentialObjectives[area.id] ?? [] }));

function required(id: string, labelKo: string, notesKo: string): ChecklistObjective {
  const objective: ChecklistObjective = { id, labelKo, kind: 'required', notesKo, needsVerification: true };
  if (id === 'act2-spires-garukhan-lightning-resistance') {
    objective.autoComplete = [
      { type: 'reward-acquired', includes: ['[Resistances|번개] 저항 +10%'], areaId: 'act2-spires-of-deshar', confidence: 'high' }
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
  if (areaId === 'act2-spires-of-deshar' && objectiveId === 'act2-spires-garukhan-lightning') {
    return [{ type: 'reward-acquired' as const, areaId, includes: ['[Resistances|번개] 저항 +10%'], confidence: 'high' as const }];
  }
  return undefined;
}
