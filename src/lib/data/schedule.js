// 直播排程資料來源。
//
// 填寫規則：
//   - id              : 該場唯一識別碼（隨意命名）
//   - startsAt        : 開播時間，ISO 格式含時區（建議用 +08:00 Taiwan）
//   - durationMinutes : 預計時長（分鐘）。網站會用「開始 ~ 開始+時長」判斷是否 LIVE
//   - title           : 直播標題
//   - platforms       : 字串陣列，例 ['YouTube', 'Twitch']（同步雙播時就兩個都填）
//   - tags            : 字串陣列，對應 streamTags.js 的 id；可同時掛多個
//                       例如 'game'、'code'、'karaoke'、'chat'、'art'、'3d'、'music'
//   - url             : 直播間連結（LIVE 時點 GO TO STREAM、上播前點 SET REMINDER 都連到這）
//   - archiveId       : （選填）對應 ARCHIVE section 的影片 id，之後可以做「直播結束後跳轉影片頁」
//   - tbd             : （選填）true 表示時間未定，網站顯示 'TBD' 取代具體時間；platforms/tags 可留空陣列
//
// 網站會自動：
//   - 抓「現在」所在那週（週一到週日）的場次排上 Schedule
//   - 對每場比對現在時間 → live / upcoming / past
//   - Hero 的 LIVE pill 也自動更新
//
// 過往的直播保留在這裡也沒關係，網站只會撈當週的。
export const SCHEDULE = [
  { id: 'v908',      startsAt: '2026-05-11T23:00:00+08:00', durationMinutes: 90, title: '索尼克 英雄 Sonic Heroes #1', platforms: ['YouTube', 'Twitch'], tags: ['game'], url: 'https://yutaii.run/v/908' },
  // 週二~週五 05-12~05-15 休息日（不放任何場次）
  { id: 'tbd-0516',  startsAt: '2026-05-16T23:00:00+08:00', durationMinutes: 90, title: '未定',                        platforms: [],                    tags: [],       url: null, tbd: true }
  // 週日 05-17 休息日
];
