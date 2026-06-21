import type { AreaDefinition } from '../areaMatcher';
import type { AreaChecklist } from '../checklist';

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

export const act1Checklists: AreaChecklist[] = [
  {
    areaId: 'act1-riverbank',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-riverbank-reaching-clearfell',
        labelKo: '클리어펠에 도달하기: 불어 터진 방아꾼 처치 후 클리어펠 야영지 진입',
        kind: 'required',
        notesKo: 'poe2wiki 퀘스트/진행 표 기반. 한국어 Client.txt 지역명은 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-clearfell-encampment',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-clearfell-encampment-reward',
        labelKo: '렌리 보상 수령 및 다음 필수 진행 확인',
        kind: 'required',
        notesKo: 'Reaching Clearfell/Treacherous Ground 보상 동선. 실제 보상 텍스트는 Client.txt/게임 내 검증 필요.',
        needsVerification: true
      },
      {
        id: 'act1-clearfell-encampment-cracks',
        labelKo: '땅에 생긴 균열 선택 퀘스트가 보이면 별도 진행',
        kind: 'optional',
        notesKo: 'poe2wiki에 Rise of the Abyssal 전용 선택 퀘스트로 기재됨. 현 리그 노출 여부 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-clearfell',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-clearfell-beira',
        labelKo: '썩은 무리의 베이라 처치: 냉기 저항 +10% 영구 보상 챙기기',
        kind: 'required',
        notesKo: '0.5.0 기준 꼭 챙길 Act 1 영구 보상. poe2db Quest 보상 표 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-mud-burrow',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-mud-burrow-treacherous-ground',
        labelKo: '변덕스러운 대지: 포식자 처치',
        kind: 'required',
        notesKo: 'poe2wiki 퀘스트 페이지 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-grelwood',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-grelwood-secrets',
        labelKo: '어둠 속의 비밀: 백작의 활동 단서 탐색',
        kind: 'required',
        notesKo: 'poe2wiki는 The Grelwood/The Red Vale 관련 퀘스트로 기재. 세부 목표 순서는 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-red-vale',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-red-vale-secrets',
        labelKo: '어둠 속의 비밀: 룬이 새겨진 물건/오벨리스크 진행 확인',
        kind: 'required',
        notesKo: 'poe2wiki 퀘스트 페이지의 Red Vale 및 runed item 설명 기반. 한국어 명칭 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-grim-tangle',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-grim-tangle-mysterious-shade',
        labelKo: '수수께끼의 그늘: 두건 쓴 자 부활 진행',
        kind: 'required',
        notesKo: 'poe2wiki 퀘스트 페이지 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-cemetery-of-the-eternals',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-cemetery-sorrow',
        labelKo: '돌들 사이의 슬픔: 추모의 문 개방 목표 시작',
        kind: 'required',
        notesKo: 'poe2wiki 퀘스트 페이지와 Act 1 진행 표 기준. 키/보스 세부 순서 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-tomb-of-the-consort',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-tomb-consort-sorrow',
        labelKo: '돌들 사이의 슬픔: 아시니아 관련 목표 확인',
        kind: 'required',
        notesKo: 'poe2wiki 진행 표의 보스/지역 연결 기반. 실제 퀘스트 단계명 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-mausoleum-of-the-praetor',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-mausoleum-praetor-sorrow',
        labelKo: '돌들 사이의 슬픔: 드레이븐 관련 목표 확인',
        kind: 'required',
        notesKo: 'poe2wiki 진행 표의 보스/지역 연결 기반. 실제 퀘스트 단계명 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-hunting-grounds',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-hunting-grounds-trail',
        labelKo: '타락의 흔적 진행 시작 및 오검 방향 루트 확인',
        kind: 'required',
        notesKo: 'poe2wiki는 Hunting Grounds 진입 또는 The Mysterious Shade 완료로 시작된다고 기재.',
        needsVerification: true
      },
      {
        id: 'act1-hunting-grounds-crowbell-passive',
        labelKo: '까마귀종 처치: 패시브 스킬 2포인트 영구 보상 챙기기',
        kind: 'required',
        notesKo: '0.5.0 기준 꼭 챙길 Act 1 영구 보상. poe2db Quest 보상 표의 The Crowbell 기준.',
        needsVerification: true
      },
      {
        id: 'act1-hunting-grounds-hunt-begins',
        labelKo: '사냥의 시작: 델윈/아즈메리 위습 소개 퀘스트 확인',
        kind: 'optional',
        notesKo: 'poe2wiki 선택 퀘스트 기준. 현 버전/리그에서 노출 조건 검증 필요.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-freythorn',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-freythorn-ominous-altars',
        labelKo: '불길한 제단: 의식 제단 정화 및 연무 속의 왕 처치로 정신력 +30 챙기기',
        kind: 'required',
        notesKo: '0.5.0 기준 꼭 챙길 Act 1 영구 보상. poe2db Quest 보상 표 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-lost-catacombs',
    needsVerification: true,
    objectives: []
  },
  {
    areaId: 'act1-ogham-farmlands',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-ogham-farmlands-lost-lute',
        labelKo: '잃어버린 류트: 우나의 류트를 찾아 패시브 스킬 2포인트 챙기기',
        kind: 'required',
        notesKo: '0.5.0 기준 꼭 챙길 Act 1 영구 보상. poe2db Quest 보상 표 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-ogham-village',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-ogham-village-trail',
        labelKo: '타락의 흔적: 사형 집행자 처치',
        kind: 'required',
        notesKo: 'poe2wiki 퀘스트 페이지 기준.',
        needsVerification: true
      },
      {
        id: 'act1-ogham-village-forge',
        labelKo: '대장간 찾기: 대장장이 도구를 찾아 분해 작업대 해금',
        kind: 'required',
        notesKo: '0.5.0 기준 꼭 챙길 Act 1 시스템 해금. poe2db Quest 보상 표 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-manor-ramparts',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-manor-ramparts-mad-wolf',
        labelKo: '오검의 미친 늑대: 오검 저택 진입 전 루트 확인',
        kind: 'required',
        notesKo: 'poe2wiki Act 1 진행 표 기준.',
        needsVerification: true
      }
    ]
  },
  {
    areaId: 'act1-ogham-manor',
    needsVerification: true,
    objectives: [
      {
        id: 'act1-ogham-manor-mad-wolf',
        labelKo: '오검의 미친 늑대: 지오너 백작 처치 후 2장으로 진행',
        kind: 'required',
        notesKo: 'poe2wiki Act 1 진행 표는 Ogham Manor, 퀘스트 페이지는 The Iron Manor로 표기되어 출처 간 명칭 차이 있음.',
        needsVerification: true
      },
      {
        id: 'act1-ogham-manor-candlemass-life',
        labelKo: '캔들매스 처치: 최대 생명력 +20 영구 보상 챙기기',
        kind: 'required',
        notesKo: '0.5.0 기준 꼭 챙길 Act 1 영구 보상. poe2db Quest 보상 표의 Candlemass 기준.',
        needsVerification: true
      }
    ]
  }
];

