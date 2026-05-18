import yaml from 'js-yaml';

// LOG：作品（project）、心得（review）、解題（solve）、講義（workshop）。
// 來源：src/posts/log_*.md，frontmatter 內 category 區分類型。
// frontmatter 內可加 `streams: [908, 910]` 串接對應的 ARCHIVE 場次。

const files = import.meta.glob('/src/posts/log_*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

function splitFrontmatter(raw) {
  const m = raw.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
  if (!m) return { meta: {}, body: raw };
  return { meta: yaml.load(m[1]) ?? {}, body: raw.slice(m[0].length) };
}

const ENTRIES = Object.entries(files).map(([path, raw]) => {
  const { meta, body } = splitFrontmatter(raw);
  const filename = path.split('/').pop().replace('.md', '');
  const slug = (meta.slug ?? filename.replace(/^log_/, '')).trim();

  return {
    id: filename,
    slug,
    category: meta.category ?? 'project',
    title: meta.title ?? slug,
    date: (meta.date ?? '').replace(/-/g, '.'),
    time: meta.time ?? '',
    thumbnail: meta.thumbnail ?? null,
    excerpt: meta.excerpt ?? '',
    tags: meta.tags ?? [],
    stack: meta.stack ?? [],
    links: meta.links ?? [],
    streams: Array.isArray(meta.streams) ? meta.streams.map((v) => Number(v)).filter(Number.isFinite) : [],
    meta: meta.meta ?? {},
    bodyRaw: body.trim()
  };
});

// 由舊到新排好給 caseNum 使用，再 reverse 給顯示用
const ORDERED_OLD_TO_NEW = [...ENTRIES].sort((a, b) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0
);
const CASE_NUM_BY_ID = new Map();
ORDERED_OLD_TO_NEW.forEach((e, i) => CASE_NUM_BY_ID.set(e.id, i + 1));

export const LOG_ENTRIES = ENTRIES
  .map((e) => ({ ...e, caseNum: CASE_NUM_BY_ID.get(e.id) }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const LOG_CATEGORIES = [
  { id: 'project',  enLabel: 'PROJECT',  label: '作品', color: '#22D3EE', glyph: '▣' },
  { id: 'review',   enLabel: 'REVIEW',   label: '心得', color: '#F472B6', glyph: '★' },
  { id: 'solve',    enLabel: 'SOLVE',    label: '解題', color: '#A78BFA', glyph: '◆' },
  { id: 'workshop', enLabel: 'WORKSHOP', label: '講義', color: '#FBBF24', glyph: '📘' }
];

// LOG_TYPES：以 enLabel 為 key，方便 terminal-row 用
export const LOG_TYPES = Object.fromEntries(
  LOG_CATEGORIES.map((c) => [c.enLabel, { color: c.color, label: c.label, glyph: c.glyph, id: c.id }])
);

export function findLogCategory(id) {
  return LOG_CATEGORIES.find((c) => c.id === id);
}

export function findLog(slug) {
  return LOG_ENTRIES.find((e) => e.slug === slug);
}

export function findLogsByStream(vol) {
  if (vol == null) return [];
  return LOG_ENTRIES.filter((e) => e.streams?.includes(Number(vol)));
}

// Tag 索引：tags + stack（去重），用於 tag cloud / 篩選 / 搜尋。
// Stack 仍然在內頁 meta grid 獨立顯示為「技術組成」，這裡只是把它一併視為可篩選的關鍵字。
export function allTagsFor(entry) {
  const seen = new Set();
  const out = [];
  for (const t of [...(entry.tags || []), ...(entry.stack || [])]) {
    if (!t) continue;
    const key = String(t).trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

// 取得 entry 在 terminal-row 顯示用的 meta bits（最多 3 個）
export function logMetaBits(entry) {
  const bits = [];
  const m = entry.meta || {};
  if (entry.category === 'solve') {
    if (m.difficulty) bits.push(m.difficulty);
    if (m.lang) bits.push(m.lang);
    if (m.runtime) bits.push(m.runtime);
  } else if (entry.category === 'review') {
    if (m.rating) bits.push(m.rating);
    if (m.platform) bits.push(m.platform);
    if (m.hours) bits.push(m.hours);
  } else {
    // project
    if (m.status) bits.push(m.status);
    if (m.phase) bits.push(m.phase);
    if (entry.stack?.length) bits.push(entry.stack.slice(0, 2).join('/'));
  }
  return bits.slice(0, 3);
}
