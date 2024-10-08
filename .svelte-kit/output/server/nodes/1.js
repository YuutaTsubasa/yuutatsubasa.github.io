

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.Dc99Cmqn.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js","_app/immutable/chunks/entry.B5gTMtLE.js"];
export const stylesheets = [];
export const fonts = [];
