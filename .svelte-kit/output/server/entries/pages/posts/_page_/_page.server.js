import { l as loadPosts } from "../../../../chunks/loadPosts.js";
import { p as postsPerPage } from "../../../../chunks/settings.js";
async function entries() {
  const posts = await loadPosts();
  const totalPages = Math.ceil(posts.length / postsPerPage);
  return Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));
}
async function load({ params }) {
  const posts = await loadPosts();
  const page = parseInt(params.page);
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const paginatedPosts = posts.slice(start, end);
  return { posts: paginatedPosts, totalPages, page };
}
const prerender = true;
export {
  entries,
  load,
  prerender
};
