# 直播封面產生器

統一風格的直播封面圖工具，瀏覽器即時預覽 + Chrome headless 截圖匯出。

## 目錄

```
tools/streaming-covers/
  index.html            # 多卡預覽 + Tweaks（手動調設計用）
  template.html         # 單卡 solo 渲染（?vol=N 載 data/cover_NNNN.json）
  lib/
    covers.css          # 共用 CSS（兩個 html 都 link 這支）
    design-canvas.jsx   # Claude Design 共用畫布框架
    tweaks-panel.jsx    # Claude Design 共用控制面板
  assets/               # 封面素材
    vtuber<ver>-<idx>.png  # 立繪（跟 VTuber 模型版本走）
    <vol>.webp             # 背景圖（跟 Vol 走，例 0.webp = Vol 0）
    vtuber-logo.png        # 右下 VTuber Logo
  data/
    cover_NNNN.json     # 每集一個檔，覆寫 DEFAULTS 的欄位
  cover-atoms.jsx       # 共用小元件 + DEFAULTS + STREAM_TAGS
  cover-cards.jsx       # 四個 Card 版型（A 為主）
  streaming-covers.jsx  # index.html 的 App（多卡預覽）
  solo-cover.jsx        # template.html 的 App（單卡）
  README.md
```

## 用法

### A. 設計／調整版型

```bash
npx serve tools/streaming-covers
# 開 http://localhost:3000/index.html
```

Tweaks 面板裡改參數，調好之後把資料抄到對應的 `data/cover_NNNN.json`。

### B. 單卡渲染（給 Chrome headless 或截圖用）

```
http://localhost:3000/template.html?vol=0
http://localhost:3000/template.html?vol=419&card=b   # 強制換版型
```

URL 參數：
- `vol` — 必填，會去 `data/cover_<padStart(4,'0')>.json` 撈資料
- `card` — 選填，覆寫 JSON 裡的 `card` 欄位（`a` / `b` / `c` / `d`）

JSON 沒寫的欄位會 fallback 到 `cover-atoms.jsx` 裡的 `DEFAULTS`。

### C. 截圖匯出

**單張，DevTools 手動**
1. 開 `template.html?vol=0`
2. DevTools 找到 `<div class="cover light">` → 右鍵 **Capture node screenshot**
3. PNG 1280×720 直接下載

**批次，Chrome headless**
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --window-size=1280,720 \
  --screenshot=out.png \
  "http://localhost:3000/template.html?vol=0"
```

之後可以包一個 `render-covers.mjs` 把 `data/cover_*.json` 全跑一遍。

### D. 轉 webp + 入 repo

```bash
cwebp -q 88 out.png -o static/images/streaming/streaming_0000.webp
```

## 欄位說明（`cover_NNNN.json` 可填）

| 欄位 | 說明 |
|---|---|
| `vol` | 直播編號（數字） |
| `titleMain` / `titleSub` | 主標題 / 副標題 |
| `episode` | 集數，填數字會顯示 `#N` 在主標旁；空字串或 null 不顯示 |
| `categories` | 逗號分隔的 STREAM_TAGS id，例 `"karaoke, chat"` |
| `artist` | 繪師名（填了會在 top strip 取代 `SYS / ONLINE`） |
| `streamTime` | 直播時間字串（填了取代右上角時間） |
| `theme` | `azure` / `cyan` / `violet` / `amber` / `crimson` |
| `mode` | `light` / `dark` |
| `heroSrc` | 立繪圖（相對 `tools/streaming-covers/` 路徑） |
| `bgSrc` | 全背景圖（相對路徑，空字串用主題漸層） |
| `logoSrc` | 主題 Logo 圖（左下角，空字串不顯示） |
| `vtuberLogoSrc` | 右下角 VTuber Logo |
| `card` | 版型 `a` / `b` / `c` / `d`，預設 `a` |

## 為什麼放 `tools/`

- `__DESIGN__/` 是 gitignored 暫存區，不適合長期維護資產
- 這個工具會累積 jsx 改動、素材、JSON 資料，需要 git 追蹤 + 跨機同步
- 產物 `static/images/streaming/streaming_NNNN.webp` 也在這個 repo
