import * as universal from '../entries/pages/posts/_page_/_layout.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/posts/[page]/+layout.js";
export const imports = ["_app/immutable/nodes/5.CvA_BULQ.js","_app/immutable/chunks/layout.QRMXQCDS.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js"];
export const stylesheets = [];
export const fonts = [];
