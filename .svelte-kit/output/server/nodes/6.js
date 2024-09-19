

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/about/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.BM2s9_2i.js","_app/immutable/chunks/scheduler.Cq-2pPUB.js","_app/immutable/chunks/index.DPwGWccd.js","_app/immutable/chunks/each.D6YF6ztN.js"];
export const stylesheets = [];
export const fonts = [];
