import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.B7M-7VhJ.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js"];
export const stylesheets = ["_app/immutable/assets/0.B9L1imoF.css"];
export const fonts = [];
