export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".nojekyll","404.html","app.css","CNAME","favicon.ico","images/about/1.0-01.webp","images/about/1.0-02.webp","images/about/1.0-03.webp","images/about/1.5-01.webp","images/about/1.5-02.webp","images/about/2.0-01.webp","images/about/2.0-02.webp","images/about/3.0-01.webp","images/about/3.0-02.webp","images/about/4.0-01.webp","images/about/4.0-02.webp","images/about/4.0-03.webp","images/about/4.0-04.webp","images/about/4.0-05.webp","images/about/4.0-06.webp","images/about/4.0-07.webp","images/activities/1st-game-jam.webp","images/all_background.webp","images/background.webp","images/character.webp","images/logo.webp","images/posts/fan_drawing_01.webp","images/posts/fan_drawing_02.webp","images/posts/fan_drawing_03.gif","images/posts/fan_drawing_04.webp","images/posts/quick_scheduler_tool.webp","images/posts/streamings/0.webp","images/title_background.webp","vite.svg"]),
	mimeTypes: {".html":"text/html",".css":"text/css",".webp":"image/webp",".gif":"image/gif",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.BENG7chW.js","app":"_app/immutable/entry/app.DeHTdADB.js","imports":["_app/immutable/entry/start.BENG7chW.js","_app/immutable/chunks/entry.DEoKvL0_.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/entry/app.DeHTdADB.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/posts",
				pattern: /^\/posts\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/posts/tag",
				pattern: /^\/posts\/tag\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/posts/tag/[tag]",
				pattern: /^\/posts\/tag\/([^/]+?)\/?$/,
				params: [{"name":"tag","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/posts/tag/[tag]/[page]",
				pattern: /^\/posts\/tag\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"tag","optional":false,"rest":false,"chained":false},{"name":"page","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/posts/[page]",
				pattern: /^\/posts\/([^/]+?)\/?$/,
				params: [{"name":"page","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/post/[filename]",
				pattern: /^\/post\/([^/]+?)\/?$/,
				params: [{"name":"filename","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
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
