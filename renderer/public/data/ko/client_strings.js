// @ts-check
/** @type{import('../../../src/assets/data/interfaces').TranslationDict} */
export default {
  RARITY_NORMAL: '일반',
  RARITY_MAGIC: '마법',
  RARITY_RARE: '희귀',
  RARITY_UNIQUE: '고유',
  RARITY_GEM: '젬',
  RARITY_CURRENCY: '화폐',
  RARITY_DIVCARD: '점술 카드',
  MAP_TIER: '지도 등급: ',
  RARITY: '아이템 희귀도: ',
  ITEM_CLASS: '아이템 종류: ',
  ITEM_LEVEL: '아이템 레벨: ',
  TALISMAN_TIER: '부적 등급: ',
  GEM_LEVEL: '레벨: ',
  STACK_SIZE: '스택 크기: ',
  SOCKETS: '홈: ',
  QUALITY: '퀄리티: ',
  PHYSICAL_DAMAGE: '물리 피해: ',
  ELEMENTAL_DAMAGE: '원소 피해: ',
  CRIT_CHANCE: '치명타 확률: ',
  ATTACK_SPEED: '초당 공격 횟수: ',
  ARMOUR: '방어도: ',
  EVASION: '회피: ',
  ENERGY_SHIELD: '에너지 보호막: ',
  TAG_WARD: '수호: ',
  BLOCK_CHANCE: '막아낼 확률: ',
  CORRUPTED: '타락',
  UNIDENTIFIED: '미확인',
  ITEM_SUPERIOR: /^상급 (.*)$/,
  MAP_BLIGHTED: /^역병 (.*)$/,
  MAP_BLIGHT_RAVAGED: /^역병 걸린 (.*)$/,
  INFLUENCE_SHAPER: '쉐이퍼 아이템',
  INFLUENCE_ELDER: '엘더 아이템',
  INFLUENCE_CRUSADER: '십자군 아이템',
  INFLUENCE_HUNTER: '사냥꾼 아이템',
  INFLUENCE_REDEEMER: '대속자 아이템',
  INFLUENCE_WARLORD: '전쟁군주 아이템',
  SECTION_SYNTHESISED: '결합된 아이템',
  ITEM_SYNTHESISED: /^결합된 (.*)$/,
  VEILED_PREFIX: '장막 접두어',
  VEILED_SUFFIX: '장막 접미어',
  FLASK_CHARGES: /^현재 용량: \d+$/,
  METAMORPH_HELP: "태인의 연구실에서 이 아이템을 다른 샘플과 조합하십시오.",
  BEAST_HELP: '우클릭으로 이것을 야수 도감에 추가하십시오.',
  VOIDSTONE_HELP: 'Socket this into your Atlas to increase the Tier of all Maps.',
  METAMORPH_BRAIN: /^뇌: .*$/,
  METAMORPH_EYE: /^눈: .*$/,
  METAMORPH_LUNG: /^간: .*$/,
  METAMORPH_HEART: /^폐: .*$/,
  METAMORPH_LIVER: /^심장: .*$/,
  CANNOT_USE_ITEM: '아이템 착용 불가. 아이템 효과 미적용',
  QUALITY_ANOMALOUS: /^기묘한: (.*)$/,
  QUALITY_DIVERGENT: /^상이한: (.*)$/,
  QUALITY_PHANTASMAL: /^몽환적인: (.*)$/,
  AREA_LEVEL: '지역 레벨: ',
  HEIST_WINGS_REVEALED: 'Wings Revealed: ',
  HEIST_TARGET: 'Heist Target: ',
  HEIST_BLUEPRINT_ENCHANTS: 'Enchanted Armaments',
  HEIST_BLUEPRINT_TRINKETS: 'Thieves\' Trinkets or Currency',
  HEIST_BLUEPRINT_GEMS: 'Unusual Gems',
  HEIST_BLUEPRINT_REPLICAS: 'Replicas or Experimented Items',
  MIRRORED: '복제',
  MODIFIER_LINE: /^(?<type>[^"]+)(?:\s+"(?<name>[^"]+)")?(?:\s+\(지도 등급: (?<tier>\d+)\))?(?:\s+\((등급|단계): (?<rank>\d+)\))?$/,
  PREFIX_MODIFIER: '접두어 속성 부여',
  SUFFIX_MODIFIER: '접미어 속성 부여',
  CRAFTED_PREFIX: '대가 제작 접두어 속성 부여',
  CRAFTED_SUFFIX: '대가 제작 접미어 속성 부여',
  UNSCALABLE_VALUE: ' — 변경이 불가능한 값',
  CORRUPTED_IMPLICIT: '타락 고정 속성 부여',
  MODIFIER_INCREASED: /^(.+?)% 증가$/,
  INCURSION_OPEN: '열린 방:',
  INCURSION_OBSTRUCTED: '막힌 방:',
  EATER_IMPLICIT: /^세계 포식자 고정 속성 \((?<rank>.+)\)$/,
  EXARCH_IMPLICIT: /^작열의 총주교 고정 속성 \((?<rank>.+)\)$/,
  ELDRITCH_MOD_R1: '하급',
  ELDRITCH_MOD_R2: '상급',
  ELDRITCH_MOD_R3: '우수한',
  ELDRITCH_MOD_R4: '특출난',
  ELDRITCH_MOD_R5: '정교한',
  ELDRITCH_MOD_R6: '완벽한',
  // ---
  CHAT_SYSTEM: /^: (?<body>.+)$/,
  CHAT_TRADE: /^\$(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_GLOBAL: /^#(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_PARTY: /^%(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_GUILD: /^&(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_WHISPER_TO: /^@발신 (?<char_name>.+?): (?<body>.+)$/,
  CHAT_WHISPER_FROM: /^@수신 (?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_WEBTRADE_GEM: /^레벨 (?<gem_lvl>\d+) (?<gem_qual>\d+)% (?<gem_name>.+)$/
}
