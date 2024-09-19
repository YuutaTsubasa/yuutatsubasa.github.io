import { marked } from 'marked';
import yaml from 'js-yaml';

export async function loadPosts() {
  const postFiles = import.meta.glob('/src/posts/*.md', { query: '?raw', import: 'default' });
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
    const filename = path.split('/').pop().replace('.md', '');

    allPosts.push({
      title: frontMatter.title,
      date: new Date(frontMatter.date),
      author: frontMatter.author,
      thumbnail: frontMatter.thumbnail,
      tags: frontMatter.tags || [],
      excerpt: frontMatter.excerpt || parsedContent.slice(0, 100) + '...',
      content: parsedContent,
      filename: filename
    });
  }

  // 按照發佈日期排序文章
  return allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
}