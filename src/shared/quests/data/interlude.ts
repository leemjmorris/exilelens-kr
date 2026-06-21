import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist } from '../checklist';

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
    id: 'interlude-vaal',
    act: 0,
    nameKo: '막간: 바알 모집',
    nameEn: 'Interlude: 바알인 모집',
    logNamesKo: ['막간: 바알 모집', '바알인 모집', '크리아르 산'],
    isTown: false,
    hasMapThumbnail: false,
    needsVerification: true,
    guideStepIds: ['interlude-recruit-vaal']
  }
];

export const interludeChecklists: AreaChecklist[] = [
  {
    areaId: 'interlude-ezomytes',
    needsVerification: true,
    objectives: [
      {
        id: 'interlude-recruit-ezomytes',
        labelKo: '에조미어인 모집: Hooded One을 통해 오검으로 이동 후 Thane Wulfric/Lady Elswyth 처치',
        kind: 'required',
        notesKo: 'poe2db 한국어 퀘스트명 기준. 세부 목표 번역은 한국어 클라이언트 로그로 추가 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'interlude-maraketh',
    needsVerification: true,
    objectives: [
      {
        id: 'interlude-recruit-maraketh',
        labelKo: '마라케스인 모집: 시장로 이동 후 Azmadi, the Faridun Prince 처치',
        kind: 'required',
        notesKo: 'poe2db 한국어 퀘스트명 기준. 세부 목표 번역은 한국어 클라이언트 로그로 추가 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'interlude-vaal',
    needsVerification: true,
    objectives: [
      {
        id: 'interlude-recruit-vaal',
        labelKo: '바알인 모집: 크리아르 산로 이동 후 Zelina/Zolin 처치',
        kind: 'required',
        notesKo: 'poe2db 한국어 퀘스트명 기준. 세부 목표 번역은 한국어 클라이언트 로그로 추가 검증 필요.',
        needsVerification: true
      }
    ]
  }
];
