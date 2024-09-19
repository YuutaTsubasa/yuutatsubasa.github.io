import * as universal from '../entries/pages/posts/tag/_tag_/_page_/_layout.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/posts/tag/[tag]/[page]/+layout.js";
export const imports = ["_app/immutable/nodes/5.BPuyUA1w.js","_app/immutable/chunks/layout.BV4fgQgn.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js"];
export const stylesheets = [];
export const fonts = [];
