import { loadPosts } from "$lib/utils/loadPosts";

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
    const posts = await loadPosts();
    return posts.map(post => ({ filename: post.filename }));
}

export const prerender = true;