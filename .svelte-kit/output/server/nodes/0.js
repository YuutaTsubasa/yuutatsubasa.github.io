import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.jZMGXLnH.js","_app/immutable/chunks/scheduler.Cq-2pPUB.js","_app/immutable/chunks/index.DPwGWccd.js"];
export const stylesheets = [];
export const fonts = [];
