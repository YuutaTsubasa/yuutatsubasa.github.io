

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/tag/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/11.-nhjDiqd.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js"];
export const stylesheets = [];
export const fonts = [];
