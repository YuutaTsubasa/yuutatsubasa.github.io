---
name: add-gallery
description: 新增一張 Gallery 圖到 yuutatsubasa.github.io。觸發條件：使用者要「加圖」「新增 gallery」「加一張粉絲繪 / 委託繪 / Skeb / 個人繪」「把這張圖加到 gallery」等。會把本機圖檔搬到 static/images/posts/、產生對應 src/posts/*.md、跑 npm run thumbs。
---

# add-gallery — 新增 Gallery 圖片

## 任務目標
把使用者本機準備好的一張圖（或多張同一筆）加到 Gallery：
1. 圖檔搬/轉成 `static/images/posts/{prefix}_{YYYY-MM-DD}[_{hash4}][_{n}].{ext}`
2. 產生 `src/posts/{prefix}_{YYYY-MM-DD}[_{hash4}].md`，frontmatter + 內文都按下面的模板
3. 跑 `npm run thumbs` 生 600px 縮圖

主目錄是 `/Users/maplewing/Documents/Current/Repos/yuutatsubasa.github.io`。

## 需要從使用者收集的資訊
以下欄位若使用者一次給齊就直接做；缺哪個就只追問缺的那幾項（用 AskUserQuestion 或單句問句皆可）：

| 欄位 | 說明 | 範例 |
|---|---|---|
| **分類** | 4 選 1 | `fan` / `self` / `commission` / `skeb` |
| **作者顯示名** | Gallery 上會顯示的繪師名 | `あい` / `魯魯` / `沐可.C` |
| **日期** | YYYY-MM-DD，預設今天 | `2026-05-21` |
| **主圖路徑** | 本機絕對或相對路徑 | `~/Downloads/foo.png` |
| **追加圖**（選填） | 同一筆有多張圖時的額外圖路徑 | 陣列 |
| **來源連結** | X 推文 / Skeb 作品頁 / 其他 | URL |
| **作者社群連結**（選填） | 通常是 X | URL |
| **Skeb 補充欄位**（skeb 限定） | Skeb 作品頁 URL（即「來源連結」） | URL |

「今天」是 `2026-05-21`（從 currentDate；每次執行請以實際 currentDate 為準）。

## 分類對照表（直接套）

| category | 檔名 prefix | 中文 tag | title 樣式 | excerpt 樣式 |
|---|---|---|---|---|
| `fan` | `fan_drawing_` | `翼友作品` | `悠然翼繪 by {author} {YYYY/MM/DD}` | `<u>{author}</u>繪製的粉絲繪。` |
| `self` | `self_drawing_` | `個人繪` | `個人繪 {YYYY/MM/DD}` | `個人繪製的作品。` |
| `commission` | `commission_` | `委託繪` | `委託繪 by {author} {YYYY/MM/DD}` | `<u>{author}</u>繪製的委託作品。` |
| `skeb` | `skeb_` | `Skeb` | `Skeb by {author} {YYYY/MM/DD}` | `<u>{author}</u>於 Skeb 上繪製的委託作品。` |

特殊情況：如果是 V 系列立繪委託（例：V5.0 立繪），title 改成 `V{X.X} 立繪 by {author} {YYYY/MM/DD}`，excerpt 自由發揮。這種要主動跟使用者確認。

## 檔名規則

基本：`{prefix}{YYYY-MM-DD}.{ext}`
副檔名：webp 優先（png / jpg 都先轉 webp）；gif 維持 gif。

衝突處理：
- 同日同分類已存在 → 加 hash4 後綴：`commission_2026-05-21_a3f2`
  - hash4 = `node -e "console.log(require('crypto').randomBytes(2).toString('hex'))"` 之類隨機 4 hex
- 多張圖同一筆 → 主圖 `{base}.webp`，第 2 張起 `{base}_2.webp`、`{base}_3.webp`…

檢查衝突的方式：`ls static/images/posts/{prefix}{date}*` 看有沒有檔。

## 圖檔處理

優先用 `cwebp` 轉檔（macOS 通常用 `brew install webp` 安裝）。如果沒有 cwebp，退一步用 ImageMagick (`magick` 或 `convert`)。

- 原檔已是 `.webp` → 直接 `cp` 過去
- 原檔是 `.gif` → 直接 `cp` 過去（保留動畫，副檔名留 `.gif`）
- 原檔是 `.png` / `.jpg` / `.jpeg` → 轉 webp：
  - `cwebp -q 90 SRC -o DEST.webp` （優先）
  - 或 `magick SRC -quality 90 DEST.webp`
- 其他格式 → 跟使用者確認

執行前先 `ls -la {SRC}` 確認檔案存在 + 大小合理；萬一檔太大（> 5 MB）提醒一下使用者。

## Markdown 模板

`src/posts/{filename}.md` 內容（注意：thumbnail 永遠是「主圖」的路徑；多圖時第 2+ 張用 markdown image 寫在內文）：

```markdown
---
title: "{TITLE}"
date: "{YYYY-MM-DD}"
author: "{AUTHOR}"
thumbnail: "/images/posts/{filename}.{ext}"
tags: ["{TAG_ZH}"]
excerpt: "{EXCERPT}"
---
{EXCERPT}

{EXTRA_IMAGES_BLOCK}

{SOURCE_LINKS_BLOCK}
```

### EXTRA_IMAGES_BLOCK
有追加圖時插入（每張一段 + 標題說明，可自行命名或問使用者）：
```markdown
另一個版本：

![{ALT_TEXT}](/images/posts/{filename}_2.webp)
```
沒有就整段拿掉（含前後空行）。

### SOURCE_LINKS_BLOCK
依分類組合：

- **fan**：
  ```
  原推文：[{url}]({url})
  ```
  （若使用者另外給「作者推特」也可以加一行 `作者推特：…`）

- **commission**：
  ```
  繪師 X：[{x_url}]({x_url})
  ```

- **skeb**：
  ```
  Skeb 作品頁：[{skeb_url}]({skeb_url})

  繪師 X：[{x_url}]({x_url})
  ```

- **self**：通常沒有來源連結，留空即可。

連結照原始 URL，不要省略 query/hash。

## 完整執行步驟

1. **收集資訊**：必填項目（分類 / 作者 / 日期 / 主圖路徑 / 來源連結）任一缺漏就追問；其他選填項目缺就略過。
2. **檢查圖檔**：`ls -la {主圖}` + `ls -la {額外圖}`。確認存在。
3. **算最終檔名**：依規則組出 `{filename}`（含必要的 `_{hash4}` 後綴）；同時計算 markdown 檔名（與圖檔同 base，副檔名 `.md`）。
4. **搬/轉圖**：執行 cwebp 或 cp。轉成功後 `ls -la static/images/posts/{filename}*` 確認檔案在了。
5. **寫 markdown**：用 Write 工具寫 `src/posts/{filename}.md`。內容嚴格照模板。
6. **跑 thumbs**：`npm run thumbs`。看到 `✓ thumbnails: N generated` 才算 OK。
7. **回報**：簡潔列出：
   - 新增的圖檔路徑
   - 新增的 markdown 路徑
   - Gallery URL 預覽（`/gallery/{slug}`，slug = filename 把底線換成連字號）
   - 建議下一步（例：「跑 `npm run dev` 預覽，沒問題再 commit」）
   - **不要自動 git commit**，等使用者明確要求

## 常見錯誤排查

- `cwebp: command not found` → 改用 `magick` 或 `convert`，都沒有就請使用者裝（`brew install webp`）。
- `ENOENT` 圖檔不存在 → 確認使用者給的路徑（含 `~` 展開）。
- `npm run thumbs` 失敗（找不到 ImageMagick）→ 提醒使用者裝 ImageMagick；但圖檔和 md 已經成功寫入，提示縮圖之後再補。
- 衝突檢查漏掉 → 在 Write markdown 前再 `ls src/posts/{filename}.md` 一次，已存在就改加 hash4 後綴重來。

## 不要做的事

- 不要碰 `src/posts/streaming_*.md` 或 `src/lib/data/gallery.js`（gallery.js 是 build-time 動態 glob 出來的，不用手改）。
- 不要 commit。
- 不要自作主張改 title / excerpt 樣式以外的 frontmatter 欄位（不要加 `category` 或其他自訂欄位，這個資料來源是檔名 prefix）。
- 不要動到 `static/images/posts/thumbs/`（由 `npm run thumbs` 全權管理）。
