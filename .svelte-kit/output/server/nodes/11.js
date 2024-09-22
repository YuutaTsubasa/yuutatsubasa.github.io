import * as server from '../entries/pages/posts/tag/_tag_/_page.server.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/tag/_tag_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/posts/tag/[tag]/+page.server.js";
export const imports = ["_app/immutable/nodes/11.Dl1S_ZfC.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js"];
export const stylesheets = [];
export const fonts = [];
