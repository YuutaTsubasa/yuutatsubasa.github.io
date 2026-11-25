/// <reference types="svelte" />
/// <reference types="vite/client" />

/** 建置時從 static/companion 讀到的 .glb／.vrm 實際大小（位元組），key 是網址路徑 */
declare const __COMPANION_SIZES__: Record<string, number>;
