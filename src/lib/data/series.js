// 系列：同一個遊戲或課程分好幾集的直播（ARCHIVE）與講義（LOG）。
// 文章 frontmatter 寫 `series: <id>` 和 `ep: <集數>`；id 要先登記在這裡。
// ARCHIVE 和 LOG 可以用同一個 id（例如 c-course），各自只在自己的清單裡找前後集。
export const SERIES = {
  'it-takes-two': { label: '雙人成行 It Takes Two' },
  'c-course': { label: '程式設計入門，以 C/C++ 語言為例' },
  'dankagu-pjsekai': { label: '東方ダンマクカグラ & プロジェクトセカイ' },
  'epic-seven': { label: '第七史詩 Epic Seven' },
  celeste: { label: 'Celeste' },
  'sonic-heroes': { label: '索尼克 英雄 Sonic Heroes' },
  'bluebolt-os': { label: '從零做一個作業系統，以 Rust 為例' }
};

// 讀 frontmatter 的 series / ep；沒登記的 id 或沒有集數直接讓 build 失敗，避免打錯字默默失效
export function parseSeries(meta, file) {
  if (meta.series == null) return { series: null, ep: null };
  const series = String(meta.series).trim();
  const ep = Number(meta.ep);
  if (!SERIES[series]) throw new Error(`${file}: unknown series "${series}" (add it to src/lib/data/series.js)`);
  if (!Number.isInteger(ep) || ep < 1) throw new Error(`${file}: series "${series}" needs a positive integer ep`);
  return { series, ep };
}

// 同系列的所有集數（依 ep 排序）與前後集；只有一集時回傳 null，頁面就不顯示
export function seriesNav(items, item) {
  if (!item?.series) return null;
  const eps = items.filter((e) => e.series === item.series).sort((a, b) => a.ep - b.ep);
  if (eps.length < 2) return null;
  const i = eps.indexOf(item);
  return {
    id: item.series,
    label: SERIES[item.series].label,
    eps,
    index: i,
    prev: eps[i - 1] ?? null,
    next: eps[i + 1] ?? null
  };
}
