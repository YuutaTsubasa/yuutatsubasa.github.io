import { loadPosts } from "$lib/utils/loadPosts";
import { tagColors } from "$lib/settings.json";
import { postsPerPage } from "$lib/settings.json";

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
    const posts = await loadPosts();
    const tags = Object.keys(tagColors);
    const entries = tags.flatMap(tag => {
        const postsForTag = posts.filter(post => post.tags.includes(tag));
        const totalPages = Math.ceil(postsForTag.length / postsPerPage);
        return Array.from({ length: totalPages }, (_, i) => ({ tag: encodeURIComponent(tag), page: (i + 1).toString() }));
    });
    return entries;
}

export const prerender = true;