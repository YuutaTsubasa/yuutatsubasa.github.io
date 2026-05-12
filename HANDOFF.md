# Site Redesign Handoff

**Status:** 2026-05-13 — Phase 1 complete, content tuning in progress.
**Branch:** `wip/design-overhaul`
**Source machine:** Linux (Arch) + Claude Code Opus
**Next machine:** Pick up where we left off via this doc.

---

## 起手三件事（在新機）

```bash
git clone https://github.com/YuutaTsubasa/yuutatsubasa.github.io.git
cd yuutatsubasa.github.io
git checkout wip/design-overhaul
npm install
npm run dev   # http://localhost:5173/
```

從雲端把 `__DESIGN__/` 解壓到專案根目錄（已 gitignore，僅作設計參考，不影響執行）。

---

## 進度全景

| Phase | 內容 | 狀態 |
|---|---|---|
| **Phase 1** | 設計骨架移植：7 個 section + Chrome + 設計 token + 自訂游標 + 時間感知 Schedule | ✅ 完成 |
| **Phase 1.5** | 與使用者一起「一個 section 一個 section」逐項調整內容（取代 Claude Design 假資料） | 🔄 進行中（Hero 完成，下一個 About） |
| **Phase 2** | `/posts` 系統整併進 Videos / Gallery（粉絲繪畫 → Gallery，影片 → Videos），移除 `/posts` 路由與 Tailwind | ⏳ 未開始 |
| **Phase 3** | RSS / sitemap 更新對應新結構，全站完全移除 Tailwind 依賴 | ⏳ 未開始 |

---

## 技術決策（不要回頭推翻）

| 決策 | 原因 |
|---|---|
| 純 CSS 變數 + scoped Svelte CSS（新元件不用 Tailwind） | 使用者選的方向，盡量貼近 Claude Design 原 React 行內 style 的精神 |
| `/posts` 暫時保留 Tailwind | 過渡期，等 Phase 2 整併時一次重寫 |
| 自訂游標只在首頁 `/` 顯示（`+layout.svelte` 用 `$page.url.pathname === '/'` 判斷） | 避免污染 `/posts` 舊頁面 |
| 版本歷史搬離原 `/about` 子頁，整合到首頁 Avatars section | 使用者選擇 |
| Hero 大圖 `static/images/yuuta-figure-1.jpg`（22 MB）未壓縮 | 之後可用 cwebp/sharp 壓成 webp（已知 todo） |
| Schedule 改用 ISO datetime + durationMinutes，自動判斷 live/upcoming/past | 使用者明確需求 |
| Avatars 4 個版本 V1.0&1.5 / V2.0 / V3.0 / V4.0；V1.0&1.5 合併因 staff 共用 | 對應原 `/about` 結構 |
| 社群只保留 X / YouTube / Twitch（含 Twitch；handle 是 `yuutatsubasa` 無底線） | 使用者一度擴成 8 個又回到 3 個 |

---

## 程式結構速查

```
src/
├── app.html                          # 載入 Google Fonts、FontAwesome、GA
├── routes/
│   ├── +layout.svelte               # 路由判斷：home 用新 Chrome，其他用舊 Tailwind nav
│   ├── +page.svelte                 # 首頁，依序組合 7 個 section
│   ├── +page.server.js              # 空殼（Phase 1 暫時不載 posts）
│   └── posts/...                    # 保留現狀，Phase 2 再動
├── lib/
│   ├── components/
│   │   ├── atoms/                   # Corners / Panel / Tag / SectionHead / ScanBar / HexAvatar / Dot / Tele / VLabel / Cursor
│   │   ├── chrome/                  # Ticker / Nav / LeftRail / RightRail
│   │   └── sections/                # Hero / About / Schedule / Videos / Avatars / Gallery / Connect
│   ├── data/                        # 所有真實 / 假內容資料在這
│   │   ├── nav.js                   # 導覽列項目
│   │   ├── socials.js               # 3 個社群（含 primary 標誌）
│   │   ├── profile.js               # 個人資料（Hero + About 用）
│   │   ├── streamTags.js            # 5 個直播類型 tag + 顏色
│   │   ├── schedule.js              # ⭐ 時間感知排程資料（ISO 格式）
│   │   ├── videos.js                # 影片庫（假資料）
│   │   ├── gallery.js               # 繪圖收藏（假資料）
│   │   ├── versions.js              # 4 個化身版本（真實資料）
│   │   └── resources.js             # 致謝清單 10 項（真實資料）
│   ├── stores/
│   │   ├── active.js                # 當前 section（scroll spy 用）
│   │   └── now.js                   # 每 60 秒更新一次的「現在」store
│   ├── styles/
│   │   ├── tokens.css               # 顏色、字體、陰影 CSS 變數
│   │   ├── animations.css           # scanline / pulse / ticker / glitch 等
│   │   └── global.css               # 全域 reset、scrollbar、cursor、按鈕等
│   └── utils/
│       └── schedule.js              # weekDays / streamStatus / currentLive / nextUpcoming 等
└── posts/...                        # 17 個 fan_drawing 的 markdown，Phase 2 再處理

static/images/
├── logo-knight.png                  # 新 logo（從設計檔）
├── yuuta-figure-1.jpg               # Hero 大圖（22 MB，待壓縮）
├── about/                           # 4 個版本的歷史圖片（Avatars section 用）
└── posts/                           # 既有粉絲繪畫圖
```

---

## Phase 1.5 — Section 逐項調整進度

### ✅ 已完成的調整

**全域**
- `KNIGHT-ZX` callsign → `VTUBER` (profile.callsign / Nav / About 副標 / Connect 結尾)
- `V2.0` site version → `V5.0` (Nav / Connect footer / Ticker；化身版本 V2.0 沒動)
- `DOSSIER ID :: KNT-ZX-04` → `DOSSIER ID :: VTB-04`

**Hero (00 START)**
- 背景 → `yuuta-figure-1.jpg`（立繪 1）
- `CALLSIGN` 欄改成 `ROLE`
- 身份卡 8 行 Tele：ROLE / DEBUT / ORIGIN / LANGUAGE / CONTENT / AGENCY / PLATFORM / FANBASE（值都已填使用者提供的：VTUBER / 2021.07.31 / TAIWAN / TRADITIONAL CHINESE / CODING · GAMEPLAY · SINGING · TALKING · OTHERS / ULTIMATE-UTOPIA / YOUTUBE · TWITCH / TSUBASA-FRIEND）
- 底部 ScanBar：`LIVE2D LOAD 75%`（寫死）→ `SIGNAL` 動態跳動（81~99%）
- LIVE pill 從 `SCHEDULE` 動態抓 → LIVE 時紅 / UPCOMING 時青 / 沒場次時不顯示；可點擊跳 stream URL

**Avatars (04)**
- 4 個版本 V1.0&1.5 / V2.0 / V3.0 / V4.0，credits 完整（繪師 / Live2D 模型師 / 3D 模型師）+ X 連結
- Slab viewport 改成橫向藝術圖友善（object-fit: contain）
- 預設選定最新版本 V4.0；timeline 卡片等高
- 圖片可從 `gallery` 陣列切換縮圖

**Connect (06)**
- 3 個社群卡：X / YouTube / Twitch（handle 改成無底線的 `yuutatsubasa`）
- 加上 ACKNOWLEDGEMENTS 資源清單（10 項，從原 /about 撈）
- RightRail 只顯示 `primary: true` 的 3 個社群

**Schedule (02)**
- 改用 ISO datetime 結構，自動判斷當週 + LIVE 狀態
- TODAY / LIVE / ENDED 標籤動態顯示
- SET REMINDER 按鈕依狀態變文字：LIVE→`GO TO STREAM` / UPCOMING→`SET REMINDER` / PAST→`WATCH ARCHIVE`
- 點擊跳 stream URL

### ⏳ 還沒走過 / 待跟使用者確認的調整

**About (01)** — 全部還是 Claude Design 假資料
- `bio` 兩段：白銀盔甲・程式騎士的奇幻描述
- `likes` / `dislikes` Tag 列表
- `stats` 6 格：HEIGHT 178CM / ORIGIN TAIWAN / BIRTHDAY 03.21 / ELEMENT AZURE / WEAPON BLADE/KEYS / BLOOD AB+
- 程式碼 block 是寫死的 `KnightOfCode` class
- 三視圖暫用 `character.webp`（沒有真的三視圖）

**Videos (03)** — 全部假資料
- 6 筆假影片 + 5 個 type filter
- 等 Phase 2 接 markdown posts 才會有真資料

**Gallery (05)** — 全部假資料
- 6 筆 hue/accent 色塊（沒有真實圖片）
- 等 Phase 2 接 `posts/fan_drawing_*.md` 才會有真資料

**Connect (06) — 結尾文案** — 「The blade rests, but the keys never sleep」是奇幻味文字，沒動

**Ticker（最頂跑馬燈）** — 還是 Claude Design 假內容
- 使用者明確說「跑馬燈最後改」，因為內容會引用 Schedule / Videos 的訊息

**Hero — MISSION BRIEF / VITALS** — 還是奇幻文字（騎士征途、HP/MP/EXP 寫死數字）

**Hero — 右側 HUD 標記**（HEAD TARGET LOCKED / ARMOR AZURE-PLATE INTEGRITY 98.3%）— 是純裝飾，使用者沒提，先留著

---

## 使用者偏好（從對話累積）

- **節奏**：一個 section 一個 section 改，不要一次全動
- **務實 > 裝飾**：但裝飾性 HUD/角落括號等視覺元素保留無妨，純文字才會被質疑（如 KNIGHT-ZX、LIVE2D LOAD 假進度條等）
- **選擇傾向**：被問選項時，常選「動態 / 真實 / 簡潔」這條路
- **跑馬燈 / 內容引用**：先處理被引用的資料源，再處理跑馬燈
- **回答短 OK**：簡短指令型回應，不需大篇敘述

---

## 已知 todo / 後續清單

1. 22 MB `yuuta-figure-1.jpg` 壓成 webp（用 `cwebp -q 80` 或 sharp）
2. 棉花糖社群 icon 是通用 placeholder（FA 與 Simple Icons 都沒官方）— 若 8 社群要回來再處理
3. Phase 2：`fan_drawing_*.md` 結構化進 GALLERY；YouTube 影片資料進 VIDEOS（可能要 YouTube Data API 抓）
4. Phase 3：RSS / sitemap.xml 對應新內容結構（目前還是讀 `loadPosts`）
5. `/posts` 路由要不要保留？等 Phase 2 決定

---

## Phase 1.5 接下來推薦的下一步

「跟使用者一起去 About section 改」。
打開 `src/lib/components/sections/About.svelte` 對照 `src/lib/data/profile.js`，把：
- `bio` 兩段奇幻描述改成使用者實際想呈現的自介
- `likes` / `dislikes` 列表
- 6 格 stats（移除奇幻欄位 ELEMENT / WEAPON，可能換成 DEBUT / FANBASE 等延伸資訊）
- pre 區塊的程式碼示意要保留還是改

問使用者一個 section 一個 section 走，會比較順。
