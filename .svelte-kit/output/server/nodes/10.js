

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/tag/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.XLIowxQC.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js"];
export const stylesheets = [];
export const fonts = [];
