#!/usr/bin/env node
// trim.mjs — 把 PNG 邊緣的透明 padding 裁掉，留下實際內容 bbox。
//
// 用法：
//   node trim.mjs <input.png> [output.png]    單檔裁切；無 output 時寫 <input>-trimmed.png
//   node trim.mjs --inplace <input.png>       原地覆蓋
//   node trim.mjs --batch <dir>               批次處理整個資料夾的 .png（產出 -trimmed.png）
//
// 依賴：ImageMagick `magick` CLI（macOS: brew install imagemagick）

import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';

function magick(args) {
  return new Promise((res, rej) => {
    const child = spawn('magick', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('error', rej);
    child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`magick exit ${code}: ${err}`))));
  });
}

async function trimOne(input, output) {
  // -trim 依透明 alpha 裁掉外圍空白；+repage 重置畫布尺寸；保留 PNG alpha
  await magick([input, '-trim', '+repage', output]);
  console.log(`✓ ${basename(input)} → ${basename(output)}`);
}

function suffixed(input) {
  const dir = dirname(input);
  const ext = extname(input);
  const stem = basename(input, ext);
  return join(dir, `${stem}-trimmed${ext}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('用法：node trim.mjs <input.png> [output.png] | --inplace <input.png> | --batch <dir>');
    process.exit(1);
  }

  if (args[0] === '--inplace') {
    const input = resolve(args[1]);
    await trimOne(input, input);
    return;
  }

  if (args[0] === '--batch') {
    const dir = resolve(args[1]);
    const files = (await readdir(dir)).filter((f) => /\.png$/i.test(f) && !f.includes('-trimmed'));
    for (const f of files) {
      const input = join(dir, f);
      await trimOne(input, suffixed(input));
    }
    return;
  }

  const input = resolve(args[0]);
  const output = args[1] ? resolve(args[1]) : suffixed(input);
  const s = await stat(input).catch(() => null);
  if (!s) {
    console.error(`找不到檔案：${input}`);
    process.exit(1);
  }
  await trimOne(input, output);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
