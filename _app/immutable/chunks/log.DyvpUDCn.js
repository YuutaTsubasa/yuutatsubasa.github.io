import{j as p}from"./js-yaml.mbYHt68G.js";const m=`---
title: "快速週表產生器"
date: "2023-04-14"
time: "14:00"
category: "project"
thumbnail: "/images/posts/quick_scheduler_tool.webp"
excerpt: "一個可以填寫完資料後就可以直接套用多個不同版型的週表產生工具。"
stack: ["C#", "Web", "Svelte"]
tags: ["VTuber 工具", "Web App"]
meta:
  status: "RELEASED"
  phase: "v1.0"
links:
  - { label: "DEMO", url: "https://quickscheduler.yuuta-tsubasa.studio/" }
  - { label: "SOURCE", url: "https://github.com/yuutatsubasa/quickscheduler" }
---
本來是在探索是否可以用網頁技術來製作週表，做著做著就發現當中的內容可以開成參數讓大家填寫，這樣就可以做到客製化好用的週表，然後又發現可以用相同的參數去套用多個版型，因此就做成了一個可以套用多個不同版型的週表產生器。

做完的時候其實覺得很酷，也加了三個版型進去，只是因為後來我從當初使用的 C# 轉換 Web 的技術，改成使用 Svelte 了，所以後續做的東西就要另外改寫才能塞進去，就沒再更新了，之後有機會應該要繼續更新一下。
`,d=Object.assign({"/src/posts/log_quickscheduler.md":m});function f(t){const s=t.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);return s?{meta:p.load(s[1])??{},body:t.slice(s[0].length)}:{meta:{},body:t}}const l=Object.entries(d).map(([t,s])=>{const{meta:e,body:a}=f(s),n=t.split("/").pop().replace(".md",""),i=(e.slug??n.replace(/^log_/,"")).trim();return{id:n,slug:i,category:e.category??"project",title:e.title??i,date:(e.date??"").replace(/-/g,"."),time:e.time??"",thumbnail:e.thumbnail??null,excerpt:e.excerpt??"",tags:e.tags??[],stack:e.stack??[],links:e.links??[],streams:Array.isArray(e.streams)?e.streams.map(u=>Number(u)).filter(Number.isFinite):[],meta:e.meta??{},bodyRaw:a.trim()}}),g=[...l].sort((t,s)=>t.date<s.date?-1:t.date>s.date?1:0),o=new Map;g.forEach((t,s)=>o.set(t.id,s+1));const r=l.map(t=>({...t,caseNum:o.get(t.id)})).sort((t,s)=>t.date<s.date?1:t.date>s.date?-1:0),c=[{id:"project",enLabel:"PROJECT",label:"作品",color:"#22D3EE",glyph:"▣"},{id:"review",enLabel:"REVIEW",label:"心得",color:"#F472B6",glyph:"★"},{id:"solve",enLabel:"SOLVE",label:"解題",color:"#A78BFA",glyph:"◆"},{id:"workshop",enLabel:"WORKSHOP",label:"講義",color:"#FBBF24",glyph:"📘"}];Object.fromEntries(c.map(t=>[t.enLabel,{color:t.color,label:t.label,glyph:t.glyph,id:t.id}]));function b(t){return c.find(s=>s.id===t)}function E(t){return r.find(s=>s.slug===t)}function y(t){return t==null?[]:r.filter(s=>{var e;return(e=s.streams)==null?void 0:e.includes(Number(t))})}function _(t){const s=new Set,e=[];for(const a of[...t.tags||[],...t.stack||[]]){if(!a)continue;const n=String(a).trim();s.has(n)||(s.add(n),e.push(n))}return e}function k(t){var a;const s=[],e=t.meta||{};return t.category==="solve"?(e.difficulty&&s.push(e.difficulty),e.lang&&s.push(e.lang),e.runtime&&s.push(e.runtime)):t.category==="review"?(e.rating&&s.push(e.rating),e.platform&&s.push(e.platform),e.hours&&s.push(e.hours)):(e.status&&s.push(e.status),e.phase&&s.push(e.phase),(a=t.stack)!=null&&a.length&&s.push(t.stack.slice(0,2).join("/"))),s.slice(0,3)}export{r as L,b as a,_ as b,c,E as d,y as f,k as l};
