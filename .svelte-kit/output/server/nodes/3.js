import * as universal from '../entries/pages/post/_filename_/_layout.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/post/[filename]/+layout.js";
export const imports = ["_app/immutable/nodes/3.CvA_BULQ.js","_app/immutable/chunks/layout.QRMXQCDS.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js"];
export const stylesheets = [];
export const fonts = [];
