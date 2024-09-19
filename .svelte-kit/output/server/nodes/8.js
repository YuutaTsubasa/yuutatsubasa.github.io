import * as universal from '../entries/pages/post/_filename_/_page.js';
import * as server from '../entries/pages/post/_filename_/_page.server.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/post/_filename_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/post/[filename]/+page.js";
export { server };
export const server_id = "src/routes/post/[filename]/+page.server.js";
export const imports = ["_app/immutable/nodes/8.5-LOypAU.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/Tag.WXGIjayf.js"];
export const stylesheets = ["_app/immutable/assets/8.B7ghz4TW.css","_app/immutable/assets/Tag.CDHLiHnV.css"];
export const fonts = [];
