#!/usr/bin/env node
// 產生首頁 00 START 的背景圖（陪伴模式的場景＋角色，不含介面）。
// 場景、坐姿、鏡頭或預設化身改了之後重跑一次。
//
//   npm run dev                      # 另開一個終端機
//   node tools/companion/render-start.mjs [http://127.0.0.1:5173]
//
// 輸出：static/companion/start.webp（1920×1080）、start-portrait.webp（1080×1920）
// 需要 Chrome 或 Edge（可用 CHROME_BIN 指定）；用 DevTools Protocol 控制，不需要額外套件。

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT = 'static/companion';
const SHOTS = [
  { file: 'start.webp', width: 1920, height: 1080 },
  { file: 'start-portrait.webp', width: 1080, height: 1920 }
];

const pf = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)';
const BROWSERS = [
  process.env.CHROME_BIN,
  join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
].filter(Boolean);
const BROWSER = BROWSERS.find((p) => existsSync(p));
if (!BROWSER) {
  console.error('找不到 Chrome／Edge，請用 CHROME_BIN=<路徑> 指定');
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), 'companion-start-'));
const PORT = 9300 + Math.floor(Math.random() * 500);
const browser = spawn(BROWSER, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--hide-scrollbars',
  '--mute-audio',
  '--ignore-gpu-blocklist',
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('瀏覽器沒有回應 DevTools 連線');
}

function cdp(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  const ready = new Promise((r) => ws.addEventListener('open', r));
  return {
    ready,
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const n = ++id;
        pending.set(n, { resolve, reject });
        ws.send(JSON.stringify({ id: n, method, params }));
      }),
    close: () => ws.close()
  };
}

try {
  const page = cdp(await connect());
  await page.ready;
  for (const shot of SHOTS) {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width: shot.width, height: shot.height, deviceScaleFactor: 1, mobile: false
    });
    // 每張用不同網址，確保整頁重新載入（只差 hash 時瀏覽器不會重載）
    await page.send('Page.navigate', { url: `${BASE}/?still=${shot.width}x${shot.height}#play` });
    let ready = false;
    for (let i = 0; i < 600 && !ready; i++) {
      await sleep(500);
      const r = await page.send('Runtime.evaluate', {
        expression: "document.documentElement.dataset.companionReady === '1'",
        returnByValue: true
      });
      ready = r.result.value === true;
    }
    if (!ready) throw new Error(`${shot.file}：陪伴模式沒有載入完成`);
    await sleep(2500); // 等陰影、彈簧骨穩定下來
    const { data } = await page.send('Page.captureScreenshot', { format: 'webp', quality: 82 });
    writeFileSync(join(OUT, shot.file), Buffer.from(data, 'base64'));
    console.log(`✓ ${join(OUT, shot.file)}`);
  }
  page.close();
} finally {
  browser.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
