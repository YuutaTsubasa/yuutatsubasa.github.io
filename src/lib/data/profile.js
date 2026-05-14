export const PROFILE = {
  // Identity
  name_zh: '悠太翼',
  name_en: 'YUUTA TSUBASA',
  name_kana: 'ゆうた つばさ',
  callsign: 'VTUBER',

  // 用於 IDENTITY CARD：上方日文標音 / 右側注音（直書 + CSS 畫聲調符號）/ 下方拼音
  // tone: 1=陰平(無號), 2=陽平, 3=上聲, 4=去聲, 5=輕聲
  name_breakdown: [
    { cjk: '悠', kana: 'ゆう',   bopo: 'ㄧㄡ', tone: 1, pinyin: 'yōu' },
    { cjk: '太', kana: 'た',     bopo: 'ㄊㄞ', tone: 4, pinyin: 'tài' },
    { cjk: '翼', kana: 'つばさ', bopo: 'ㄧ',   tone: 4, pinyin: 'yì'  }
  ],

  // VTuber profile (Hero 身份卡)
  debut: '2021.07.31',
  origin: 'TAIWAN',
  language: 'TRADITIONAL CHINESE',
  content: 'CODING · GAMEPLAY · SINGING · TALKING · OTHERS',
  agency: 'ULTIMATE-UTOPIA',
  platform: 'YOUTUBE · TWITCH',
  fanbase: 'TSUBASA-FRIEND',

  // 物理資料
  birth: '07.17',

  bio: [
    '大家好，我是悠太翼。以中文直播為主的台灣 VTuber，隸屬於【終焉理想庭】，2021 年 7 月至今。',
    '想到什麼就分享什麼——寫程式、跑 Sonic、推音遊、唱歌或是千奇百怪的日常，把好奇心一同帶上直播。'
  ],
  likes: ['音速小子索尼克', 'C#', 'Svelte', '音樂遊戲', '唱歌'],
  dislikes: ['傳奇競賽', '芋頭', '沒錢的時候', '1 MISS']
};
