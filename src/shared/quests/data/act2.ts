import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist } from '../checklist';

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

export const act2Checklists: AreaChecklist[] = [
  objective('act2-vastiri-outskirts', 'act2-earning-passage-rathbreaker', '통행의 자격: Rathbreaker 처치 후 카라반 통행권 확보', 'required', 'Vastiri Outskirts / Rathbreaker / Zarka'),
  objectives('act2-ardura-caravan', [
    ['act2-trail-of-corruption-start', '타락의 흔적: 아르듀라 카라반에서 2장 추적 시작', 'required', 'Act 1에서 이어지는 메인 진행'],
    ['act2-crown-stone-turn-in', '돌의 왕관: Flame Ruby 획득 후 Zarka에게 보고', 'required', 'Titan Grotto 보상 회수'],
    ['act2-theft-ivory-turn-in', '상아 도둑: Mastodon Tusks 획득 후 Zarka에게 보고', 'required', 'Bone Pits 보상 회수'],
    ['act2-city-seven-waters-turn-in', '일곱 갈래 물의 도시: Water Goddess 관련 핵심 아이템 보고', 'required', 'Buried Shrines 완료 후 보고']
  ]),
  objective('act2-traitors-passage', 'act2-ascent-to-power-balbala', '힘의 상승: Balbala/Djinn Barya 획득', 'optional', 'Ascendancy unlock chain 시작'),
  objective('act2-halani-gates', 'act2-halani-gates-sandstorm', 'Halani Gates: 모래폭풍 조우 후 Act 2 주요 분기 해금', 'required', '돌의 왕관 / 상아 도둑 / 일곱 갈래 물의 도시 시작 지점'),
  objective('act2-keth', 'act2-ancient-vows-kabala-relic', '고대의 맹세: Kabala Clan Relic 획득', 'required', '0.5.0 기준 Charm 관련 꼭 챙길 Act 2 영구 보상'),
  objective('act2-lost-city', 'act2-ancient-vows-lost-city-relic', '고대의 맹세: Serpent 계열 적에게서 Relic 획득 확인', 'required', 'Keth/Lost City 공통 Charm 보상 진행'),
  objective('act2-buried-shrines', 'act2-city-seven-waters-essence', '일곱 갈래 물의 도시: Azarian 처치 및 핵심 아이템 획득', 'required', 'Buried Shrines 메인 목표'),
  objectives('act2-mastodon-badlands', [
    ['act2-theft-ivory-find-bone-pits', '상아 도둑: Bone Pits 입구 찾기', 'required', 'Mastodon Badlands 탐색'],
    ['act2-well-of-souls-start', '영혼의 우물: Lightless Passage/Well of Souls 진행 확인', 'optional', 'Mastodon Badlands 선택 퀘스트']
  ]),
  objectives('act2-bone-pits', [
    ['act2-theft-ivory-tusks', '상아 도둑: Ekbab/Iktab 처치 후 Mastodon Tusks 획득', 'required', 'Bone Pits 메인 목표'],
    ['act2-ancient-vows-sun-relic', '고대의 맹세: Sun Clan Relic 획득', 'required', '0.5.0 기준 Charm 관련 꼭 챙길 Act 2 영구 보상']
  ]),
  objectives('act2-valley-of-the-titans', [
    ['act2-crown-stone-ancient-seals', '돌의 왕관: Ancient Seals 활성화 후 Titan Grotto 진입', 'required', 'Valley of the Titans 진행'],
    ['act2-ancient-vows-medallion', '고대의 맹세: Statue of a Titan 메달리온에 Relics 장착 후 Charm 보상 선택', 'required', '0.5.0 기준 꼭 챙길 Act 2 영구 보상']
  ]),
  objective('act2-titan-grotto', 'act2-crown-stone-flame-ruby', '돌의 왕관: Zalmarath 처치 후 Flame Ruby 획득', 'required', 'Titan Grotto 메인 목표'),
  objective('act2-deshar', 'act2-traditions-toll-final-letter', "관례의 대가: Final Letter를 찾아 Shambrin에게 전달하고 패시브 스킬 2포인트 챙기기", 'required', '0.5.0 기준 꼭 챙길 Act 2 영구 보상'),
  objective('act2-path-of-mourning', 'act2-path-mourning-route', 'Path of Mourning: Deshar 첨탑 방향 메인 루트 진행', 'required', '메인 동선 확인용'),
  objectives('act2-spires-of-deshar', [
    ['act2-spires-route', 'The Spires of Deshar: Dreadnought 방향 진행', 'required', '메인 동선 확인용'],
    ['act2-spires-garukhan-lightning', '데샤르의 첨탑: 가루칸 성소 클릭으로 번개 저항 +10% 영구 보상 챙기기', 'required', '0.5.0 기준 꼭 챙길 Act 2 영구 보상']
  ]),
  objective('act2-mawdun-quarry', 'act2-mawdun-quarry-route', 'Mawdun Quarry: Mawdun Mine 방향 진행', 'required', '메인 동선 확인용'),
  objective('act2-mawdun-mine', 'act2-mawdun-mine-jamanra', 'Mawdun Mine: Jamanra 추적 루트 진행', 'required', 'Dreadnought 진입 전 메인 동선'),
  objective('act2-dreadnought', 'act2-dreadnought-jamanra', 'Dreadnought: Jamanra, the Risen King 추적 및 Act 3 진행', 'required', 'Act 2 최종 메인 목표'),
  objective('act2-trial-of-the-sekhemas', 'act2-ascent-to-power-trial', '힘의 상승: Trial of the Sekhemas 완료 및 Ascendancy 포인트 획득', 'optional', '승천 시험')
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
  if (areaId === 'act2-spires-of-deshar' && objectiveId === 'act2-spires-garukhan-lightning') {
    return [{ type: 'reward-acquired' as const, areaId, includes: ['[Resistances|번개] 저항 +10%'], confidence: 'high' as const }];
  }
  return undefined;
}
