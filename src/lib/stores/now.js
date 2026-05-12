import { readable } from 'svelte/store';

// 每分鐘更新一次的「現在」。Schedule / Hero 等需要依時間更新狀態的元件 subscribe 這個。
export const now = readable(new Date(), (set) => {
  set(new Date());
  const interval = setInterval(() => set(new Date()), 60000);
  return () => clearInterval(interval);
});
