import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			handleMissingId: ({ path, id }) => {
				// 跳到主內容用的 #main 連結，過渡頁（/posts 重導）沒有對應元素，忽略即可
				if (id === 'main') return;
				throw new Error(`Missing #${id} on ${path}`);
			}
		}
	}
};

export default config;
