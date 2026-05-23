---
name: add-streaming-cover
description: 新增一集直播封面到 yuutatsubasa.github.io。觸發條件：使用者要「加封面」「新增直播封面」「生 Vol X 封面」「做一張 X 集封面」「我要新增一張直播圖」等。會把本機素材（hero 立繪 / bg 背景 / theme logo）搬進 tools/streaming-covers/assets/、寫對應 data/cover_NNNN.json、跑 render.mjs 產出 static/images/streaming/streaming_NNNN.webp。
---

# add-streaming-cover — 新增直播封面

## 任務目標
依使用者提供的資料，產生一張 1280×720 直播封面圖，輸出到 `static/images/streaming/streaming_NNNN.webp`：

1. 必要時把本機素材搬進 `tools/streaming-covers/assets/`（外部路徑 → cwebp 轉 webp 或 cp）
2. 產生 `tools/streaming-covers/data/cover_NNNN.json`（4 位數補零）
3. 跑 `node tools/streaming-covers/render.mjs <vol>` 自動渲染
4. 回報產出檔案路徑

主目錄：`/Users/maplewing/Documents/Current/Repos/yuutatsubasa.github.io`

## 需要從使用者收集的資訊

vol（必填）+ titleMain 是底線，其他缺哪個追問哪個（用 AskUserQuestion 或單句問句）。**不要為了問齊全部欄位連發 4 個問題**——必要欄位先到位、其他用合理 defaults 補。

| 欄位 | 必填? | 說明 | 範例 |
|---|---|---|---|
| **vol** | ✅ | 直播編號（整數） | `912` |
| **titleMain** | ✅ | 主標題（中文或英文） | `索尼克 英雄` |
| **titleSub** |  | 副標題 / 英文標題 | `Sonic Heroes` |
| **episode** |  | 集數 (int, null 代表單集無集數) | `3` |
| **categories** |  | 分類 id，逗號分隔。可選 `game / code / karaoke / chat / art / 3d / music` | `"game"` |
| **artist** |  | 繪師名（背景或立繪作者，會顯示在上條） | `たつあき(龍翠) @equal_aq` |
| **streamTime** |  | 直播時間「YYYY.MM.DD · HH:MM」 | `2026.05.22 · 21:00` |
| **heroSrc** |  | 立繪圖路徑（本機絕對 / assets/ 相對 / 已存在的 vtuberX-Y） | `~/Downloads/v5.png` / `assets/vtuber4.0-0.webp` |
| **bgSrc** |  | 背景圖路徑（同上規則） | `~/Downloads/910.png` |
| **bgEffect** |  | `"soft"`（模糊 + 飽和降低）或空字串 | `"soft"` |
| **bgTint** |  | bgEffect=soft 時的暗化覆蓋 0~1（選填） | `0.28` |
| **logoSrc** |  | 主題 logo（遊戲 / 工具 logo） | `~/Downloads/game.png` |
| **vtuberLogoSrc** |  | 右下 VTuber logo，**預設 `assets/vtuber-logo.png`，幾乎不用問** | |
| **theme** |  | `azure / cyan / violet / amber / crimson`，預設 `azure`。**只在沒 bgSrc 時影響漸層底色**，有 bgSrc 時可以略過。 | `azure` |
| **mode** |  | `light / dark`，預設 `light` | `light` |
| **card** |  | 版型，**預設 `d`** | `d` |

「今天」用 `currentDate`（每次以實際值為準）。

## STREAM_TAGS 對照（categories 的合法 id）

| id | 中文 | 英文 | 色 |
|---|---|---|---|
| `game` | 遊戲 | GAME | #EF4444 |
| `code` | 程式 | CODE | #F97316 |
| `karaoke` | 歌回 | KARAOKE | #3B82F6 |
| `chat` | 雜談 | TALK | #22C55E |
| `art` | 繪圖 | ART | #F472B6 |
| `3d` | 3D | 3D | #2DD4BF |
| `music` | 音樂 | MUSIC | #818CF8 |

使用者用中文說「歌回」「雜談」「畫圖」等要對應到上面的 id。多分類用逗號隔開，例：`"karaoke, chat"`。

## 素材搬運規則

使用者給的 heroSrc / bgSrc / logoSrc 三種情況：

### 1. 已是 `assets/xxx` 開頭的相對路徑
表示已在資料夾裡，直接寫進 JSON 就好。不要碰檔案。

### 2. 本機絕對路徑（含 `~/` `/Users/...` `/tmp/...` 等）
先 `ls -la {path}` 確認檔在。處理順序：**先 trim（去透明邊）→ 再 cwebp（轉 webp）**。

#### 2a. 先 trim 透明 padding（hero / logo 必做、bg 不做）

立繪、logo 常常有大片透明 padding，會讓 `size: "contain"` 把實際內容縮得很小。在轉檔前用 `trim.mjs` 把外圍 alpha=0 的區域裁掉。

| 用途 | 要不要 trim |
|---|---|
| heroSrc | ✅ 一定要（除非使用者已給「-trimmed」結尾或明說已裁過） |
| logoSrc | ✅ 一定要 |
| bgSrc | ❌ 不要（背景是 full-bleed，padding 是正常的） |

工作流：
1. 先複製到暫存：`cp {SRC} /tmp/streaming-cover-src.{ext}`（保留原檔不動）
2. 跑 trim：`node tools/streaming-covers/trim.mjs --inplace /tmp/streaming-cover-src.{ext}`
3. 用 trimmed 檔當下一步輸入（轉 webp）

跳過 trim 的時機：
- 副檔名 `.jpg/.jpeg`（沒 alpha 通道，trim 會用顏色 fuzz 容易裁錯）
- 使用者明說「不要裁」或檔名本身有 `-trimmed`

`trim.mjs` 內部呼叫 `magick`（ImageMagick），沒裝會 fail；fail 時改提示使用者裝 `brew install imagemagick` 或讓他自己裁。

#### 2b. 再轉 webp 到 assets

- **副檔名 .webp（已是 webp，已 trim 過）**：`cp` 到 `tools/streaming-covers/assets/{TARGET}.webp`
- **副檔名 .png / .jpg / .jpeg**：`cwebp -q 90 {TRIMMED_SRC} -o tools/streaming-covers/assets/{TARGET}.webp`
- **沒 cwebp**：退一步 `magick {TRIMMED_SRC} -quality 90 tools/streaming-covers/assets/{TARGET}.webp`
- **gif / 其他**：跟使用者確認，通常封面素材沒理由是 gif

### TARGET 命名規則

| 用途 | 檔名規則 | 範例 |
|---|---|---|
| **bgSrc** 背景圖 | `{vol}.webp` | `912.webp` |
| **logoSrc** 主題 logo | `game_{slug}_logo.webp` / `tool_{slug}_logo.webp` | `game_sonic_heroes_logo.webp` / `tool_lmstudio_logo.webp` |
| **heroSrc** 立繪 | `vtuber{X.Y}-{idx}.webp`（跟 VTuber 模型版本走，idx 通常 0） | `vtuber5.0-0.webp` |

slug：把使用者給的名稱小寫、空格換 `_`，例 `"Sonic Heroes"` → `sonic_heroes`。

立繪如果使用者沒指定版本，**問一次**（「這是 V 幾立繪？」），不要自己亂猜。

寫進 JSON 時用相對路徑：`"heroSrc": "assets/vtuber5.0-0.webp"`。

### 3. 不存在 / 找不到
列出 `tools/streaming-covers/assets/` 給使用者選，或問清楚。

## defaults 補完

JSON 一定要有的欄位（如果使用者沒給，按下面補）：

```json
{
  "vol": <user>,
  "titleMain": <user>,
  "titleSub": "",
  "episode": null,
  "categories": "",
  "artist": "",
  "streamTime": "",
  "logoSrc": "",
  "theme": "azure",
  "mode": "light",
  "heroSrc": "assets/vtuber4.0-0.webp",
  "bgSrc": "",
  "bgEffect": "",
  "vtuberLogoSrc": "assets/vtuber-logo.png",
  "card": "d"
}
```

- `heroSrc` 預設用 `vtuber4.0-0.webp`（最新版本），但**最好問一次**確認立繪是哪一版
- `vtuberLogoSrc` 幾乎永遠是 `assets/vtuber-logo.png`，不用問
- `bgEffect` 通常 `"soft"`（當 bgSrc 是遊戲畫面截圖時很適合）；如果 bg 已經是處理好的封面背景，留 `""`
- 不要寫 `bgTint`、`logoSrc:""` 等空欄位除非必要

## 完整執行步驟

1. **收集資訊**：
   - vol + titleMain 沒給先追問
   - heroSrc 沒給的話問「立繪用哪一版？」（給可選清單 `ls tools/streaming-covers/assets/vtuber*`）
   - bgSrc / logoSrc 是選填，沒給就不放
   - 其他用 defaults

2. **檢查衝突**：
   - `ls tools/streaming-covers/data/cover_{padded}.json` — 已存在就停下來問使用者「要覆蓋還是換 vol」
   - 4 位數補零：`String(vol).padStart(4, '0')`，例 `vol=912` → `0912`

3. **搬素材**：依「素材搬運規則」處理 heroSrc / bgSrc / logoSrc。每搬一個檔 `ls -la {dest}` 確認。

4. **寫 JSON**：用 Write 工具寫 `tools/streaming-covers/data/cover_{padded}.json`。內容嚴格按 defaults + 使用者覆寫。空欄位用 `""` 或 `null`，不要省略。

5. **渲染**：
   ```bash
   node tools/streaming-covers/render.mjs <vol>
   ```
   等到看到 `✓ vol N → static/images/streaming/streaming_NNNN.webp` 才算 OK。
   失敗訊息常見：
   - `Chrome 找不到` → 提示使用者裝 Chrome 或設 `CHROME_BIN`
   - `cwebp 沒裝` → 會 fallback PNG，但建議 `brew install webp`

6. **回報**：簡潔列出：
   - JSON：`tools/streaming-covers/data/cover_NNNN.json`
   - 封面：`static/images/streaming/streaming_NNNN.webp`
   - 預覽指令（給使用者自己看）：
     ```
     npx serve tools/streaming-covers
     # 開 http://localhost:3000/template.html?vol=<vol>
     ```
   - **不要自動 git commit**，等使用者明確要求

## 工具補充：預覽 / 微調

如果使用者看完成品說要「再調一下」：
- 改 JSON 對應欄位 → 重跑 `node tools/streaming-covers/render.mjs <vol>` 覆蓋舊 webp
- 要看四個版型差異 → 開 `npx serve tools/streaming-covers` 看 `/index.html`，再用 `?card=a|b|c|d` 切

如果使用者要改設計（字級、顏色、layout）：
- 動 `tools/streaming-covers/cover-cards.jsx` 對應 `CardA/B/C/D`
- 動 `tools/streaming-covers/lib/covers.css` 改主題 / 陰影 / fx layer
- 動 `tools/streaming-covers/cover-atoms.jsx` 改 Tag / YuutaMark 等共用元件

## 常見錯誤排查

- `cwebp: command not found` → 改用 `magick`；都沒有時請使用者裝（`brew install webp` / `brew install imagemagick`）。
- `magick: command not found`（跑 trim.mjs 失敗）→ 提示裝 ImageMagick（`brew install imagemagick`）；或跟使用者確認檔案已預先 trim 過，跳過該步。
- 立繪縮得超小 / 只佔角落 → 很可能是 hero 沒 trim、外圍透明 padding 沒裁掉，重新 trim 一次即可。
- 立繪不見了 / 跑掉位置 → 確認 heroSrc 路徑正確且檔案存在（`ls -la tools/streaming-covers/<path>`）。
- 4 位數補零搞錯 → JSON 檔名永遠是 `cover_<padStart(4,'0')>.json`，但 JSON 內 `"vol"` 欄位是純整數不補零。
- 背景圖沒出來 → 確認 bgSrc 寫對；空字串會 fallback 到 theme 漸層（看起來不一樣）。
- 渲染出來標題位置怪 → 通常是 titleMain 太長，建議把長句拆 titleMain + titleSub 兩段。

## 不要做的事

- 不要碰 `tools/streaming-covers/cover-cards.jsx` 等設計檔，除非使用者明確要改設計。
- 不要把素材檔丟到 `static/images/streaming/`（那是輸出資料夾，由 render.mjs 管）。
- 不要 commit。
- 不要改其他集的 `cover_NNNN.json`，這個 Skill 只負責「新增」。
- 不要動 `tools/streaming-covers/out/`（那是手動測試 / 之前的暫存截圖）。
