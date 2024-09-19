import * as server from '../entries/pages/posts/tag/_tag_/_page_/_page.server.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/tag/_tag_/_page_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/posts/tag/[tag]/[page]/+page.server.js";
export const imports = ["_app/immutable/nodes/13.DQkwYshZ.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js","_app/immutable/chunks/Posts.DTNezQrl.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/Tag.WXGIjayf.js","_app/immutable/chunks/PostCard.D_fHBuFr.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js"];
export const stylesheets = ["_app/immutable/assets/Tag.CDHLiHnV.css"];
export const fonts = [];
