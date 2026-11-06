# 直播封面產生器

統一風格的直播封面圖工具，瀏覽器即時預覽 + Chrome headless 截圖匯出。

## 目錄

```
tools/streaming-covers/
  index.html            # 多卡預覽 + Tweaks（手動調設計用）
  template.html         # 單卡 solo 渲染（?vol=N 載 data/cover_NNNN.json）
  hud.html              # HUD 版封面（card: "hud"，Vol. 0–11），獨立頁面，不用 React
  fonts/                # hud.html 用的字型與 OFL 授權
  lib/
    covers.css          # 共用 CSS（兩個 html 都 link 這支）
    design-canvas.jsx   # Claude Design 共用畫布框架
    tweaks-panel.jsx    # Claude Design 共用控制面板
  assets/               # 封面素材
    vtuber<ver>-<idx>.png  # 立繪（跟 VTuber 模型版本走）
    <vol>.webp             # 背景圖（跟 Vol 走，例 910.webp = Vol 910）
    frame_<vol>.jpg        # HUD 版斜框裡的直播畫面（Vol. 10 共用 frame_7.jpg）
    vtuber-logo.png        # 右下 VTuber Logo
  data/
    cover_NNNN.json     # 每集一個檔，覆寫 DEFAULTS 的欄位
  cover-atoms.jsx       # 共用小元件 + DEFAULTS + STREAM_TAGS
  cover-cards.jsx       # 四個 Card 版型（A 為主）
  render.mjs            # 批次渲染（見下面 C）
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

`card: "hud"` 的 JSON 開 `template` 會自動轉到 `hud`。`npx serve` 會把 `.html` 網址轉址並弄丟參數，所以用它預覽時網址要寫 `/template?vol=N`、`/hud?vol=N`，不加 `.html`。

### C. 截圖匯出

**單張，DevTools 手動**
1. 開 `template.html?vol=0`
2. DevTools 找到 `<div class="cover light">` → 右鍵 **Capture node screenshot**
3. PNG 1280×720 直接下載

**批次，`render.mjs`**
```bash
node tools/streaming-covers/render.mjs 941 942     # 指定 Vol
node tools/streaming-covers/render.mjs --all       # data/cover_*.json 全部
node tools/streaming-covers/render.mjs --png-dir out 3  # 只輸出原始 PNG，不動 static/（比對用）
```

- 瀏覽器：`CHROME_BIN` 優先，沒設就找 macOS 的 Chrome、Windows 的 Chrome 或 Edge。
- 轉 webp（品質 88）：`cwebp` 優先，沒裝就用 Python 的 Pillow；都沒有時輸出 PNG 並警告。

### D. 輸出位置

| `card` | 輸出 | 尺寸 |
|---|---|---|
| `a`–`d` | `static/images/streaming/streaming_NNNN.webp` | 1920×1080 |
| `hud` | `static/images/posts/streamings/N.webp`（文章 `thumbnail` 指的路徑） | 1280×720 |

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
| `card` | 版型 `a` / `b` / `c` / `d` / `hud`，預設 `a` |

### `card: "hud"` 的欄位

HUD 版是另一套 schema，上面的 `themes`、`categories`、`bgSrc` 等欄位不適用：

| 欄位 | 說明 |
|---|---|
| `vol` | 直播編號（數字） |
| `types` | 類型陣列，第一個是主色：`game` / `song` / `talk` / `code` / `art` |
| `kind` | 左上中文類型，省略時用類型的中文名（多類型一律自動） |
| `title` / `sub` | 標題 / 副標題；標題太長會自動縮字 |
| `ep` | 集數，顯示 `#N`；沒有就省略 |
| `flags` | 黃色小旗標，例 `["連動"]` |
| `date` / `weekday` / `time` | `2021.08.02`、`MON`、`21:30`（只有開始時間） |
| `artist` | 右上繪師署名，省略就不顯示 |
| `frameSrc` | 斜框裡的畫面 |
| `heroSrc` | 右側立繪 |
| `heroBox` | 立繪框覆寫：`{ "right": "-10px", "bottom": "-70px", "width": "560px", "height": "800px" }` |
| `vtuberLogoSrc` | 右下 Logo |

中文、日文用系統字型（`Noto Sans TC`、`Noto Serif TC`，沒有時退回微軟正黑體與新細明體），所以要在裝了 Noto 的電腦上渲染，才會跟現有封面一模一樣。拉丁字母用 `fonts/` 裡的字型，不受影響。

## 為什麼放 `tools/`

- `__DESIGN__/` 是 gitignored 暫存區，不適合長期維護資產
- 這個工具會累積 jsx 改動、素材、JSON 資料，需要 git 追蹤 + 跨機同步
- 產物 `static/images/streaming/streaming_NNNN.webp` 也在這個 repo
