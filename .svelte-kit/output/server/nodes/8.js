import * as server from '../entries/pages/post/_filename_/_page.server.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/post/_filename_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/post/[filename]/+page.server.js";
export const imports = ["_app/immutable/nodes/8.B-odKVA6.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/Tag.DeDbgaLC.js"];
export const stylesheets = ["_app/immutable/assets/8.CsX_hLZh.css","_app/immutable/assets/Tag.BD3mTWjG.css"];
export const fonts = [];
