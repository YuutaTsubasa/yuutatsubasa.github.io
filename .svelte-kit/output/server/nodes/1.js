

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.d0I_sV_F.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js","_app/immutable/chunks/entry.DPzmm_2G.js"];
export const stylesheets = [];
export const fonts = [];
