import{s as r}from"../chunks/scheduler.D8xYWXqZ.js";import{S as p,i,c as m,b as g,m as f,t as c,a as l,d as u}from"../chunks/index.B9520eul.js";import{P as _}from"../chunks/Posts.BFKCws_p.js";function $(s){let a,o;return a=new _({props:{page:s[0].page,tag:s[0].tag,posts:s[0].posts,totalPages:s[0].totalPages}}),{c(){m(a.$$.fragment)},l(t){g(a.$$.fragment,t)},m(t,e){f(a,t,e),o=!0},p(t,[e]){const n={};e&1&&(n.page=t[0].page),e&1&&(n.tag=t[0].tag),e&1&&(n.posts=t[0].posts),e&1&&(n.totalPages=t[0].totalPages),a.$set(n)},i(t){o||(c(a.$$.fragment,t),o=!0)},o(t){l(a.$$.fragment,t),o=!1},d(t){u(a,t)}}}function P(s,a,o){let{data:t}=a;return s.$$set=e=>{"data"in e&&o(0,t=e.data)},[t]}class b extends p{constructor(a){super(),i(this,a,P,$,r,{data:0})}}export{b as component};