

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/9.yADbBadl.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js"];
export const stylesheets = [];
export const fonts = [];
