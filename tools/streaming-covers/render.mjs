#!/usr/bin/env node
/**
 * 直播封面批次渲染
 *   node tools/streaming-covers/render.mjs <vol> [vol...]
 *   node tools/streaming-covers/render.mjs --all          # 跑 data/cover_*.json 全部
 *   node tools/streaming-covers/render.mjs --png-dir <dir> <vol> [vol...]  # 只輸出原始 PNG 到 <dir>（比對用）
 *
 * 流程：
 *   1. 開一個 localhost http server 對外服務 tools/streaming-covers/
 *   2. 對每一個 vol 跑 Chrome／Edge headless，loading template.html?vol=N（card: "hud" 走 hud.html）
 *   3. 截 PNG（card a–d 是 1.5 倍的 1920×1080，hud 是 1280×720）
 *   4. 轉成 webp：card a–d 丟到 static/images/streaming/streaming_NNNN.webp，
 *      hud 丟到文章用的 static/images/posts/streamings/N.webp
 *   5. 刪掉暫存 PNG
 */
import { createServer } from 'node:http';
import { copyFile, readFile, mkdir, mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROOT, '..', '..');
const OUT_DIR = join(REPO, 'static', 'images', 'streaming');
const POST_DIR = join(REPO, 'static', 'images', 'posts', 'streamings');

const BROWSERS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ...[process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]
    .filter(Boolean)
    .flatMap((base) => [
      join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    ])
];
const CHROME = process.env.CHROME_BIN || BROWSERS.find((p) => existsSync(p)) || BROWSERS[0];

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
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
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
  const r = process.platform === 'win32'
    ? spawnSync('where', [cmd], { stdio: 'ignore' })
    : spawnSync('command', ['-v', cmd], { shell: true });
  return r.status === 0;
}

// cwebp 優先；沒裝就試 Pillow（品質參數相同）。回傳轉檔函式，都沒有回傳 null。
function findWebpEncoder() {
  if (which('cwebp')) {
    return (png, out) => spawnSync('cwebp', ['-q', '88', png, '-o', out], { stdio: 'ignore' }).status === 0;
  }
  const code = 'import sys; from PIL import Image; Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2], quality=88)';
  for (const py of ['python', 'python3']) {
    if (spawnSync(py, ['-c', 'import PIL'], { stdio: 'ignore' }).status === 0) {
      return (png, out) => spawnSync(py, ['-c', code, png, out], { stdio: 'ignore' }).status === 0;
    }
  }
  return null;
}

async function fileExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function renderOne(vol, port, encodeWebp, pngDir) {
  const padded = String(vol).padStart(4, '0');
  const tmpPng = join(ROOT, `.render-${padded}.png`);
  const { card } = JSON.parse(await readFile(join(ROOT, 'data', `cover_${padded}.json`), 'utf8'));
  const hud = card === 'hud';
  const ext = encodeWebp ? 'webp' : 'png';
  const outFile = pngDir
    ? join(pngDir, `cover_${padded}.png`)
    : hud
      ? join(POST_DIR, `${vol}.${ext}`)
      : join(OUT_DIR, `streaming_${padded}.${ext}`);

  const url = `http://127.0.0.1:${port}/${hud ? 'hud' : 'template'}.html?vol=${vol}`;

  // Chrome headless screenshot
  // Legacy --headless 會在截圖完成後自動退出；--headless=new 是新模式但不會自動 exit。
  // macOS 不指定 --user-data-dir，讓 Chrome 用臨時 profile，避免 SingletonLock 殘留問題。
  // Windows 要明確給，不然可能接到使用者開著的 Edge。
  const profile = process.platform === 'win32' ? await mkdtemp(join(tmpdir(), 'cover-')) : null;
  const chromeArgs = [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    `--force-device-scale-factor=${hud ? 1 : 1.5}`,
    ...(profile ? [`--user-data-dir=${profile}`] : []),
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

  if (profile) await rm(profile, { recursive: true, force: true }).catch(() => {});

  if (chromeRes.code !== 0 || !(await fileExists(tmpPng))) {
    console.error(`✗ vol ${vol} chrome failed (code=${chromeRes.code})`);
    if (chromeRes.stderr) console.error(chromeRes.stderr.slice(0, 500));
    return false;
  }

  if (pngDir || !encodeWebp) {
    await copyFile(tmpPng, outFile);
    await rm(tmpPng, { force: true });
  } else {
    const encoded = encodeWebp(tmpPng, outFile);
    await rm(tmpPng, { force: true });
    if (!encoded) {
      console.error(`✗ vol ${vol} webp 轉檔失敗`);
      return false;
    }
  }

  console.log(`✓ vol ${vol} → ${relative(REPO, outFile)}`);
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
  const pngFlag = args.indexOf('--png-dir');
  const pngDir = pngFlag >= 0 ? args.splice(pngFlag, 2)[1] : null;
  const vols = await resolveVols(args);
  if (vols.length === 0) {
    console.error('Usage: node render.mjs <vol> [vol...]  |  --all');
    process.exit(1);
  }

  if (!(await fileExists(CHROME))) {
    console.error(`Chrome 找不到：${CHROME}\n用 CHROME_BIN=<path> 指定`);
    process.exit(1);
  }

  await mkdir(pngDir ?? OUT_DIR, { recursive: true });
  const encodeWebp = pngDir ? null : findWebpEncoder();
  if (!pngDir && !encodeWebp) console.warn('⚠ cwebp 和 Pillow 都沒有，輸出維持 PNG。建議：brew install webp 或 pip install pillow');

  const { server, port } = await startServer();
  console.log(`local server :${port} · 渲染 ${vols.length} 個 vol`);
  let ok = 0;
  try {
    for (const vol of vols) {
      if (await renderOne(vol, port, encodeWebp, pngDir)) ok += 1;
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
