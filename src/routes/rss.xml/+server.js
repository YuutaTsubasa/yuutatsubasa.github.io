import RSS from 'rss';
import { VIDEOS } from '$lib/data/videos.js';
import { GALLERY } from '$lib/data/gallery.js';
import { LOG_ENTRIES, findLogCategory } from '$lib/data/log.js';

export const prerender = true;

const SITE = 'https://yuuta-tsubasa.studio';

// "YYYY.MM.DD" → Date
function toDate(d) {
  if (!d) return new Date(0);
  return new Date(d.replace(/\./g, '-'));
}

export async function GET() {
  const feed = new RSS({
    title: '悠太翼官方網站',
    description: '程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。',
    feed_url: `${SITE}/rss.xml`,
    site_url: SITE,
    image_url: `${SITE}/android-chrome-512x512.png`,
    language: 'zh-TW',
  });

  // Archive 直播回顧（新到舊）
  VIDEOS.forEach((v) => {
    const thumb = v.youtubeId
      ? `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`
      : (v.thumbnail ? `${SITE}${v.thumbnail}` : null);
    const desc = (thumb ? `<p><img src="${thumb}" alt="${v.title}"></p>` : '')
      + (v.excerpt ? `<p>${v.excerpt}</p>` : '');
    feed.item({
      title: `[ARCHIVE] ${v.title}`,
      description: desc,
      url: `${SITE}/archive/${v.slug}`,
      author: v.author || '悠太翼',
      date: toDate(v.date),
      categories: v.tags
    });
  });

  // LOG（作品 / 心得 / LeetCode 等）
  LOG_ENTRIES.forEach((e) => {
    const cat = findLogCategory(e.category);
    const img = e.thumbnail ? `${SITE}${e.thumbnail}` : null;
    const desc = (img ? `<p><img src="${img}" alt="${e.title}"></p>` : '')
      + (e.excerpt ? `<p>${e.excerpt}</p>` : '');
    feed.item({
      title: `[${cat?.enLabel ?? 'LOG'}] ${e.title}`,
      description: desc,
      url: `${SITE}/log/${e.slug}`,
      author: '悠太翼',
      date: toDate(e.date),
      categories: e.tags
    });
  });

  // Gallery 翼友作品（新到舊）
  GALLERY.forEach((g) => {
    const img = g.thumbnail?.startsWith('http') ? g.thumbnail : `${SITE}${g.thumbnail}`;
    const desc = `<p><img src="${img}" alt="${g.title}"></p>`
      + (g.excerpt ? `<p>${g.excerpt}</p>` : '')
      + (g.artist ? `<p>繪師：${g.artist}</p>` : '');
    feed.item({
      title: `[GALLERY] ${g.title}`,
      description: desc,
      url: `${SITE}/gallery/${g.slug}`,
      author: g.artist || '翼友',
      date: toDate(g.date)
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: { 'Content-Type': 'application/xml' }
  });
}
