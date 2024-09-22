import { loadPosts } from "$lib/utils/loadPosts";
import { marked } from 'marked';
import yaml from 'js-yaml';

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
    const posts = await loadPosts();
    return posts.map(post => ({ filename: post.filename }));
}

export async function load({ params }) {
    // 加載對應文件名的文章
    const postFiles = import.meta.glob('/src/posts/*.md', { query: '?raw', import: 'default' });
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
        thumbnail: frontMatter.thumbnail, // 文章的縮圖
        excerpt: frontMatter.excerpt,
        content: parsedContent,
      };
    }
    return { filename: params.filename, post };
}

export const prerender = true;