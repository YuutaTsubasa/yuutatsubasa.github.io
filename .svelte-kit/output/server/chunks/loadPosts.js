import { marked } from "marked";
import yaml from "js-yaml";
async function loadPosts() {
  const postFiles = /* @__PURE__ */ Object.assign({ "/src/posts/fan_drawing_01.md": () => import("./fan_drawing_01.js").then((m) => m["default"]), "/src/posts/fan_drawing_02.md": () => import("./fan_drawing_02.js").then((m) => m["default"]), "/src/posts/fan_drawing_03.md": () => import("./fan_drawing_03.js").then((m) => m["default"]), "/src/posts/fan_drawing_04.md": () => import("./fan_drawing_04.js").then((m) => m["default"]), "/src/posts/fan_drawing_05.md": () => import("./fan_drawing_05.js").then((m) => m["default"]), "/src/posts/quick_scheduler_tool.md": () => import("./quick_scheduler_tool.js").then((m) => m["default"]), "/src/posts/streaming_0000.md": () => import("./streaming_0000.js").then((m) => m["default"]), "/src/posts/streaming_0001.md": () => import("./streaming_0001.js").then((m) => m["default"]) });
  let allPosts = [];
  for (const path in postFiles) {
    const postContent = await postFiles[path]();
    const yamlMatch = postContent.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
    let frontMatter = {};
    let markdownContent = postContent;
    if (yamlMatch) {
      frontMatter = yaml.load(yamlMatch[1]);
      markdownContent = postContent.slice(yamlMatch[0].length);
    }
    const parsedContent = marked(markdownContent);
    const filename = path.split("/").pop().replace(".md", "");
    allPosts.push({
      title: frontMatter.title,
      date: new Date(frontMatter.date),
      author: frontMatter.author,
      thumbnail: frontMatter.thumbnail,
      tags: frontMatter.tags || [],
      excerpt: frontMatter.excerpt || parsedContent.slice(0, 100) + "...",
      content: parsedContent,
      filename
    });
  }
  return allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
}
export {
  loadPosts as l
};
