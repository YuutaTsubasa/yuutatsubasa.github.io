import * as universal from '../entries/pages/about/_layout.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/about/+layout.js";
export const imports = ["_app/immutable/nodes/2.CvA_BULQ.js","_app/immutable/chunks/layout.QRMXQCDS.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js"];
export const stylesheets = [];
export const fonts = [];
