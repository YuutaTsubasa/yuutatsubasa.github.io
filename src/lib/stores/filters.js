import { writable } from 'svelte/store';

// 跨 navigation 保留 Filter 狀態（從詳情頁退回時 filter 不會消失）。
// 重新整理才會 reset 到 'all'。
export const archivePageFilter   = writable('all'); // /archive list - tag
export const archiveHomeFilter   = writable('all'); // 首頁 Archive 區 - tag
export const galleryPageYear     = writable('all'); // /gallery list - year
export const logFilter           = writable('all'); // /log + 首頁 Log 區 - category
