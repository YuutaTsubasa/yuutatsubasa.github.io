import * as universal from '../entries/pages/posts/tag/_tag_/_page_/_layout.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/posts/tag/[tag]/[page]/+layout.js";
export const imports = ["_app/immutable/nodes/5.C4tEMTw_.js","_app/immutable/chunks/layout.DtHdbXkn.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js"];
export const stylesheets = [];
export const fonts = [];
