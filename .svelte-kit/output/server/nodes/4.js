import * as universal from '../entries/pages/posts/_slug_/_layout.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/posts/[slug]/+layout.js";
export const imports = ["_app/immutable/nodes/4.CxrrmOg2.js","_app/immutable/chunks/layout.kWFCiOmV.js","_app/immutable/chunks/scheduler.Cq-2pPUB.js","_app/immutable/chunks/index.DPwGWccd.js"];
export const stylesheets = [];
export const fonts = [];
