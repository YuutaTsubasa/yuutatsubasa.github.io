#!/usr/bin/env node
// 一次性遷移：把 cover_*.json 從舊的扁平 titleMain / titleSub / episode 三欄
// 轉成新的 themes 陣列格式：
//   themes: [{ level: "main" | "sub", title, sub?, episode? }]
// 已經是新格式（含 themes 陣列）的檔會跳過。

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = 'tools/streaming-covers/data';

const files = readdirSync(DATA_DIR).filter((f) => /^cover_\d+\.json$/.test(f));

let migrated = 0;
let skipped = 0;

for (const f of files) {
  const p = path.join(DATA_DIR, f);
  const d = JSON.parse(readFileSync(p, 'utf8'));

  if (Array.isArray(d.themes)) {
    skipped += 1;
    continue;
  }

  const theme = { level: 'main', title: d.titleMain || '' };
  if (d.titleSub) theme.sub = d.titleSub;
  if (d.episode != null && d.episode !== '') theme.episode = d.episode;

  // 保持欄位順序：vol → themes → 其他（跳過已合併的 titleMain/titleSub/episode）
  const ordered = { vol: d.vol, themes: [theme] };
  for (const k of Object.keys(d)) {
    if (['vol', 'titleMain', 'titleSub', 'episode', 'themes'].includes(k)) continue;
    ordered[k] = d[k];
  }

  writeFileSync(p, JSON.stringify(ordered, null, 2) + '\n');
  console.log(`migrated ${f}`);
  migrated += 1;
}

console.log(`\n✓ ${migrated} migrated, ${skipped} already new format`);
