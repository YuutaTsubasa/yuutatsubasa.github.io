import { l as loadPosts } from "../../chunks/loadPosts.js";
async function load({ fetch }) {
  const allPosts = await loadPosts();
  const latestPosts = allPosts.slice(0, 3);
  return { latestPosts };
}
export {
  load
};
