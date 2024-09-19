import { loadPosts } from "$lib/utils/loadPosts";
import { postsPerPage } from "$lib/settings.json";

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
    const posts = await loadPosts();
    const totalPages = Math.ceil(posts.length / postsPerPage);
    return Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));
}

export const prerender = true;