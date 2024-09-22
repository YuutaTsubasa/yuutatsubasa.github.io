export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".nojekyll","404.html","app.css","CNAME","favicon.ico","images/about/1.0-01.webp","images/about/1.0-02.webp","images/about/1.0-03.webp","images/about/1.5-01.webp","images/about/1.5-02.webp","images/about/2.0-01.webp","images/about/2.0-02.webp","images/about/3.0-01.webp","images/about/3.0-02.webp","images/about/4.0-01.webp","images/about/4.0-02.webp","images/about/4.0-03.webp","images/about/4.0-04.webp","images/about/4.0-05.webp","images/about/4.0-06.webp","images/about/4.0-07.webp","images/activities/1st-game-jam.webp","images/all_background.webp","images/background.webp","images/character.webp","images/logo.webp","images/posts/fan_drawing_01.webp","images/posts/fan_drawing_02.webp","images/posts/fan_drawing_03.gif","images/posts/fan_drawing_04.webp","images/posts/fan_drawing_05.webp","images/posts/quick_scheduler_tool.webp","images/posts/streamings/0.webp","images/posts/streamings/1.webp","images/title_background.webp","vite.svg"]),
	mimeTypes: {".html":"text/html",".css":"text/css",".webp":"image/webp",".gif":"image/gif",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.BSElssn5.js","app":"_app/immutable/entry/app.DEdIudr9.js","imports":["_app/immutable/entry/start.BSElssn5.js","_app/immutable/chunks/entry.Ddn4-chf.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/entry/app.DEdIudr9.js","_app/immutable/chunks/scheduler.D8xYWXqZ.js","_app/immutable/chunks/index.B9520eul.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
