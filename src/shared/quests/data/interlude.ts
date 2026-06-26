import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist, ChecklistObjective } from '../checklist';

// POE2 Interlude quest data from poe2wiki quest category pages collected on 2026-06-19.
// These are campaign transition acts after Act 3 and before/inside Act 4. KR wording remains needsVerification.
export const interludeAreas: AreaDefinition[] = [
  {
    id: 'interlude-ezomytes',
    act: 0,
    nameKo: '막간: 에조미어 모집',
    nameEn: 'Interlude: 에조미어인 모집',
    logNamesKo: ['막간: 에조미어 모집', '에조미어인 모집', '오검'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-recruit-ezomytes']
  },
  {
    id: 'interlude-wolvenhold',
    act: 0,
    nameKo: '울븐홀드',
    nameEn: 'Wolvenhold',
    logNamesKo: ['울븐홀드', 'Wolvenhold'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-wolvenhold-oswin-passive']
  },
  {
    id: 'interlude-maraketh',
    act: 0,
    nameKo: '막간: 마라케스 모집',
    nameEn: 'Interlude: 마라케스인 모집',
    logNamesKo: ['막간: 마라케스 모집', '마라케스인 모집', '시장'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-recruit-maraketh']
  },
  {
    id: 'interlude-khari-crossing',
    act: 0,
    nameKo: '카리 교차로',
    nameEn: 'The Khari Crossing',
    logNamesKo: ['카리 교차로', 'The Khari Crossing'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-khari-skullmaw-life', 'interlude-khari-worm-scorpion-passive']
  },
  {
    id: 'interlude-qimah',
    act: 0,
    nameKo: '키마',
    nameEn: 'Qimah',
    logNamesKo: ['키마', 'Qimah'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-qimah-boon-choice']
  },
  {
    id: 'interlude-vaal',
    act: 0,
    nameKo: '막간: 바알 모집',
    nameEn: 'Interlude: 바알인 모집',
    logNamesKo: ['막간: 바알 모집', '바알인 모집', '크리아르 산'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-recruit-vaal']
  },
  {
    id: 'interlude-kriar-village',
    act: 0,
    nameKo: '크리아르 마을',
    nameEn: 'Kriar Village',
    logNamesKo: ['크리아르 마을', 'Kriar Village'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-kriar-lythara-spirit']
  },
  {
    id: 'interlude-howling-caves',
    act: 0,
    nameKo: '울부짖는 동굴',
    nameEn: 'Howling Caves',
    logNamesKo: ['울부짖는 동굴', 'Howling Caves'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-howling-caves-yeti-passive']
  }
];

export const interludeChecklists: AreaChecklist[] = interludeAreas.map((area) => objectives(area.id, []));

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
