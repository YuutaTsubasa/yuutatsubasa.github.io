import { loadPosts } from "$lib/utils/loadPosts";
import { postsPerPage } from "$lib/settings";

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
    const posts = await loadPosts();
    const totalPages = Math.ceil(posts.length / postsPerPage);
    return Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));
}

export async function load({ params }) {
    const posts = await loadPosts();
    const page = parseInt(params.page);
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const paginatedPosts = posts.slice(start, end);
    return { posts: paginatedPosts, totalPages, page };
}

export const prerender = true;