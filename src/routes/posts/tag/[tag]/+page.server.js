import { tagColors } from "$lib/settings.json";

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return Object.keys(tagColors).map(tag => ({ tag: encodeURIComponent(tag) }));
}

export const prerender = true;