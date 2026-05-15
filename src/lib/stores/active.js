import { writable } from 'svelte/store';

export const activeSection = writable('hero');

// 手動點 nav 後，鎖住「以視口決定 active」一段時間，避免 smooth scroll 經過時
// 把 active 改成中途 section、又改回目標 section 造成 indicator 抖動。
let manualLockUntil = 0;

export function gotoSection(id) {
  if (typeof document === 'undefined') return;
  activeSection.set(id);
  manualLockUntil = Date.now() + 1200;
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
  }
}

// 給 +page.svelte 的 scroll handler 用：若處於 manual lock 期間就不覆寫
export function setActiveFromScroll(id) {
  if (Date.now() < manualLockUntil) return;
  activeSection.set(id);
}
