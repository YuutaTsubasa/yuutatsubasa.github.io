import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// 陪伴模式下載的檔案（場景 .glb、角色 .vrm）的實際大小，給載入進度條當分母。
// GitHub Pages 會用 gzip 傳，瀏覽器回報的 total 是壓縮後的大小、loaded 是解壓後的位元組，兩者不能直接相除。
// 建置時從 static/ 讀，換檔案不用手動改數字。
function companionSizes() {
	const root = 'static';
	const sizes = {};
	const walk = (dir) => {
		for (const name of readdirSync(dir)) {
			const p = join(dir, name);
			const st = statSync(p);
			if (st.isDirectory()) walk(p);
			else if (/\.(glb|vrm)$/i.test(name)) sizes['/' + relative(root, p).split(sep).join('/')] = st.size;
		}
	};
	walk(join(root, 'companion'));
	return sizes;
}

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__COMPANION_SIZES__: JSON.stringify(companionSizes())
	}
});
