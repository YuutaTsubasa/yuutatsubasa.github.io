import { loadPosts } from '$lib/utils/loadPosts';

export async function load({ fetch }) {
  const allPosts = await loadPosts();
  const latestPosts = allPosts.slice(0, 3);
  return { latestPosts };
}