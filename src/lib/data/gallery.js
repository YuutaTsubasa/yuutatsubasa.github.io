import yaml from 'js-yaml';

// build-time 將 src/posts/{fan_drawing,self_drawing,commission,skeb}_*.md 全部撈出來
// 新檔名格式：{category}_{YYYY-MM-DD}[_{hash4}].md，編號不再依檔名固定，由排序位置算
const files = import.meta.glob(
  [
    '/src/posts/fan_drawing_*.md',
    '/src/posts/self_drawing_*.md',
    '/src/posts/commission_*.md',
    '/src/posts/skeb_*.md'
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true
  }
);

// 分類定義（順序就是 UI 上的 chip 排列）
export const GALLERY_CATEGORIES = [
  { id: 'fan',        label: '悠然翼繪', enLabel: 'FAN',        color: '#F472B6' },
  { id: 'self',       label: '個人繪',   enLabel: 'SELF',       color: '#60A5FA' },
  { id: 'commission', label: '委託繪',   enLabel: 'COMMISSION', color: '#A78BFA' },
  { id: 'skeb',       label: 'Skeb',     enLabel: 'SKEB',       color: '#22D3EE' }
];

export function findGalleryCategory(id) {
  return GALLERY_CATEGORIES.find((c) => c.id === id);
}

const PREFIX_MAP = [
  { prefix: 'fan_drawing_',  category: 'fan' },
  { prefix: 'self_drawing_', category: 'self' },
  { prefix: 'commission_',   category: 'commission' },
  { prefix: 'skeb_',         category: 'skeb' }
];

function derivePrefixMatch(filename) {
  return PREFIX_MAP.find((p) => filename.startsWith(p.prefix));
}

function splitFrontmatter(raw) {
  const m = raw.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
  if (!m) return { meta: {}, body: raw };
  return { meta: yaml.load(m[1]) ?? {}, body: raw.slice(m[0].length) };
}

function extractSourceUrl(body) {
  const m = body.match(/https?:\/\/[^\s)\]]+/);
  return m ? m[0] : null;
}

function extractImages(body) {
  const out = [];
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(body)) !== null) out.push(m[1]);
  return out;
}

// filename → URL-safe slug：底線轉連字號
function filenameToSlug(filename) {
  return filename.replace(/_/g, '-');
}

// /images/posts/X.webp → /images/posts/thumbs/X.webp（build 時生成的縮圖）
// /images/posts/X.gif  → /images/posts/thumbs/X.webp（thumb 一律 webp）
// 其他路徑（例如 /images/yuuta-figure-1-1920.webp）回原圖
function thumbFor(thumbnail) {
  if (!thumbnail) return null;
  if (!thumbnail.startsWith('/images/posts/')) return thumbnail;
  return thumbnail
    .replace('/images/posts/', '/images/posts/thumbs/')
    .replace(/\.[^./]+$/, '.webp');
}

const ENTRIES = Object.entries(files).map(([path, raw]) => {
  const { meta, body } = splitFrontmatter(raw);
  const filename = path.split('/').pop().replace('.md', '');
  const prefix = derivePrefixMatch(filename);
  const category = meta.category || prefix?.category || 'fan';
  const slug = filenameToSlug(filename);
  const extras = extractImages(body);
  const streams = Array.isArray(meta.streams)
    ? meta.streams.map((v) => Number(v)).filter(Number.isFinite)
    : [];
  return {
    id: filename,
    slug,
    category,
    artist: meta.author,
    title: meta.title,
    date: (meta.date ?? '').replace(/-/g, '.'),
    thumbnail: meta.thumbnail,
    thumb: thumbFor(meta.thumbnail),
    extras,
    excerpt: meta.excerpt,
    sourceUrl: extractSourceUrl(body),
    pixivUrl: meta.pixivUrl ?? null,
    streams,
    bodyRaw: body
  };
});

// 排序：新到舊
const SORTED = ENTRIES
  .filter((g) => g.thumbnail)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// num 純裝飾：oldest = #1，由 GALLERY 全長扣減而得。新增舊圖時整體編號會自動 reflow
const TOTAL = SORTED.length;
SORTED.forEach((g, i) => { g.num = TOTAL - i; });

export const GALLERY = SORTED;

export function findGallery(slug) {
  return GALLERY.find((g) => g.slug === slug);
}
