---
title: "LM Studio Workshop"
slug: lm-studio-workshop
date: "2026-05-19"
time: "05:38"
category: workshop
excerpt: "從零安裝 LM Studio、下載第一個本機 LLM、跟它聊天、串接到自己的程式 — 一份直播跟著走的講義。"
tags: ["LLM", "本機 AI", "LM Studio", "Workshop", "教學"]
stack: ["LM Studio"]
streams: [911]
links:
  - label: "LM Studio 官網"
    url: "https://lmstudio.ai"
meta:
  status: "DRAFT"
  phase: "v1.0"
---

歡迎來到本場 Workshop！這份講義會帶你從完全沒碰過 LM Studio、到能在自己的電腦上跟一個本機 LLM 聊天、甚至從你寫的程式裡呼叫它。每一個步驟都有完整的文字說明，沒看直播也能自己跟著走。

## 為什麼要在本機跑 LLM

雲端的 ChatGPT / Claude / Gemini 很方便，但有幾個情境你會想自己跑：

- **隱私敏感**：聊天內容、文件、原始碼不會送出機器
- **無網路 / 通勤、出差**：飛機上、爛網路下還能用
- **無限次數**：跑 API 的錢省下來、實驗不心痛
- **客製化**：要做特殊人設、要嵌到自己 App、要 fine-tune 都自由

代價是：本機模型品質通常比雲端旗艦差一截，硬體要求也不低。但對日常輔助、prototype 來說，現在的本機模型已經夠用。

## 第一步：安裝 LM Studio

1. 開 [lmstudio.ai](https://lmstudio.ai)
2. 首頁下載按鈕會自動偵測 OS，點下去
3. 安裝完打開 App，首次啟動會看到歡迎畫面，可以略過或跑一次推薦設定

![lmstudio.ai 首頁的下載按鈕會依當前 OS 顯示對應版本](/images/posts/logs/lm-studio-workshop/01-install.webp)

## 第二步：下載第一個模型

![LM Studio 首次啟動會依你電腦的規格推薦一個入門模型，圖中是 Gemma 4 e4b](/images/posts/logs/lm-studio-workshop/02-discover.webp)

第一次打開 LM Studio 會看到 **Your first model** 歡迎畫面，它會依你電腦的規格自動推薦一個入門模型 — 圖中推薦的是 `google / gemma-4-e4b`（6.33 GB），你的可能是別的。

1. 看好推薦的模型大小，硬碟跟頻寬都夠就直接點 **Download**
2. 不想下這個（太大、想先看其他選擇）就點下面的 **Skip for now**
3. 等下載跑完（幾分鐘到十幾分鐘）就完成了

### Skip for now 之後想自己挑？

左側點 **Model Search**（放大鏡圖示）：

![Model Search 列出 Staff Picks，選一個會在右邊顯示 Download Options](/images/posts/logs/lm-studio-workshop/02b-model-search.webp)

1. 左側清單預設是 **Staff picks**（編輯精選），新手直接從上往下挑就行
2. 上方搜尋列也可以打關鍵字（像 `Qwen`、`Llama`）找特定家族
3. 點選模型後，右側 **Download Options** 那一列就是它幫你挑好的最佳版本，直接點下載即可

## 第三步：跟模型聊天

切到左側 **Chat**（對話泡泡圖示）：

1. 頂部下拉選單選剛下載的模型 → 點 Load Model
2. 等載入完成
3. 下方輸入框就能打字了

### 試試這題：翻譯索尼克官方介紹

來個能看出模型能耐的小任務 — 把 [SEGA 官網的索尼克角色介紹](https://sonic.sega.jp/SonicChannel/character/sonic.html) 翻成繁體中文。原文：

```
どんな場所も音速で駆け抜ける、史上最速のハリネズミ。

自由気ままが大好きで、曲がったことが大キライ。少し短気なところもあるけれど、困った人がいると放っておけない優しさも持っている。

人生は事件と冒険の連続だと考えており、周りのルールや常識よりも自分のルールに従って生きる。約束は必ず守り、裏切らない。自分の正義には正直。

普段は単なるお調子者でどんなピンチのときにも飄々（ひょうひょう）としているが、ここ一番では別人を思わせるほどの激しさと鋭さで、見る者を驚かせる。
```

實測 `google/gemma-4-e4b` 跑出來的版本：

![Gemma 4 e4b 翻譯結果：thought for 5.44 seconds、繁體保留、把「飄々」譯成「飄飄然」](/images/posts/logs/lm-studio-workshop/03-translate-demo.webp)

### 再試一題：辨識統一發票中獎號碼

如果你下載的模型有 **Vision** 能力（在 Model Search 模型介紹頁的 Capabilities 看得到 `Vision` 標籤，第二步推薦的 Gemma 4 e4b 就有），那就能丟圖給它看。

![統一發票 115 年中獎號碼表：特別獎、特獎、頭獎、二獎～六獎](/images/posts/logs/lm-studio-workshop/03b-vision-task.webp)

把上面這張圖右鍵存下來 → 拖進 LM Studio 對話框 → 輸入：

> 可以幫我把中獎號碼全部列出來嗎？

實測 `google/gemma-4-e4b` 跑出來的版本：

![Gemma 4 e4b 辨識結果：thought for 20 seconds，正確列出特別獎/特獎/頭獎三組，還補註二獎～六獎沒有具體號碼](/images/posts/logs/lm-studio-workshop/03b-vision-demo.webp)

### 對話技巧

- **第一個 prompt 要明確**：本機模型推理能力弱於雲端旗艦，越具體越好
- **跑題了就重啟對話**：右上角 New Chat 按鈕，比硬掰回來快
- **匯出對話**：可複製或存成 markdown

## 第四步：API Server 模式（進階）

LM Studio 內建一個 **OpenAI 相容**的 REST API server — 意思是你寫的所有支援 OpenAI API 的程式，幾乎不用改就能指到 LM Studio。

### 啟動 server

![LM Studio Developer 分頁的 Local Server 畫面：左側圖示切過去、上方 Status 切到 Running、Reachable at 顯示 http://127.0.0.1:1234，下方還能看到 OpenAI-compatible 跟 Anthropic-compatible 兩種 endpoint](/images/posts/logs/lm-studio-workshop/04-server.webp)

1. 左側點 **Developer** 圖示，切到 **Local Server** 分頁
2. 確認 **Loaded Models** 區裡有你想跑的模型（前面在 Chat 載過的會留著，沒有的話用右上 Load Model）
3. 上方的 **Status** 切到 `Running`（綠燈亮起就好了）
4. 旁邊的 **Reachable at** 就是 server 位址，預設是 `http://127.0.0.1:1234`（等同 `http://localhost:1234`）

> 順帶一提：下方 Supported endpoints 那一排能看到 `OpenAI-compatible` 跟 `Anthropic-compatible` 兩個選項 — LM Studio 同時兼容兩種 SDK，想接 Claude SDK 的人可以查 Anthropic 那一欄。本場 Workshop 後面 Continue 走的是 OpenAI 那條路。

### 實作：用 VSCode + Continue 把本機模型當 Copilot

[Continue](https://continue.dev) 是一個開源 VSCode 擴充，支援 OpenAI 相容 API — 我們把它接到剛剛跑起來的 LM Studio server，就有一個完全本機、不送任何資料出去的 Copilot 替代品。

#### 1. 安裝 Continue

1. 開 VSCode → Extensions（`Cmd+Shift+X` / `Ctrl+Shift+X`）
2. 搜尋 **Continue**，第一個結果就是 `continue.dev` 出的官方版（identifier `continue.continue`）→ 點 **Install**
3. 安裝完左側欄會多一個 Continue 圖示

![VSCode Extensions Marketplace 搜尋 Continue，第一個結果是 continue.dev 官方版本 (identifier continue.continue)](/images/posts/logs/lm-studio-workshop/05-continue-install.webp)

#### 2. 設定 Continue 連到 LM Studio

Continue 已經內建 LM Studio provider，全程點選就行：

![Continue 的 Add Chat model 對話框：Provider 選 LM Studio、Model 選 Autodetect、按 Connect](/images/posts/logs/lm-studio-workshop/06-add-model.webp)

1. 開 VSCode 左側 Continue 圖示打開面板
2. 點面板右上角的 **+** 按鈕 → 跳出 **Add Chat model** 對話框
3. **Provider** 選 `LM Studio`（Continue 會自動處理 endpoint，不用填網址）
4. **Model** 留 `Autodetect`（會抓你 LM Studio 目前載入中的模型）
5. 點 **Connect** — 完成

### 試試這題：請 Continue 生成一頁式履歷 HTML

把我的 VTuber 檔案丟給 Continue，請它做出一份 HTML 履歷 — 因為 Continue 接到的是 LM Studio 跑的本機模型，整個生成過程完全在你電腦裡，沒一筆資料外送。

1. 在 VSCode 新增一個空白的 `resume.html`
2. 左側打開 Continue → 對話框貼上下面這段 prompt
3. 用瀏覽器打開 `resume.html` 就是你的本機產履歷

> 請根據以下資料，幫我做一份單頁的 HTML 履歷網頁（HTML + CSS 寫在同一個 `.html` 檔），風格走科技感、深色底、藍色點綴：
>
> **個人資料**
> - 中文名：悠太翼
> - 英文名：YUUTA TSUBASA
> - 日文假名：ゆうた つばさ
> - 身份：VTuber，隸屬「終焉理想庭」
> - 出道日：2021.07.31
> - 生日：07.17
> - 出身地：台灣
> - 直播語言：繁體中文
> - 平台：YouTube、Twitch
> - 粉絲名：翼友（TSUBASA-FRIEND）
>
> **個人簡介**
> 大家好，我是悠太翼。以中文直播為主的台灣 VTuber，隸屬於【終焉理想庭】，2021 年 7 月至今。想到什麼就分享什麼——寫程式、跑 Sonic、推音遊、唱歌或是千奇百怪的日常，把好奇心一同帶上直播。
>
> **直播內容**
> Coding、Gameplay、Singing、Talking、Others
>
> **喜歡的事物**
> 音速小子索尼克、C#、Svelte、音樂遊戲、唱歌
>
> **不喜歡的事物**
> 傳奇競賽、芋頭、沒錢的時候、1 Miss

![Continue Agent 收到 prompt 後直接把產生的 HTML 寫進 resume.html — 左側對話框、右側檔案同步被填入](/images/posts/logs/lm-studio-workshop/07-continue-edit.webp)

## 延伸資源

- [LM Studio 官網](https://lmstudio.ai) — 下載與官方文件
- [Visual Studio Code](https://code.visualstudio.com/) — 文中用到的編輯器
- [Continue](https://www.continue.dev/) — VSCode 擴充，將 LM Studio 接成本機 Copilot
- [別再小看本地 AI！Gemma 4 + LM Studio 讓你的電腦變成超級離線 AI 工作站](https://youtu.be/r5M0W66xcGc?si=Pq9arLWp-kfb3Ozl) · PAPAYA 電腦教室 — 本場 Workshop 參考來源
