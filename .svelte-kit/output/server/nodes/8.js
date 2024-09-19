import * as universal from '../entries/pages/posts/_slug_/_page.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/posts/_slug_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/posts/[slug]/+page.js";
export const imports = ["_app/immutable/nodes/8.B4FZcLKo.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/scheduler.Cq-2pPUB.js","_app/immutable/chunks/index.DPwGWccd.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/Tag.lIjMCAKE.js"];
export const stylesheets = ["_app/immutable/assets/8.B7ghz4TW.css","_app/immutable/assets/Tag.CDHLiHnV.css"];
export const fonts = [];
