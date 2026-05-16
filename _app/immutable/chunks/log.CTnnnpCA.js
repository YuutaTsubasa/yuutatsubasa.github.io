import{j as r}from"./js-yaml.mbYHt68G.js";const u=`---
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
`,p=Object.assign({"/src/posts/log_quickscheduler.md":u});function d(t){const e=t.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);return e?{meta:r.load(e[1])??{},body:t.slice(e[0].length)}:{meta:{},body:t}}const l=Object.entries(p).map(([t,e])=>{const{meta:s,body:a}=d(e),n=t.split("/").pop().replace(".md",""),i=(s.slug??n.replace(/^log_/,"")).trim();return{id:n,slug:i,category:s.category??"project",title:s.title??i,date:(s.date??"").replace(/-/g,"."),time:s.time??"",thumbnail:s.thumbnail??null,excerpt:s.excerpt??"",tags:s.tags??[],stack:s.stack??[],links:s.links??[],meta:s.meta??{},bodyRaw:a.trim()}}),f=[...l].sort((t,e)=>t.date<e.date?-1:t.date>e.date?1:0),o=new Map;f.forEach((t,e)=>o.set(t.id,e+1));const g=l.map(t=>({...t,caseNum:o.get(t.id)})).sort((t,e)=>t.date<e.date?1:t.date>e.date?-1:0),c=[{id:"project",enLabel:"PROJECT",label:"作品",color:"#22D3EE",glyph:"▣"},{id:"review",enLabel:"REVIEW",label:"心得",color:"#F472B6",glyph:"★"},{id:"solve",enLabel:"SOLVE",label:"解題",color:"#A78BFA",glyph:"◆"}];Object.fromEntries(c.map(t=>[t.enLabel,{color:t.color,label:t.label,glyph:t.glyph,id:t.id}]));function h(t){return c.find(e=>e.id===t)}function b(t){return g.find(e=>e.slug===t)}function E(t){const e=new Set,s=[];for(const a of[...t.tags||[],...t.stack||[]]){if(!a)continue;const n=String(a).trim();e.has(n)||(e.add(n),s.push(n))}return s}function _(t){var a;const e=[],s=t.meta||{};return t.category==="solve"?(s.difficulty&&e.push(s.difficulty),s.lang&&e.push(s.lang),s.runtime&&e.push(s.runtime)):t.category==="review"?(s.rating&&e.push(s.rating),s.platform&&e.push(s.platform),s.hours&&e.push(s.hours)):(s.status&&e.push(s.status),s.phase&&e.push(s.phase),(a=t.stack)!=null&&a.length&&e.push(t.stack.slice(0,2).join("/"))),e.slice(0,3)}export{g as L,E as a,c as b,b as c,h as f,_ as l};
