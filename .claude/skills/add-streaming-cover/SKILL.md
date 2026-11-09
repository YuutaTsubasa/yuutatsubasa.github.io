---
name: add-streaming-cover
description: 新增一集直播封面到 yuutatsubasa.github.io。觸發條件：使用者要「加封面」「新增直播封面」「生 Vol X 封面」「做一張 X 集封面」「我要新增一張直播圖」、或直接打 `/add-streaming-cover Vol.N ...`。預設用 HUD 版（card 設成 hud）：把本機素材（畫面 / 立繪）搬進 tools/streaming-covers/assets/、寫 data/cover_NNNN.json、跑 render.mjs 產出 static/images/posts/streamings/N.webp。
---

# add-streaming-cover — 新增直播封面

## 任務目標
依使用者提供的資料，產生一張 **HUD 版** 1280×720 直播封面，輸出到 `static/images/posts/streamings/N.webp`（N 不補零，就是直播存檔文章 `thumbnail` 指的路徑）：

1. 必要時把本機素材搬進 `tools/streaming-covers/assets/`
2. 產生 `tools/streaming-covers/data/cover_NNNN.json`（檔名 4 位數補零）
3. 跑 `node tools/streaming-covers/render.mjs <vol>` 渲染
4. 看過成品，回報檔案路徑

HUD 版從 PR #7（2026-11）起是現行設計；Vol.912–941 用的舊 Card D 版只在使用者明說「用舊版」時才做（見最後「舊版 Card D」）。

## 使用者常見的講法

```
/add-streaming-cover Vol.942 索尼克賽車 交叉世界 Sonic Racing CrossWorlds #72
2026.11.09 23:10
Logo 跟 941 一樣
BgSrc 在剪貼簿
Tag 是遊戲
旁邊的圖就放 H04-B01
```

對應：
- `Vol.942` → `vol`；中文名 → `title`；英文名 → `sub`；`#72` → `ep`
- `2026.11.09 23:10` → `date: "2026.11.09"`、`time: "23:10"`，`weekday` 自己算（三碼大寫英文，`MON`…`SUN`）
- 「BgSrc / 背景 / 畫面」→ HUD 版的 `frameSrc`（斜框裡的畫面）
- 「Tag」→ `types`
- 「旁邊的圖 / 立繪」→ `heroSrc`
- 「Logo 跟 N 一樣」：**HUD 版沒有遊戲 logo 欄位**。遊戲主視覺通常本身就有 logo；照做之後在回報裡說明 logo 不會另外顯示，要不要改設計由使用者決定。

## 欄位（HUD schema）

| 欄位 | 必填? | 說明 | 範例 |
|---|---|---|---|
| **vol** | ✅ | 直播編號（整數，不補零） | `942` |
| **card** | ✅ | 固定 `"hud"` | `"hud"` |
| **types** | ✅ | 類型陣列，第一個是主色 | `["game"]` |
| **title** | ✅ | 標題，太長會自動縮字 | `"索尼克賽車 交叉世界"` |
| **sub** |  | 副標（英文名或說明），省略就不顯示副標條 | `"Sonic Racing CrossWorlds"` |
| **ep** |  | 集數，顯示 `#N`；沒有就省略 key | `72` |
| **flags** |  | 黃色小旗標 | `["連動"]` |
| **kind** |  | 左上中文類型，省略時用類型中文名 | |
| **date / weekday / time** | ✅ | `"2026.11.09"`、`"MON"`、`"23:10"`（只寫開始時間） | |
| **artist** |  | 右上繪師署名。**手繪立繪才填**，3D 模型渲染不填 | `"たつあき(龍翠) @equal_aq"` |
| **frameSrc** |  | 斜框裡的畫面（遊戲主視覺、直播截圖） | `"assets/942.webp"` |
| **heroSrc** |  | 右側立繪 | `"assets/vtuber-h04-b01-0.webp"` |
| **heroBox** |  | 立繪框覆寫。預設框是給 3D 模型渲染的；**手繪立繪**輪廓不同，通常要給 | `{ "right": "-10px", "bottom": "-70px", "width": "560px", "height": "800px" }` |
| **vtuberLogoSrc** | ✅ | 幾乎都是 `"assets/vtuber-logo.png"`，不用問 | |

空的選填欄位直接省略 key，不要留空字串。

### types 對照

| id | 中文（使用者會說） | 顯示 |
|---|---|---|
| `game` | 遊戲 | GAME |
| `song` | 歌回、唱歌 | KARAOKE |
| `talk` | 雜談 | TALK |
| `code` | 程式 | CODE |
| `art` | 繪圖、畫圖 | ART |

HUD 版只有這五種（舊版的 `karaoke`/`chat`/`3d`/`music` 不能用）。多類型就放多個，例 `["game", "talk"]`。

## 素材

### 立繪（heroSrc）
- 使用者講模型代號（例 `H04-B01`）：去 `Data\10_Projects\ProjectVtuber\projects\vrm-model\output\` 找透明背景的渲染圖（例 `trials\h03-b01-2026-10-27\wallpaper\h04b01-social-banner\wallpaper_3840x2160.png`，資料夾裡的 `pose.json` 寫了用哪個 VRM）。同一個代號有好幾張就挑最新的，回報時說挑了哪張。找不到就問路徑，**不要遞迴搜尋整個使用者資料夾**。
- 已經在 `assets/` 的就直接用：`ls tools/streaming-covers/assets/vtuber*`。
- 命名：版本號立繪 `vtuber<ver>-<idx>.webp`（例 `vtuber4.0-0.webp`）；模型代號 `vtuber-<代號小寫>-<idx>.webp`（例 `vtuber-h04-b01-0.webp`）。
- 一定要先裁掉透明 padding（見下方「轉檔」），不然會縮得很小。

### 畫面（frameSrc）
- 命名 `<vol>.webp`（例 `942.webp`）。舊存檔用的直播截圖叫 `frame_<vol>.jpg`，新的一律 `<vol>.webp`。
- 不用裁、不用模糊（HUD 版畫面是清楚顯示的）。

### 剪貼簿（「在剪貼簿」）
**一收到請求就先讀**，免得被別的東西蓋掉。

Windows（PowerShell）：
```powershell
Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()   # 不是圖時是 $null，再看 Get-Clipboard 有沒有路徑
$img.Save("<scratchpad>\clipboard.png", [System.Drawing.Imaging.ImageFormat]::Png)
```

macOS：
```bash
osascript -e 'set png to (the clipboard as «class PNGf»)' \
          -e 'set f to open for access POSIX file "/tmp/clipboard.png" with write permission' \
          -e 'set eof f to 0' -e 'write png to f' -e 'close access f'
```

存完用 Read 看一眼，確認是使用者要的圖。

### 轉檔
tailsmachine 沒有 `magick`／`cwebp`，用 Python Pillow 一次做完裁切與轉檔（`trim.mjs` 需要 ImageMagick，有裝才用）：

```bash
python -c "
from PIL import Image
im = Image.open(r'<立繪.png>').convert('RGBA')
im.crop(im.getchannel('A').getbbox()).save('tools/streaming-covers/assets/<hero>.webp', quality=90, method=6)
Image.open(r'<畫面.png>').convert('RGB').save('tools/streaming-covers/assets/<vol>.webp', quality=90, method=6)
"
```

有 `cwebp` 的話也可以 `cwebp -q 90 <src> -o <dst>`（立繪先 `node tools/streaming-covers/trim.mjs --inplace` 裁）。

## 完整步驟

1. **讀剪貼簿**（如果有提到）。
2. **收集資訊**：vol、title、日期時間缺了才問；立繪沒講就問一次用哪個（列 `assets/vtuber*` 給他選）。其他用上面的規則補。
3. **開分支**：push 到 `main` 會自動部署，所以一律在 `claude/<主題>` 分支做、開 PR，只有使用者合併。主 checkout 可能有別的工作階段在用，用 `git worktree add -b claude/vol<N>-cover <路徑> origin/main` 另開。
4. **檢查衝突**：`data/cover_NNNN.json` 已存在就停下來問「要覆蓋還是換 vol」。
5. **搬素材**、`ls -la` 確認。
6. **寫 JSON** `tools/streaming-covers/data/cover_NNNN.json`，例：
   ```json
   {
     "vol": 942,
     "card": "hud",
     "types": ["game"],
     "title": "索尼克賽車 交叉世界",
     "sub": "Sonic Racing CrossWorlds",
     "ep": 72,
     "date": "2026.11.09",
     "weekday": "MON",
     "time": "23:10",
     "frameSrc": "assets/942.webp",
     "heroSrc": "assets/vtuber-h04-b01-0.webp",
     "vtuberLogoSrc": "assets/vtuber-logo.png"
   }
   ```
7. **渲染**：`node tools/streaming-covers/render.mjs <vol>`，看到 `✓ vol N → static/images/posts/streamings/N.webp` 才算成功。Windows 會自動找 Chrome 或 Edge。
8. **看成品**：webp 轉成 PNG 用 Read 看（例如 `python -c "from PIL import Image; Image.open('static/images/posts/streamings/942.webp').save('<scratchpad>/942.png')"`）。檢查標題沒被切、立繪位置正常、日期星期正確。
9. **build**：`npm ci`（新 worktree 才要）＋`npm run build`，確認 `dist/images/posts/streamings/N.webp` 在。
10. **commit / PR**：commit 訊息照慣例 `Add Vol.N <標題> #<ep> cover.`；PR 說明寫清楚素材來源。照 tailsmachine-ops 規則跑 Codex 審查，結果寫進 PR 的「Codex review」。
11. **回報**：PR 連結、封面圖、挑了哪張立繪、有沒有用不到的要求（例如 logo）。

只加封面；直播存檔文章（`src/posts/streaming_*.md`）和 `schedule.js` 不在這個 skill 的範圍，使用者要才做。

## 預覽 / 微調

- 改 JSON → 重跑 `render.mjs <vol>` 覆蓋。
- 瀏覽器預覽：`npx serve tools/streaming-covers`，開 `http://localhost:3000/hud?vol=<vol>`（**不要加 `.html`**，serve 轉址會弄丟參數）。
- 立繪太大／太小／位置怪：加 `heroBox` 調整。

## 不要做的事

- 不要改 `hud.html`、`lib/covers.css` 等設計檔，除非使用者明確要改設計。
- 不要把素材放進 `static/images/`（那是輸出，由 render.mjs 管）。
- 不要改別集的 `cover_NNNN.json`。
- 不要直接 push `main`、不要自己合併。

## 舊版 Card D（只在使用者要求時）

Vol.912–941 用的版型。JSON 用另一套 schema（`themes`、`categories`、`streamTime`、`logoSrc`、`bgSrc`、`bgEffect: "soft"`、`card: "d"`，可參考 `data/cover_0941.json`），輸出 `static/images/streaming/streaming_NNNN.webp`（1920×1080）。欄位說明見 `tools/streaming-covers/README.md`。這版才有遊戲 logo（`logoSrc`），背景圖（`bgSrc`）是全畫面模糊。
