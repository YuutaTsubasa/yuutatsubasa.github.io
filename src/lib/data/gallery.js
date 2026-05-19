import yaml from 'js-yaml';

// build-time 將 src/posts/{fan_drawing,self_drawing,commission,skeb}_*.md 全部撈出來
// 圖片路徑、繪師、日期、分類等資料都來自 markdown 的 YAML frontmatter
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
  { prefix: 'fan_drawing_',  category: 'fan',        slugPrefix: '' },
  { prefix: 'self_drawing_', category: 'self',       slugPrefix: 'self-' },
  { prefix: 'commission_',   category: 'commission', slugPrefix: 'commission-' },
  { prefix: 'skeb_',         category: 'skeb',       slugPrefix: 'skeb-' }
];

function derivePrefixMatch(filename) {
  return PREFIX_MAP.find((p) => filename.startsWith(p.prefix));
}

function splitFrontmatter(raw) {
  const m = raw.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
  if (!m) return { meta: {}, body: raw };
  return { meta: yaml.load(m[1]) ?? {}, body: raw.slice(m[0].length) };
}

// 從 markdown 內文撈第一個外部連結（多為原推文 / Twitter）
function extractSourceUrl(body) {
  const m = body.match(/https?:\/\/[^\s)\]]+/);
  return m ? m[0] : null;
}

// 從 markdown 撈所有 ![](url) 的圖片
function extractImages(body) {
  const out = [];
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(body)) !== null) out.push(m[1]);
  return out;
}

const ENTRIES = Object.entries(files).map(([path, raw]) => {
  const { meta, body } = splitFrontmatter(raw);
  const filename = path.split('/').pop().replace('.md', '');
  const prefix = derivePrefixMatch(filename);
  const category = meta.category || prefix?.category || 'fan';
  const numMatch = prefix ? filename.slice(prefix.prefix.length).match(/^(\d+)/) : null;
  const num = numMatch ? parseInt(numMatch[1], 10) : null;
  const slugPrefix = prefix?.slugPrefix ?? '';
  const slug = num != null ? `${slugPrefix}${num}` : filename;
  const extras = extractImages(body);
  const streams = Array.isArray(meta.streams)
    ? meta.streams.map((v) => Number(v)).filter(Number.isFinite)
    : [];
  return {
    id: filename,
    slug,
    num,
    category,
    artist: meta.author,
    title: meta.title,
    date: (meta.date ?? '').replace(/-/g, '.'),
    thumbnail: meta.thumbnail,
    extras,
    excerpt: meta.excerpt,
    sourceUrl: extractSourceUrl(body),
    pixivUrl: meta.pixivUrl ?? null,
    streams,
    bodyRaw: body
  };
});

export const GALLERY = ENTRIES
  .filter((g) => g.thumbnail)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function findGallery(slug) {
  return GALLERY.find((g) => g.slug === slug);
}
