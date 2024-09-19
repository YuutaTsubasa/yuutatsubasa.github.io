import * as universal from '../entries/pages/posts/_page_/_page.js';
import * as server from '../entries/pages/posts/_page_/_page.server.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/_page_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/posts/[page]/+page.js";
export { server };
export const server_id = "src/routes/posts/[page]/+page.server.js";
export const imports = ["_app/immutable/nodes/10.C1TGK6Qw.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js","_app/immutable/chunks/Posts.DTNezQrl.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/Tag.WXGIjayf.js","_app/immutable/chunks/PostCard.D_fHBuFr.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js"];
export const stylesheets = ["_app/immutable/assets/Tag.CDHLiHnV.css"];
export const fonts = [];
