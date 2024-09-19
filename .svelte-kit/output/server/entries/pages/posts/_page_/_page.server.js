import { l as loadPosts } from "../../../../chunks/loadPosts.js";
import { p as postsPerPage } from "../../../../chunks/settings.js";
async function entries() {
  const posts = await loadPosts();
  const totalPages = Math.ceil(posts.length / postsPerPage);
  return Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));
}
const prerender = true;
export {
  entries,
  prerender
};
