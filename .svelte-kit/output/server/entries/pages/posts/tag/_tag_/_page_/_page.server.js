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
const prerender = true;
export {
  entries,
  prerender
};
