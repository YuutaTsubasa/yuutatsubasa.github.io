import * as server from '../entries/pages/posts/tag/_tag_/_page_/_page.server.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/tag/_tag_/_page_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/posts/tag/[tag]/[page]/+page.server.js";
export const imports = ["_app/immutable/nodes/12.CiLMsNmm.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js","_app/immutable/chunks/Posts.DWULY4yx.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/PostCard.Dtb5_SwH.js","_app/immutable/chunks/Tag.CbePeNuM.js"];
export const stylesheets = ["_app/immutable/assets/Tag.BD3mTWjG.css"];
export const fonts = [];
