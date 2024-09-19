

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.3Tx19H2W.js","_app/immutable/chunks/scheduler.Cz8qcNk9.js","_app/immutable/chunks/index.CVhQGuSt.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/PostCard.D_fHBuFr.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/Tag.WXGIjayf.js"];
export const stylesheets = ["_app/immutable/assets/6.BK0MBpZJ.css","_app/immutable/assets/Tag.CDHLiHnV.css"];
export const fonts = [];
