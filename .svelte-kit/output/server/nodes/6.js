import * as server from '../entries/pages/_page.server.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/6.DaAUcj2H.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.DWKWhCLW.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/PostCard.Dtb5_SwH.js","_app/immutable/chunks/Tag.CbePeNuM.js"];
export const stylesheets = ["_app/immutable/assets/6.BK0MBpZJ.css","_app/immutable/assets/Tag.BD3mTWjG.css"];
export const fonts = [];
