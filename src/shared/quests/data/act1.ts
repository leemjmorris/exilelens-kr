import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist, ChecklistObjective } from '../checklist';

// POE2 Act 1 seed data sourced from poe2wiki public pages on 2026-06-19.
// See docs/data-sources.md for URLs, scope, and remaining Korean Client.txt verification needs.

export const act1Areas: AreaDefinition[] = [
  {
    id: 'act1-riverbank',
    act: 1,
    nameKo: '강둑',
    nameEn: 'The Riverbank',
    logNamesKo: ['강둑', 'The Riverbank'],
    areaIdAliases: ['g1_1'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-riverbank-reaching-clearfell']
  },
  {
    id: 'act1-clearfell-encampment',
    act: 1,
    nameKo: '클리어펠 야영지',
    nameEn: 'Clearfell Encampment',
    logNamesKo: ['클리어펠 야영지', 'Clearfell Encampment'],
    areaIdAliases: ['g1_town'],
    isTown: true,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-clearfell-encampment-reward', 'act1-clearfell-encampment-cracks']
  },
  {
    id: 'act1-clearfell',
    act: 1,
    nameKo: '클리어펠',
    nameEn: 'Clearfell',
    logNamesKo: ['클리어펠', 'Clearfell'],
    areaIdAliases: ['g1_2'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-clearfell-beira']
  },
  {
    id: 'act1-mud-burrow',
    act: 1,
    nameKo: '진흙 토굴',
    nameEn: 'Mud Burrow',
    logNamesKo: ['진흙 토굴', '진흙 굴', 'Mud Burrow'],
    areaIdAliases: ['g1_3'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-mud-burrow-treacherous-ground']
  },
  {
    id: 'act1-grelwood',
    act: 1,
    nameKo: '그렐우드',
    nameEn: 'The Grelwood',
    logNamesKo: ['그렐우드', 'The Grelwood'],
    areaIdAliases: ['g1_4'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-grelwood-secrets']
  },
  {
    id: 'act1-red-vale',
    act: 1,
    nameKo: '붉은 계곡',
    nameEn: 'The Red Vale',
    logNamesKo: ['붉은 계곡', 'The Red Vale'],
    areaIdAliases: ['g1_5'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-red-vale-secrets']
  },
  {
    id: 'act1-grim-tangle',
    act: 1,
    nameKo: '으스스한 덩굴',
    nameEn: 'The Grim Tangle',
    logNamesKo: ['으스스한 덩굴', '음울한 덤불', 'The Grim Tangle'],
    areaIdAliases: ['g1_6'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-grim-tangle-mysterious-shade']
  },
  {
    id: 'act1-cemetery-of-the-eternals',
    act: 1,
    nameKo: '영원한 자의 공동묘지',
    nameEn: 'Cemetery of the Eternals',
    logNamesKo: ['영원한 자의 공동묘지', '영원의 묘지', 'Cemetery of the Eternals'],
    areaIdAliases: ['g1_7'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-cemetery-sorrow']
  },
  {
    id: 'act1-tomb-of-the-consort',
    act: 1,
    nameKo: '배우자의 무덤',
    nameEn: 'Tomb of the Consort',
    logNamesKo: ['배우자의 무덤', 'Tomb of the Consort'],
    areaIdAliases: ['g1_9'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-tomb-consort-sorrow']
  },
  {
    id: 'act1-mausoleum-of-the-praetor',
    act: 1,
    nameKo: '집정관의 능묘',
    nameEn: 'Mausoleum of the Praetor',
    logNamesKo: ['집정관의 능묘', '법무관의 영묘', 'Mausoleum of the Praetor'],
    areaIdAliases: ['g1_8'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-mausoleum-praetor-sorrow']
  },
  {
    id: 'act1-hunting-grounds',
    act: 1,
    nameKo: '사냥터',
    nameEn: 'Hunting Grounds',
    logNamesKo: ['사냥터', 'Hunting Grounds'],
    areaIdAliases: ['g1_11'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-hunting-grounds-trail', 'act1-hunting-grounds-crowbell-passive', 'act1-hunting-grounds-hunt-begins']
  },
  {
    id: 'act1-freythorn',
    act: 1,
    nameKo: '프레이쏜',
    nameEn: 'Freythorn',
    logNamesKo: ['프레이쏜', 'Freythorn'],
    areaIdAliases: ['g1_12'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-freythorn-ominous-altars']
  },
  {
    id: 'act1-lost-catacombs',
    act: 1,
    nameKo: '잊힌 지하묘지',
    nameEn: 'Lost Catacombs',
    logNamesKo: ['잊힌 지하묘지', 'Lost Catacombs'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: []
  },
  {
    id: 'act1-ogham-farmlands',
    act: 1,
    nameKo: '오검 농지',
    nameEn: 'Ogham Farmlands',
    logNamesKo: ['오검 농지', 'Ogham Farmlands'],
    areaIdAliases: ['g1_13_1'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-ogham-farmlands-lost-lute']
  },
  {
    id: 'act1-ogham-village',
    act: 1,
    nameKo: '오검 마을',
    nameEn: 'Ogham Village',
    logNamesKo: ['오검 마을', 'Ogham Village'],
    areaIdAliases: ['g1_13_2'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-ogham-village-trail', 'act1-ogham-village-forge']
  },
  {
    id: 'act1-manor-ramparts',
    act: 1,
    nameKo: '저택 성벽',
    nameEn: 'The Manor Ramparts',
    logNamesKo: ['저택 성벽', 'The Manor Ramparts'],
    areaIdAliases: ['g1_14'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-manor-ramparts-mad-wolf']
  },
  {
    id: 'act1-ogham-manor',
    act: 1,
    nameKo: '오검 저택',
    nameEn: 'Ogham Manor',
    logNamesKo: ['오검 저택', 'Ogham Manor', 'The Iron Manor'],
    areaIdAliases: ['g1_15'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['act1-ogham-manor-mad-wolf', 'act1-ogham-manor-candlemass-life']
  }
];

const act1EssentialObjectives: Record<string, ChecklistObjective[]> = {
  'act1-clearfell': [
    required('act1-clearfell-beira-cold-resistance', '클리어펠: 썩은 무리의 베이라 처치로 냉기 저항 +10% 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 1 일반')
  ],
  'act1-hunting-grounds': [
    required('act1-hunting-grounds-crowbell-passive', '사냥터: 까마귀종을 끝까지 추격해 처치하고 패시브 스킬 2포인트 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 1 일반')
  ],
  'act1-freythorn': [
    required('act1-freythorn-king-spirit', '프레이쏜: 의식 제단 4개 완료 후 연무 속의 왕 처치로 정신력 +30 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 1 일반')
  ],
  'act1-ogham-farmlands': [
    required('act1-ogham-farmlands-lute-passive', '오검 농지: 우나의 류트를 전달하고 패시브 스킬 2포인트 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 1 일반')
  ],
  'act1-ogham-village': [
    required('act1-ogham-village-salvage-bench', '오검 마을: 대장장이 도구를 렌리에게 전달해 분해 작업대 해금하기', '0.5.0 필수 퀘스트 가이드: 액트 1 일반')
  ],
  'act1-ogham-manor': [
    required('act1-ogham-manor-candlemass-life', '오검 저택: 살아있는 의례 양초덩어리 처치로 생명력 최대치 +20 챙기기', '0.5.0 필수 퀘스트 가이드: 액트 1 일반')
  ]
};

export const act1Checklists: AreaChecklist[] = act1Areas.map((area) => ({
  areaId: area.id,
  needsVerification: true,
  objectives: act1EssentialObjectives[area.id] ?? []
}));

function required(id: string, labelKo: string, notesKo: string): ChecklistObjective {
  return { id, labelKo, kind: 'required', notesKo, needsVerification: true };
}
