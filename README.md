# 悠太翼 YUUTA TSUBASA · Personal Site

VTuber 悠太翼的個人網站原始碼，使用 SvelteKit + static adapter，部署在 GitHub Pages（`yuuta-tsubasa.studio` / `yuutatsubasa.github.io`）。

## 技術棧

- **SvelteKit** + `@sveltejs/adapter-static`（純靜態 prerender）
- **Vite** 開發伺服器
- 內容：`src/posts/*.md` （markdown frontmatter）+ `src/lib/data/*.js`（資料定義）
- 樣式：原生 CSS 變數 + scoped styles，無 UI framework
- 部署：`gh-pages` 推到 `gh-pages` 分支

## 開發

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build & 部署

```bash
npm run build        # 產生 dist/
npm run preview      # 本地預覽 production build
npm run deploy       # build + 推到 gh-pages 分支（GitHub Pages 自動上線）
```

> 推到 `main` **不會**自動部署，需要手動跑 `npm run deploy`。

## 區塊架構

首頁 (`src/routes/+page.svelte`) 按順序拼起這些 section（順序定義在 `src/lib/data/nav.js`）：

| # | Section | 資料來源 |
|---|---|---|
| 00 | Hero | `src/lib/data/profile.js` |
| 01 | About | `src/lib/data/profile.js` |
| 02 | Schedule | `src/lib/data/schedule.js` |
| 03 | Archive | `src/posts/streaming_*.md` |
| 04 | Avatars | `src/lib/data/versions.js` |
| 05 | Gallery | `src/posts/fan_drawing_*.md` |
| 06 | Log | `src/posts/log_*.md` |
| 07 | Connect | `src/lib/data/socials.js` |

獨立頁面：
- `/archive` · `/archive/[id]` — 直播存檔列表 / 內頁
- `/gallery` · `/gallery/[slug]` — 粉絲繪圖列表 / 內頁
- `/log` · `/log/[slug]` — 心得 / 作品 / LeetCode 筆記

## 加內容

### 新增直播存檔

在 `src/posts/` 建 `streaming_<YYYYMMDD>.md`（檔名決定排序）：

```yaml
---
title: "Vol. XXX 直播標題"
date: "2025-03-12"
youtube: "https://www.youtube.com/watch?v=..."
duration: "2:30"       # 可選，覆寫從 YT 抓的長度
tags: ["TAG_A", "TAG_B"]
chapters:
  - { time: "0:00",  title: "開場" }
  - { time: "12:30", title: "正題" }
---
心得正文 markdown…
```

> 影片資料**不**接 YouTube Data API，所有 metadata 走 markdown frontmatter。

### 新增粉絲繪圖

`src/posts/fan_drawing_<slug>.md`：

```yaml
---
title: "作品名"
artist: "繪師名"
date: "2025-02-14"
image: "/images/gallery/xxx.webp"
links:
  - { label: "原推文", url: "..." }
---
（可選）描述
```

圖檔放到 `static/images/gallery/`。

### 新增 LOG 條目（心得 / 作品 / LeetCode）

`src/posts/log_<slug>.md`：

```yaml
---
title: "標題"
date: "2025-03-12"
time: "14:00"               # 可選
category: "project"         # "project" / "review" / "solve"
excerpt: "一兩句摘要"
thumbnail: "/images/posts/xxx.webp"  # 可選
tags: ["主題標籤"]
stack: ["Svelte", "TypeScript"]      # project 用，自動納入 tag cloud
links:                                # project 用
  - { label: "DEMO", url: "..." }
  - { label: "SOURCE", url: "..." }
meta:
  status: "RELEASED"        # project
  phase: "v1.0"             # project
  # difficulty: "MED"       # solve
  # lang: "Python"          # solve
  # runtime: "O(n)"         # solve
  # rating: "8.5/10"        # review
  # platform: "Switch"      # review
  # hours: "42 HR"          # review
---
markdown 正文，h2 會自動產生右側 TOC
```

`caseNum`（#001 等編號）依日期由舊到新自動派發，不需要手動編。

### 改首頁區塊順序 / 章節編號

編輯 `src/lib/data/nav.js`。`SectionHead` 元件用 `id` 自動從 NAV 算出 `"06 / 07"` 編號，所以不會出現魔術數字。

## 其他自動化

- `sitemap.xml` 自動列出所有 archive / gallery / log 內頁
- `rss.xml` 整合三類內容，加 `[ARCHIVE]` / `[GALLERY]` / `[LOG]` 前綴
- OG 卡片：靜態 `static/images/og-card.png`（手動產，模板在 `__DESIGN__/`）
- favicon / `site.webmanifest`：放在 `static/`

## 目錄速覽

```
src/
  lib/
    components/
      atoms/        # 共用小元件（Corners, Dot, VLabel, LogRow…）
      chrome/       # Nav, Footer 等版面框架
      sections/     # 首頁各區塊（Hero, About, Log…）
      Seo.svelte    # per-page meta tags + JSON-LD
    data/           # 結構化資料（nav, profile, schedule…）
    stores/         # 跨頁狀態（filters 等）
    styles/         # global.css
    utils/          # reveal, loadPosts…
  posts/            # markdown 內容（streaming_/fan_drawing_/log_）
  routes/           # SvelteKit 路由
static/             # 靜態資產（圖片、favicon、og-card 等）
__DESIGN__/         # Claude Design 提供的設計參考（不會被 build 帶進去）
```
