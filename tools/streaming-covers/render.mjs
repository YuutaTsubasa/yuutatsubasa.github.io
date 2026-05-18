#!/usr/bin/env node
/**
 * 直播封面批次渲染
 *   node tools/streaming-covers/render.mjs <vol> [vol...]
 *   node tools/streaming-covers/render.mjs --all          # 跑 data/cover_*.json 全部
 *
 * 流程：
 *   1. 開一個 localhost http server 對外服務 tools/streaming-covers/
 *   2. 對每一個 vol 跑 Chrome headless，loading template.html?vol=N
 *   3. 截 1280×720 PNG
 *   4. cwebp 轉成 webp 丟到 static/images/streaming/streaming_NNNN.webp
 *   5. 刪掉暫存 PNG
 */
import { createServer } from 'node:http';
import { readFile, mkdir, readdir, unlink, stat } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROOT, '..', '..');
const OUT_DIR = join(REPO, 'static', 'images', 'streaming');

const CHROME =
  process.env.CHROME_BIN ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        const file = join(ROOT, pathname);
        if (!file.startsWith(ROOT)) {
          res.writeHead(403);
          return res.end('forbidden');
        }
        const data = await readFile(file);
        const ext = extname(file).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function which(cmd) {
  const r = spawnSync('command', ['-v', cmd], { shell: true });
  return r.status === 0;
}

async function fileExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function renderOne(vol, port, hasCwebp) {
  const padded = String(vol).padStart(4, '0');
  const tmpPng = join(ROOT, `.render-${padded}.png`);
  const outFile = hasCwebp
    ? join(OUT_DIR, `streaming_${padded}.webp`)
    : join(OUT_DIR, `streaming_${padded}.png`);

  const url = `http://127.0.0.1:${port}/template.html?vol=${vol}`;

  // Chrome headless screenshot
  // Legacy --headless 會在截圖完成後自動退出；--headless=new 是新模式但不會自動 exit。
  // 不指定 --user-data-dir，讓 Chrome 用臨時 profile，避免 SingletonLock 殘留問題。
  const chromeArgs = [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    '--force-device-scale-factor=1.5',
    '--window-size=1280,720',
    '--virtual-time-budget=6000',
    `--screenshot=${tmpPng}`,
    url
  ];
  // spawnSync 會阻塞 event loop，但我們 server 需要回應 chrome 的 HTTP 請求 → 用 async spawn
  const chromeRes = await new Promise((resolve) => {
    const child = spawn(CHROME, chromeArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (b) => { stderr += b.toString(); });
    const timer = setTimeout(() => child.kill('SIGKILL'), 30000);
    child.on('exit', (code) => { clearTimeout(timer); resolve({ code, stderr }); });
    child.on('error', (e) => { clearTimeout(timer); resolve({ code: -1, stderr: e.message }); });
  });

  if (chromeRes.code !== 0 || !(await fileExists(tmpPng))) {
    console.error(`✗ vol ${vol} chrome failed (code=${chromeRes.code})`);
    if (chromeRes.stderr) console.error(chromeRes.stderr.slice(0, 500));
    return false;
  }

  if (hasCwebp) {
    const c = spawnSync('cwebp', ['-q', '88', tmpPng, '-o', outFile], { stdio: ['ignore', 'pipe', 'pipe'] });
    await unlink(tmpPng).catch(() => {});
    if (c.status !== 0) {
      console.error(`✗ vol ${vol} cwebp failed`);
      return false;
    }
  } else {
    await unlink(outFile).catch(() => {});
    spawnSync('mv', [tmpPng, outFile]);
  }

  console.log(`✓ vol ${vol} → ${outFile.replace(REPO + '/', '')}`);
  return true;
}

async function resolveVols(args) {
  if (args.includes('--all')) {
    const files = await readdir(join(ROOT, 'data'));
    return files
      .map((f) => f.match(/^cover_(\d+)\.json$/))
      .filter(Boolean)
      .map((m) => parseInt(m[1], 10))
      .sort((a, b) => a - b);
  }
  return args.map((s) => parseInt(s, 10)).filter((n) => Number.isFinite(n));
}

async function main() {
  const args = process.argv.slice(2);
  const vols = await resolveVols(args);
  if (vols.length === 0) {
    console.error('Usage: node render.mjs <vol> [vol...]  |  --all');
    process.exit(1);
  }

  if (!(await fileExists(CHROME))) {
    console.error(`Chrome 找不到：${CHROME}\n用 CHROME_BIN=<path> 指定`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const hasCwebp = which('cwebp');
  if (!hasCwebp) console.warn('⚠ cwebp 沒裝，輸出維持 PNG。建議：brew install webp');

  const { server, port } = await startServer();
  console.log(`local server :${port} · 渲染 ${vols.length} 個 vol`);
  let ok = 0;
  try {
    for (const vol of vols) {
      if (await renderOne(vol, port, hasCwebp)) ok += 1;
    }
  } finally {
    server.close();
  }
  console.log(`done: ${ok}/${vols.length}`);
  process.exit(ok === vols.length ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
