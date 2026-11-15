---
title: "【#程式】Vol. 25: 中秋特別企劃－Unity 遊戲製作實況：來做個烤肉遊戲吧！"
date: "2021-09-21"
author: "悠太翼"
thumbnail: "/images/posts/streamings/25.webp"
tags: ["程式實況", "直播影片"]
excerpt: "中秋節就是要烤肉，不過因為疫情的關係今年無法去烤肉，那我們就來利用 Unity 做個烤肉遊戲過過乾癮吧！"
duration: "3:51:26"
---
<iframe width="560" height="315" src="https://www.youtube.com/embed/uB2Y9ZWXuS4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

中秋節就是要烤肉，不過因為疫情的關係今年無法去烤肉，那我們就來利用 Unity 做個烤肉遊戲過過乾癮吧！

## 🛡️工具資訊🛡️
- 遊戲引擎: Unity（Unity Hub、2020 LTS） https://unity.com/
- 套件管理: NuGetForUnity https://github.com/GlitchEnzo/NuGetForUnity
- C# 函式型程式設計: LanguageExt https://github.com/louthy/language-ext
- Reactive Programming: UniRx https://github.com/neuecc/UniRx
- async/await: UniTask https://github.com/Cysharp/UniTask
- 自動 GetComponent: unity-auto-attach-component-attributes https://github.com/Nrjwolf/unity-auto-attach-component-attributes
- 繪圖: Photoshop https://www.adobe.com/tw/products/photoshop.html

## 🛡️遊戲素材來源🛡️
- 肉：猫島羽依 https://twitter.com/nekosimayui
- 烤肉音效：Freesound https://freesound.org/
- 背景音樂與音效：魔王魂 https://maou.audio/
- 字體：Noto Sans https://fonts.google.com/noto/specimen/Noto+Sans+TC

## 🛡️直播與影片連結🛡️
- 原直播：[https://yutaii.run/v/25](https://yutaii.run/v/25)

## 🛡️時間軸🛡️
- 00:00:00 Opening
- 00:01:44 打招呼，雙螢幕軟體出狀況
- 00:04:23 介紹新網站：直播紀錄、棉花糖連到影片
- 00:06:19 素材介紹：Photoshop 畫的肉、猫島媽媽的肉
- 00:08:22 介紹 Unity 與 Unreal，開新專案
- 00:12:33 裝套件：NuGet、LanguageExt、UniRx 等
- 00:20:54 匯入素材，建場景擺背景和桌子
- 00:27:44 用 Z 值排火爐、盤子、垃圾桶
- 00:33:15 放肉，寫 Meat 程式做拖曳
- 00:43:36 修正座標、做成 Prefab，聊 Observable
- 00:51:06 做生肉機 MeatMaker
- 01:00:06 肉拿走才再生一塊：Dispose 與 AddTo
- 01:11:17 放開就移除，火爐要碰撞判斷
- 01:19:43 改用 Trigger 判斷火爐、複製四台生肉機
- 01:28:47 開始烤肉：定義肉的狀態
- 01:33:39 記錄兩面烤的秒數：生、熟、焦
- 01:42:38 翻面，換生熟焦三張圖
- 01:54:05 烤肉音效、離開火爐的計時誤差
- 02:01:30 加客人和分數 UI
- 02:05:36 寫 Customer：依熟度給分
- 02:12:32 讓客人吃肉，火爐和客人分開判斷
- 02:22:24 客人表情：開心和生氣
- 02:31:23 垃圾桶，放錯地方就回到火爐
- 02:39:56 做標題畫面 TitleScene
- 02:46:08 按鈕換場景，加魔王魂 BGM
- 02:49:46 客人音效，丟垃圾的音效播不出來
- 03:00:18 一分鐘計時器、PlayerPrefs 存最高分
- 03:08:52 做結果畫面：Retry、回標題
- 03:16:55 顯示剩餘時間，完整試玩
- 03:23:07 寫 ScoreViewer 顯示最高分
- 03:30:00 補上丟垃圾的音效
- 03:35:17 加版權字樣，換 Noto Sans 字型
- 03:40:37 修小問題、再玩一次，可 Build 的平臺
- 03:43:47 唸綠界，遊戲之後會上傳
- 03:50:13 Ending
