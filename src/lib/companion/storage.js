// 陪伴模式的設定與待辦存在瀏覽器 localStorage；無痕模式或被封鎖時就只存在記憶體裡。
const PREFIX = 'companion:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}
