import { l as loadPosts } from "../../../../chunks/loadPosts.js";
import { marked } from "marked";
import yaml from "js-yaml";
async function entries() {
  const posts = await loadPosts();
  return posts.map((post) => ({ filename: post.filename }));
}
async function load({ params }) {
  const postFiles = /* @__PURE__ */ Object.assign({ "/src/posts/fan_drawing_01.md": () => import("../../../../chunks/fan_drawing_01.js").then((m) => m["default"]), "/src/posts/fan_drawing_02.md": () => import("../../../../chunks/fan_drawing_02.js").then((m) => m["default"]), "/src/posts/fan_drawing_03.md": () => import("../../../../chunks/fan_drawing_03.js").then((m) => m["default"]), "/src/posts/fan_drawing_04.md": () => import("../../../../chunks/fan_drawing_04.js").then((m) => m["default"]), "/src/posts/fan_drawing_05.md": () => import("../../../../chunks/fan_drawing_05.js").then((m) => m["default"]), "/src/posts/quick_scheduler_tool.md": () => import("../../../../chunks/quick_scheduler_tool.js").then((m) => m["default"]), "/src/posts/streaming_0000.md": () => import("../../../../chunks/streaming_0000.js").then((m) => m["default"]), "/src/posts/streaming_0001.md": () => import("../../../../chunks/streaming_0001.js").then((m) => m["default"]) });
  const path = `/src/posts/${params.filename}.md`;
  let post = null;
  if (postFiles[path]) {
    const postContent = await postFiles[path]();
    const yamlMatch = postContent.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
    let frontMatter = {};
    let markdownContent = postContent;
    if (yamlMatch) {
      frontMatter = yaml.load(yamlMatch[1]);
      markdownContent = postContent.slice(yamlMatch[0].length);
    }
    const parsedContent = marked(markdownContent);
    post = {
      title: frontMatter.title,
      date: new Date(frontMatter.date),
      author: frontMatter.author,
      tags: frontMatter.tags,
      thumbnail: frontMatter.thumbnail,
      // 文章的縮圖
      content: parsedContent
    };
  }
  return { filename: params.filename, post };
}
const prerender = true;
export {
  entries,
  load,
  prerender
};
