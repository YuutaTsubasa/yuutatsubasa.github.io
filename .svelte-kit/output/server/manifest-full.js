export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["404.html","CNAME","favicon.ico","images/about/1.0-01.webp","images/about/1.0-02.webp","images/about/1.0-03.webp","images/about/1.5-01.webp","images/about/1.5-02.webp","images/about/2.0-01.webp","images/about/2.0-02.webp","images/about/3.0-01.webp","images/about/3.0-02.webp","images/about/4.0-01.webp","images/about/4.0-02.webp","images/about/4.0-03.webp","images/about/4.0-04.webp","images/about/4.0-05.webp","images/about/4.0-06.webp","images/about/4.0-07.webp","images/activities/1st-game-jam.webp","images/all_background.webp","images/background.webp","images/character.webp","images/logo.webp","images/posts/fan_drawing_01.webp","images/posts/fan_drawing_02.webp","images/posts/fan_drawing_03.gif","images/posts/fan_drawing_04.webp","images/posts/quick_scheduler_tool.webp","images/posts/streamings/0.webp","images/title_background.webp","vite.svg"]),
	mimeTypes: {".html":"text/html",".webp":"image/webp",".gif":"image/gif",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.BpLql_lE.js","app":"_app/immutable/entry/app.C9vQRkPG.js","imports":["_app/immutable/entry/start.BpLql_lE.js","_app/immutable/chunks/entry.wTFW6Oof.js","_app/immutable/chunks/scheduler.Cq-2pPUB.js","_app/immutable/entry/app.C9vQRkPG.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/scheduler.Cq-2pPUB.js","_app/immutable/chunks/index.DPwGWccd.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/posts",
				pattern: /^\/posts\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/posts/[slug]",
				pattern: /^\/posts\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 8 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
