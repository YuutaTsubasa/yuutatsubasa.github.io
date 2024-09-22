

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.0yyWEsMM.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js","_app/immutable/chunks/entry.DEoKvL0_.js"];
export const stylesheets = [];
export const fonts = [];
