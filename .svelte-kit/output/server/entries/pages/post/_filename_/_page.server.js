import { l as loadPosts } from "../../../../chunks/loadPosts.js";
async function entries() {
  const posts = await loadPosts();
  return posts.map((post) => ({ filename: post.filename }));
}
const prerender = true;
export {
  entries,
  prerender
};
