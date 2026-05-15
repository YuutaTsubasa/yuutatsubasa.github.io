import { SitemapStream, streamToPromise } from 'sitemap';
import { loadPosts } from '$lib/utils/loadPosts';
import { VIDEOS } from '$lib/data/videos.js';
import { GALLERY } from '$lib/data/gallery.js';

export const prerender = true;

export async function GET() {
  const sitemap = new SitemapStream({ hostname: 'https://yuuta-tsubasa.studio' });

  // 主要頁面
  sitemap.write({ url: '/',        changefreq: 'weekly',  priority: 1.0 });
  sitemap.write({ url: '/archive', changefreq: 'weekly',  priority: 0.9 });
  sitemap.write({ url: '/gallery', changefreq: 'weekly',  priority: 0.9 });

  // RSS / 舊文章列表（過渡）
  sitemap.write({ url: '/rss.xml', changefreq: 'weekly',  priority: 0.5 });
  sitemap.write({ url: '/posts',   changefreq: 'monthly', priority: 0.4 });

  // Archive 詳情頁（直播回顧）
  VIDEOS.forEach((v) => {
    sitemap.write({
      url: `/archive/${v.slug}`,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: v.date ? v.date.replace(/\./g, '-') : undefined
    });
  });

  // Gallery 詳情頁（翼友作品）
  GALLERY.forEach((g) => {
    sitemap.write({
      url: `/gallery/${g.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: g.date ? g.date.replace(/\./g, '-') : undefined
    });
  });

  // 舊文章頁（保留收錄，避免之前的連結 404）
  const posts = await loadPosts();
  posts.forEach((post) => {
    sitemap.write({
      url: `/post/${post.filename}`,
      changefreq: 'monthly',
      priority: 0.4
    });
  });

  sitemap.end();
  const sitemapOutput = await streamToPromise(sitemap);

  return new Response(sitemapOutput, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
