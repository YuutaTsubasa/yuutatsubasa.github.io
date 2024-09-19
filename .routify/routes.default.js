

export default {
  "meta": {},
  "id": "_default",
  "name": "",
  "file": {
    "path": "src/routes",
    "dir": "src",
    "base": "routes",
    "ext": "",
    "name": "routes"
  },
  "rootName": "default",
  "routifyDir": import.meta.url,
  "children": [
    {
      "meta": {},
      "id": "_default_about_svelte",
      "name": "about",
      "file": {
        "path": "src/routes/about.svelte",
        "dir": "src/routes",
        "base": "about.svelte",
        "ext": ".svelte",
        "name": "about"
      },
      "asyncModule": () => import('../src/routes/about.svelte'),
      "children": []
    },
    {
      "meta": {
        "isDefault": true
      },
      "id": "_default_index_svelte",
      "name": "index",
      "file": {
        "path": "src/routes/index.svelte",
        "dir": "src/routes",
        "base": "index.svelte",
        "ext": ".svelte",
        "name": "index"
      },
      "asyncModule": () => import('../src/routes/index.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_post",
      "name": "post",
      "module": false,
      "file": {
        "path": "src/routes/post",
        "dir": "src/routes",
        "base": "post",
        "ext": "",
        "name": "post"
      },
      "children": [
        {
          "meta": {
            "dynamic": true,
            "order": false
          },
          "id": "_default_post__filename__svelte",
          "name": "[filename]",
          "file": {
            "path": "src/routes/post/[filename].svelte",
            "dir": "src/routes/post",
            "base": "[filename].svelte",
            "ext": ".svelte",
            "name": "[filename]"
          },
          "asyncModule": () => import('../src/routes/post/[filename].svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_posts_svelte",
      "name": "posts",
      "file": {
        "path": "src/routes/posts.svelte",
        "dir": "src/routes",
        "base": "posts.svelte",
        "ext": ".svelte",
        "name": "posts"
      },
      "asyncModule": () => import('../src/routes/posts.svelte'),
      "children": []
    },
    {
      "meta": {
        "dynamic": true,
        "dynamicSpread": true,
        "order": false,
        "inline": false
      },
      "name": "[...404]",
      "file": {
        "path": ".routify/components/[...404].svelte",
        "dir": ".routify/components",
        "base": "[...404].svelte",
        "ext": ".svelte",
        "name": "[...404]"
      },
      "asyncModule": () => import('./components/[...404].svelte'),
      "children": []
    }
  ]
}