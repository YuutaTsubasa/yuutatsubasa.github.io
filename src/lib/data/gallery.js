import yaml from 'js-yaml';

// build-time 將 src/posts/fan_drawing_*.md 的 frontmatter 撈出來。
// 圖片路徑、繪師、日期都來自 markdown 的 YAML 區塊。
const files = import.meta.glob('/src/posts/fan_drawing_*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

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
  const numMatch = filename.match(/fan_drawing_(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : null;
  const extras = extractImages(body);
  return {
    id: filename,
    slug: num != null ? String(num) : filename,
    num,
    artist: meta.author,
    title: meta.title,
    date: (meta.date ?? '').replace(/-/g, '.'),
    thumbnail: meta.thumbnail,
    extras,
    excerpt: meta.excerpt,
    sourceUrl: extractSourceUrl(body),
    bodyRaw: body
  };
});

export const GALLERY = ENTRIES
  .filter((g) => g.thumbnail)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function findGallery(slug) {
  return GALLERY.find((g) => g.slug === slug);
}
