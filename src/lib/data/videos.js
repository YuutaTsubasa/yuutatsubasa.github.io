import yaml from 'js-yaml';
import { marked } from 'marked';
import { STREAM_TAGS } from './streamTags.js';

// ARCHIVE 額外標籤：COVER（歌曲翻唱影片）。
// Archive 用英文標籤（enLabel）顯示，色票延用 STREAM_TAGS 的調性。
export const VIDEO_TAGS = [
  ...STREAM_TAGS,
  { id: 'cover', label: 'Cover', enLabel: 'COVER', color: '#D946EF' } // 洋紅
];

// markdown 內 tag 字串 → 我們的 tag id
const TAG_MAP = {
  歌回實況: 'karaoke',
  雜談實況: 'chat',
  遊戲實況: 'game',
  程式實況: 'code',
  繪圖實況: 'art',
  '3D實況': '3d',
  音樂實況: 'music',
  Cover: 'cover'
  // 「活動合作」「直播影片」這類分類性 tag 不歸到任何 stream tag
};

// build-time 讀取 src/posts/streaming_*.md
const files = import.meta.glob('/src/posts/streaming_*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

function splitFrontmatter(raw) {
  const m = raw.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
  if (!m) return { meta: {}, body: raw };
  return { meta: yaml.load(m[1]) ?? {}, body: raw.slice(m[0].length) };
}

function extractYouTubeId(body) {
  const m = body.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function extractChapters(body) {
  // 「## 🛡️時間軸🛡️」之後的條列項目：- HH:MM:SS 名稱
  const out = [];
  const lines = body.split(/\r?\n/);
  let inTimeline = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/時間軸/.test(line) && line.startsWith('##')) {
      inTimeline = true;
      continue;
    }
    if (inTimeline) {
      if (line.startsWith('##')) break; // 下一個段落
      const m = line.match(/^[-*]\s*(\d{1,2}:\d{2}:\d{2})\s+(.+?)\s*$/);
      if (m) out.push({ time: m[1], label: m[2] });
    }
  }
  return out;
}

function extractSourceUrl(body, vol) {
  // 先找 yutaii.run/v/N，找不到再 fallback 到 yutaii.run/v/{vol}
  const m = body.match(/https?:\/\/yutaii\.run\/v\/\d+/);
  if (m) return m[0];
  if (vol != null) return `https://yutaii.run/v/${vol}`;
  return null;
}

function cleanTitle(raw) {
  // 拿掉開頭的「【#xxx】」或「【#xxx/#yyy】」前綴
  return (raw ?? '').replace(/^【[^】]+】\s*/, '').trim();
}

function padDur(t) {
  return /^\d:/.test(t) ? `0${t}` : t;
}

function cleanBodyForDisplay(body) {
  // 拿掉內嵌 iframe（影片用我們自己的 player）
  let s = body.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  // 拿掉「## ...時間軸...」整段（chapters 已單獨顯示）
  s = s.replace(/##[^\n]*時間軸[^\n]*\n([\s\S]*?)(?=\n##|\s*$)/g, '');
  return s.trim();
}

export function timeToSeconds(t) {
  const parts = (t ?? '').split(':').map((n) => parseInt(n, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

const ENTRIES = Object.entries(files).map(([path, raw]) => {
  const { meta, body } = splitFrontmatter(raw);
  const filename = path.split('/').pop().replace('.md', '');
  const volMatch = filename.match(/streaming_(\d+)/);
  const vol = volMatch ? parseInt(volMatch[1], 10) : null;
  const chapters = extractChapters(body);
  const lastChapter = chapters[chapters.length - 1];
  const youtubeId = extractYouTubeId(body);
  const tags = (meta.tags ?? []).map((t) => TAG_MAP[t]).filter(Boolean);

  return {
    id: vol != null ? `v${vol}` : filename,
    vol,
    slug: vol != null ? String(vol) : filename,
    title: cleanTitle(meta.title),
    rawTitle: meta.title ?? '',
    author: meta.author,
    date: (meta.date ?? '').replace(/-/g, '.'),
    thumbnail: meta.thumbnail,
    excerpt: meta.excerpt,
    tags,
    duration: lastChapter ? padDur(lastChapter.time) : null,
    youtubeId,
    chapters,
    sourceUrl: extractSourceUrl(body, vol),
    bodyHtml: marked.parse(cleanBodyForDisplay(body))
  };
});

export const VIDEOS = ENTRIES.sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
);

// 篩選 tab 用：第一項 ALL 是「全部」
export const VIDEO_FILTERS = [
  { id: 'all', enLabel: 'ALL' },
  ...VIDEO_TAGS.map((t) => ({ id: t.id, enLabel: t.enLabel }))
];

export function findVideo(slug) {
  return VIDEOS.find((v) => v.slug === slug);
}
