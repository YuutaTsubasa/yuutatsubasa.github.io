import { loadPosts } from "$lib/utils/loadPosts";
import { tagColors } from "$lib/settings";
import { postsPerPage } from "$lib/settings";

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

export async function load({ params }) {
    const posts = await loadPosts();
    const tag = decodeURIComponent(params.tag);
    const page = parseInt(params.page);
    const postsForTag = posts.filter(post => post.tags.includes(tag));
    const totalPages = Math.ceil(postsForTag.length / postsPerPage);
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const paginatedPosts = postsForTag.slice(start, end);
    return { tag, posts: paginatedPosts, totalPages };
}

export const prerender = true;