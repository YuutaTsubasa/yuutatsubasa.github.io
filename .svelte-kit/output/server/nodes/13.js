import * as server from '../entries/pages/posts/tag/_tag_/_page_/_page.server.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/tag/_tag_/_page_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/posts/tag/[tag]/[page]/+page.server.js";
export const imports = ["_app/immutable/nodes/13.DTWiAy8O.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js","_app/immutable/chunks/Posts.BFKCws_p.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/PostCard.C0T0PuIB.js","_app/immutable/chunks/Tag.DeDbgaLC.js"];
export const stylesheets = ["_app/immutable/assets/Tag.BD3mTWjG.css"];
export const fonts = [];