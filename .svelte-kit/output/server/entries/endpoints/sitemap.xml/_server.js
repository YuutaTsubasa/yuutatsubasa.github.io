import { SitemapStream, streamToPromise } from "sitemap";
import { l as loadPosts } from "../../../chunks/loadPosts.js";
const prerender = true;
async function GET() {
  const sitemap = new SitemapStream({ hostname: "https://yuuta-tsubasa.studio" });
  const posts = await loadPosts();
  sitemap.write({
    url: "/",
    changefreq: "weekly",
    priority: 1
  });
  sitemap.write({
    url: "/about",
    changefreq: "weekly",
    priority: 0.8
  });
  sitemap.write({
    url: "/posts",
    changefreq: "weekly",
    priority: 0.8
  });
  sitemap.write({
    url: "/rss.xml",
    changefreq: "weekly",
    priority: 0.8
  });
  posts.forEach((post) => {
    sitemap.write({
      url: `/posts/${post.filename}`,
      changefreq: "weekly",
      priority: 0.8
    });
  });
  sitemap.end();
  const sitemapOutput = await streamToPromise(sitemap);
  return new Response(sitemapOutput, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
export {
  GET,
  prerender
};
