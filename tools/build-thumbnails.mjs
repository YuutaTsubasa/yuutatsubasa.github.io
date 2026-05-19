#!/usr/bin/env node
// 把 static/images/posts/ 底下 gallery 用到的原圖縮成 600px 寬的 webp 縮圖，
// 輸出到 static/images/posts/thumbs/，供 Gallery 列表使用。
// 詳情頁仍然走原圖（保留動畫 / 高解析）。

import { execSync, spawnSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const IMG_DIR = 'static/images/posts';
const THUMB_DIR = path.join(IMG_DIR, 'thumbs');
const PREFIXES = ['fan_drawing_', 'commission_', 'self_drawing_', 'skeb_'];
const MAX_WIDTH = 600;
const QUALITY = 80;

// 找可用的 ImageMagick CLI（macOS 通常是 magick，Ubuntu/IM6 是 convert）
const CMD = (() => {
  for (const c of ['magick', 'convert']) {
    const r = spawnSync(c, ['-version'], { stdio: 'ignore' });
    if (r.status === 0) return c;
  }
  console.error('ImageMagick (magick or convert) not found in PATH');
  process.exit(1);
})();

mkdirSync(THUMB_DIR, { recursive: true });

const files = readdirSync(IMG_DIR).filter((f) => {
  if (!PREFIXES.some((p) => f.startsWith(p))) return false;
  return /\.(webp|gif|png|jpe?g)$/i.test(f);
});

let generated = 0;
let skipped = 0;
for (const f of files) {
  const src = path.join(IMG_DIR, f);
  const ext = path.extname(f).toLowerCase();
  const base = path.basename(f, ext);
  const dest = path.join(THUMB_DIR, `${base}.webp`);

  // 已有的且比原圖新就跳過（避免每次 build 都重壓）
  if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) {
    skipped += 1;
    continue;
  }

  // GIF 取第一張 frame；其他直接縮
  const input = ext === '.gif' ? `${src}[0]` : src;
  const args = [input, '-resize', `${MAX_WIDTH}x>`, '-quality', String(QUALITY), dest];
  const r = spawnSync(CMD, args, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.warn(`failed: ${f}`);
    continue;
  }
  generated += 1;
}

console.log(`✓ thumbnails: ${generated} generated, ${skipped} up-to-date (out of ${files.length})`);
