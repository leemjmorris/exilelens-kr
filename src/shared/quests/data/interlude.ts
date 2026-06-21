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
  objective('interlude-wolvenhold', 'interlude-wolvenhold-oswin-passive', '울븐홀드: Oswin, the Dread Warden 처치로 패시브 스킬 2포인트 챙기기', 'required', '0.5.0 기준 꼭 챙길 막간 영구 보상'),
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
  objectives('interlude-khari-crossing', [
    ['interlude-khari-skullmaw-life', '카리 교차로: Skullmaw Stairway 보상으로 최대 생명력 5% 챙기기', 'required', '0.5.0 기준 꼭 챙길 막간 영구 보상'],
    ['interlude-khari-worm-scorpion-passive', '카리 교차로: Worm and Scorpion 처치로 패시브 스킬 2포인트 챙기기', 'required', '0.5.0 기준 꼭 챙길 막간 영구 보상']
  ]),
  objective('interlude-qimah', 'interlude-qimah-boon-choice', '키마: Tabana/Orbala/Ahkeli/Galai/Halani/Kochai/Alima 보상 선택 확인', 'required', '0.5.0 기준 꼭 챙길 막간 영구 보상 선택'),
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
  },
  objective('interlude-kriar-village', 'interlude-kriar-lythara-spirit', '크리아르 마을: Lythara, the Wayward Spear 처치로 최대 정신력 40 챙기기', 'required', '0.5.0 기준 꼭 챙길 막간 영구 보상'),
  objective('interlude-howling-caves', 'interlude-howling-caves-yeti-passive', '울부짖는 동굴: The Abominable Yeti 처치로 패시브 스킬 2포인트 챙기기', 'required', '0.5.0 기준 꼭 챙길 막간 영구 보상')
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
