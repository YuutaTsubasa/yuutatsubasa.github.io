---
title: "從零開始的 YouTube 聊天室 CSS 語法設定教學"
slug: youtube-chat-css
date: "2021-08-03"
time: "21:30"
category: workshop
excerpt: "看懂聊天室的網頁結構、用 DevTools 與 Stylebot 找出要改的地方、在 OBS 套上自訂 CSS，再用視覺化工具與樣板做出自己的聊天室 — Vol. 2 的直播講義。"
tags: ["CSS", "YouTube 聊天室", "OBS", "Stylebot", "Workshop", "教學"]
stack: ["CSS", "OBS", "Stylebot", "VS Code"]
streams: [2]
links:
  - label: "直播心智圖（Whimsical）"
    url: "https://whimsical.com/s-workspace717815/youtube-css-QtW9Rt8FisHbqpo3cSepEh"
  - label: "Stylebot（Chrome 擴充功能）"
    url: "https://chrome.google.com/webstore/detail/stylebot/oiaejidbmkiecgbjeifoejpgmdaleoha"
meta:
  status: "PUBLISHED"
  phase: "v1.0"
---

很多 VTuber、YouTuber 直播時的聊天室都很漂亮，這份講義整理 Vol. 2 直播教的做法：從完全不懂網頁，到能自己改聊天室的顏色、字型、動畫，或直接套別人做好的樣板。沒看直播也能照著做。

> 這是 2021 年 8 月的內容。YouTube 會改聊天室的網頁結構，下面的標籤與 class 名稱如果對不上，用第二節的方法重新找一次就好，做法本身不會變。

整場分成四個部分（也是直播用的[心智圖](https://whimsical.com/s-workspace717815/youtube-css-QtW9Rt8FisHbqpo3cSepEh)）：

1. **網頁結構**：聊天室也是網頁，先知道它長什麼樣子，才找得到要改的地方
2. **CSS 樣式設定方法**：用什麼工具找、在哪裡改
3. **CSS 樣式與樣板**：怎麼調出想要的效果，或直接套樣板
4. **進階：套用 JS**：用程式做樣式做不到的事

## 一、網頁結構

### 標籤與屬性

網頁用 HTML 寫成，HTML 是一組一組的**標籤**，一個開頭、一個結尾，中間夾著內容：

```html
<h1>悠太翼的網頁教學</h1>
<p>教學的內容可以放在這裡喔</p>
```

- `h1` 是一級標題，`p` 是段落。瀏覽器對這些標籤有**預設樣式**：標題字很大、段落是一般大小，字都是黑色。
- 標籤可以帶**屬性**，寫在開頭標籤裡，例如 `<h1 style="...">`、`<h1 class="red">`、`<h1 id="second-title">`。

一份網頁的骨架是 `html` 包住 `head`（網頁的資訊）和 `body`（網頁的內容），我們要改的都在 `body` 裡。

### CSS：選誰、套什麼樣式

CSS 的寫法只有兩件事：**選擇誰**，以及**它的樣式是什麼**。

```css
* { color: red; }          /* * 是所有人：全部的字變紅色 */
h1 { color: red; }         /* 只有 h1 標籤變紅色 */
.red { color: red; }       /* class 是 red 的人（用 . 開頭） */
#second-title { color: red; } /* id 是 second-title 的人（用 # 開頭） */
```

- 樣式寫在大括號裡，可以寫很多個，每一個用分號 `;` 結尾，所以寫成一行也沒關係。
- 一個標籤可以有好幾個 class，用空白隔開：`class="style-scope yt-live-chat-author-chip"`。

選擇器還可以組合，看懂別人寫的 CSS 時會用到：

| 寫法 | 意思 |
| --- | --- |
| `A B`（中間空白） | A 裡面（不管幾層）的 B |
| `A > B` | A 裡面**下一層**的 B |
| `A.b`（連在一起） | 既是 A、class 又有 b 的人 |
| `A[author-type="member"]` | 屬性 `author-type` 的值是 `member` 的 A（例如會員） |

### 用瀏覽器 DevTools 看聊天室的結構

1. 在直播頁面的聊天室右上角按「⋮」→「在彈出式視窗中開啟聊天室」。
2. 在想改的地方（例如觀眾名稱）按右鍵 →「檢查」，Chrome 和 Edge 都會打開 **DevTools**。
3. 你會看到一層包一層的標籤。YouTube 自己定義的標籤都是 `yt-` 開頭，例如觀眾名稱在 `yt-live-chat-author-chip` 裡的 `#author-name`。

改樣式時盡量選 `yt-` 開頭的標籤或它們的 class，比直接選 `span` 這種通用標籤安全。

## 二、CSS 樣式設定方法

### OBS 直接設定

1. 複製剛才彈出式聊天室的網址。
2. OBS 來源按「＋」→「瀏覽器」，網址貼上，寬高自己決定（例如 400 × 600）。
3. 對這個來源按右鍵 →「屬性」，下面的「**自訂 CSS**」就是寫樣式的地方。

試著把觀眾名稱改成紅色：

```css
#author-name { color: red !important; }
```

**沒反應的兩個原因**（直播裡卡最久的地方）：

- **被 YouTube 原本的樣式蓋過**：在值的後面加 `!important`，告訴瀏覽器「我的比較重要」。
- **選錯層**：顏色其實是設在更裡面一層。往內層找，直到改得動為止。剛才的例子就是要選內層的 `#author-name`，選外層的 `yt-live-chat-author-chip` 沒有效果。

### Stylebot 設定

一層一層挖很累，可以用 Chrome 擴充功能 **Stylebot**（Edge 也能裝 Chrome 線上應用程式商店的擴充）：

1. 在聊天室想改的地方按右鍵 → Stylebot。
2. 它會直接告訴你這一塊的選擇器，例如 `span.style-scope.yt-live-chat-author-chip`。
3. 可以直接用介面調顏色、背景、隱藏（「可見性：隱藏」會產生 `display: none`）等，下面的「代碼」會出現對應的 CSS。
4. 把代碼複製到 OBS 的自訂 CSS，**每一行後面加 `!important`**。在 Stylebot 裡有效，是因為擴充功能的樣式優先權最高；搬到 OBS 就要自己補上。

例如把聊天室最上面的標題列藏起來：

```css
yt-live-chat-header-renderer { display: none !important; }
```

**台主和一般觀眾的樣式要分開**：改完名稱顏色後，台主和觀眾可能變得一樣了。用 DevTools 比較兩者，會發現台主的 `#author-name` 多了一個 class `owner`，就可以另外指定：

```css
#author-name { color: #ffffff !important; }
#author-name.owner { color: #ffd600 !important; }
```

### 編輯器軟體：VS Code

CSS 越寫越多，不要只放在 OBS 裡，OBS 設定壞掉就全沒了。建議下載 [Visual Studio Code](https://code.visualstudio.com/) 存成 `.css` 檔：右下角把語言切成 CSS 後，打 `back` 就會列出所有 `background` 相關屬性，顏色也會直接顯示色塊。

## 三、CSS 樣式與樣板

### 先套 Preset：透明背景、藏掉多餘的東西

隱藏捲軸、上方標題、下方輸入框、背景變透明，這些幾乎每個人都要做，[YouTube Live Chat CSS Presets](https://obsproject.com/forum/resources/youtube-live-chat-css-presets.1182/) 已經整理好了，直接複製貼到自訂 CSS 就好。剩下沒藏到的區塊，用 Stylebot 選起來、設成隱藏，代碼一樣貼過去。

### 視覺化調整工具

[webcode.tools](https://webcode.tools/generators/css/keyframe-animation) 可以邊調邊看效果，調好複製產生的那一行 CSS，貼到你選好的對象底下：

- **邊框、背景顏色、透明度、文字陰影**：例如 `text-shadow: 2px 2px 4px #ff0000;`
- **文字字型**：屬性是 `font-family`，可以列好幾個，第一個顯示不出來就用第二個。字型的正式名稱可以從**小畫家**的字型選單看，複製後用雙引號包起來：

```css
body { font-family: "Source Han Serif TC Heavy", "Noto Sans TC", sans-serif !important; }
```

  推薦的免費字型：[思源宋體](https://source.typekit.com/source-han-serif/tw/)、[獅尾字體](https://max-everyday.com/2020/07/swei-b2-sans/)（多款，開源授權可商用）、[jf open 粉圓](https://justfont.com/huninn/)。

### Box Model

每一塊內容外面都有邊框（border）；內容到邊框的距離是**內距**（`padding`），邊框到外面的距離是**外距**（`margin`）。四個值的順序是上、右、下、左：

```css
#author-name { padding: 10px 8px 10px 8px !important; margin: 14px !important; }
```

### CSS 動畫

動畫分兩步：先用 `@keyframes` 定義，再指定誰要播。例如新留言進來時從 0.5 倍放大到原本大小：

```css
@keyframes scale {
  0%   { transform: scale(0.5); }
  100% { transform: scale(1); }
}
yt-live-chat-text-message-renderer { animation: scale 1s ease-out; }
```

把 `scale` 換成 `rotate`（`transform: rotate(0deg)` → `rotate(360deg)`），進場就會轉一圈。webcode.tools 的 Animation 頁有很多現成的可以挑。

### 樣板生成網站

全部自己做太累了，建議**先用樣板，再局部修改**：

- [Chat Styles](https://chat-styles.app/)（日文）：預覽畫面最接近真的聊天室，還能測會員和 Super Chat；它的預覽網址 `https://chat-styles.app/preview/preview.html` 可以暫時取代聊天室網址，用來測平常很難遇到的會員、SC 樣式。
- [Chat v2.0 Style Generator](https://chatv2.septapus.com/)（英文）

調好後複製整段樣板貼上，再用前面的方法加料：用 Ctrl+F 找 `font-family` 換成自己的字型、把動畫的定義和套用加在最後面。

樣板裡常見、但前面沒講到的寫法：

- `overflow: hidden`：內容超出範圍就藏起來。
- `--` 開頭的名稱和 `var(--...)`：**CSS 變數**。先在一個地方定義好顏色，其他地方用 `var()` 帶進來，改一個值就能整套換色，很適合做主題。

做不到的事：Super Chat 有好幾種顏色，但標籤裡沒有可以分辨金額等級的資料，所以沒辦法依 SC 等級套不同效果。

## 四、進階：套用 JS

想做樣式做不到的事（例如統計每個人講了幾句話），就要用 JavaScript。這部分給有程式基礎的人，操作不小心可能讓 OBS 當掉。

1. 對 OBS 的捷徑按右鍵 →「內容」，在「目標」的程式路徑後面加上參數：

   ```
   --remote-debugging-port=7999
   ```

   數字可以自己挑，盡量用不常見的四位數。

2. 用這個捷徑打開 OBS，再用瀏覽器開 `http://127.0.0.1:7999`，會列出 OBS 裡所有瀏覽器來源，點聊天室那個就能打開它的 DevTools。

3. 在 Console 裡就能寫程式。抓元素的方法跟 CSS 選擇器一樣：

```js
const names = document.querySelectorAll('yt-live-chat-author-chip #author-name');
const count = {};
for (const el of names) {
  const name = el.textContent.trim();
  count[name] = (count[name] ?? 0) + 1;
}
console.log(count);   // 每個人在目前畫面上講了幾句
```

注意聊天室只會保留最近的留言，所以這裡算的是「目前畫面上還留著的」。要做成觀眾排行榜，還需要定時重新計算（`setInterval`），並把結果寫回頁面上。

## 小複習

1. 網頁是由標籤和屬性組成的。
2. 用 DevTools 或 Stylebot 找出要改的那一塊是什麼標籤、class、id。
3. 在 OBS 瀏覽器來源的自訂 CSS 改樣式；改不動就加 `!important` 或往內層找。
4. 先套 Preset 和樣板，再用視覺化工具調出想要的字型、陰影、間距、動畫。
5. 改好的 CSS 用 VS Code 存起來。

## 作業

用今天的方法做一個自己的聊天室樣式，截圖（有動畫可以錄影片）發到 Twitter，加上 tag **#悠太作業**。
