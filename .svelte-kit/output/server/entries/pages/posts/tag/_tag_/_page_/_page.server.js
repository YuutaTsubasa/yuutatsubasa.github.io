import { l as loadPosts } from "../../../../../../chunks/loadPosts.js";
import { p as postsPerPage, t as tagColors } from "../../../../../../chunks/settings.js";
async function entries() {
  const posts = await loadPosts();
  const tags = Object.keys(tagColors);
  const entries2 = tags.flatMap((tag) => {
    const postsForTag = posts.filter((post) => post.tags.includes(tag));
    const totalPages = Math.ceil(postsForTag.length / postsPerPage);
    return Array.from({ length: totalPages }, (_, i) => ({ tag: encodeURIComponent(tag), page: (i + 1).toString() }));
  });
  return entries2;
}
async function load({ params }) {
  const posts = await loadPosts();
  const tag = decodeURIComponent(params.tag);
  const page = parseInt(params.page);
  const postsForTag = posts.filter((post) => post.tags.includes(tag));
  const totalPages = Math.ceil(postsForTag.length / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const paginatedPosts = postsForTag.slice(start, end);
  return { tag, posts: paginatedPosts, totalPages };
}
const prerender = true;
export {
  entries,
  load,
  prerender
};
