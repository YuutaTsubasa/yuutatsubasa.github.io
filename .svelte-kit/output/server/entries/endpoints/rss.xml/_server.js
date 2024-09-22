import RSS from "rss";
import { l as loadPosts } from "../../../chunks/loadPosts.js";
const prerender = true;
async function GET() {
  const feed = new RSS({
    title: "悠太翼官方網站",
    description: "程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。",
    feed_url: "https://yuuta-tsubasa.studio/rss.xml",
    site_url: "https://yuuta-tsubasa.studio",
    image_url: "https://yuuta-tsubasa.studio/favicon.ico",
    language: "zh-TW"
  });
  const posts = await loadPosts();
  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: `<p><img src="https://yuuta-tsubasa.studio${post.thumbnail}" alt="${post.title}"></p><p>${post.content}</p>`,
      url: `https://yuuta-tsubasa.studio/post/${post.filename}`,
      author: `${post.author}`,
      date: post.date
    });
  });
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
export {
  GET,
  prerender
};
