// 直播排程資料來源。
//
// 填寫規則：
//   - id              : 該場唯一識別碼（隨意命名）
//   - startsAt        : 開播時間，ISO 格式含時區（建議用 +08:00 Taiwan）
//   - durationMinutes : 預計時長（分鐘）。網站會用「開始 ~ 開始+時長」判斷是否 LIVE
//   - title           : 直播標題
//   - platform        : 'YouTube' / 'Twitch'（顯示用，可自由填）
//   - tag             : 對應 streamTags.js 的 id（game / code / karaoke / chat / cover）
//   - url             : 直播間連結（LIVE 時點 GO TO STREAM、上播前點 SET REMINDER 都連到這）
//   - archiveId       : （選填）對應 ARCHIVE section 的影片 id，之後可以做「直播結束後跳轉影片頁」
//
// 網站會自動：
//   - 抓「現在」所在那週（週一到週日）的場次排上 Schedule
//   - 對每場比對現在時間 → live / upcoming / past
//   - Hero 的 LIVE pill 也自動更新
//
// 過往的直播保留在這裡也沒關係，網站只會撈當週的。
export const SCHEDULE = [
  { id: 's1', startsAt: '2026-05-11T21:00:00+08:00', durationMinutes: 180, title: '索尼克 SUPERSTARS 速通挑戰',     platform: 'Twitch',  tag: 'game',    url: 'https://twitch.tv/yuutatsubasa' },
  { id: 's2', startsAt: '2026-05-12T22:00:00+08:00', durationMinutes: 180, title: '深夜 Code Review：重構自己的網站', platform: 'Twitch',  tag: 'code',    url: 'https://twitch.tv/yuutatsubasa' },
  // 週三 05-13 休息日（不放任何場次即可）
  { id: 's3', startsAt: '2026-05-14T21:00:00+08:00', durationMinutes: 180, title: '音 Game 馬拉松（Project Sekai）',  platform: 'YouTube', tag: 'game',    url: 'https://www.youtube.com/@YuutaTsubasa/live' },
  { id: 's4', startsAt: '2026-05-15T22:30:00+08:00', durationMinutes: 180, title: '歌回・五月夜の星',                platform: 'YouTube', tag: 'karaoke', url: 'https://www.youtube.com/@YuutaTsubasa/live' },
  { id: 's5', startsAt: '2026-05-16T20:00:00+08:00', durationMinutes: 240, title: 'Sonic Frontiers 二週目',          platform: 'Twitch',  tag: 'game',    url: 'https://twitch.tv/yuutatsubasa' },
  { id: 's6', startsAt: '2026-05-17T19:00:00+08:00', durationMinutes: 120, title: '雜談・本週進度回顧',              platform: 'YouTube', tag: 'chat',    url: 'https://www.youtube.com/@YuutaTsubasa/live' }
];
