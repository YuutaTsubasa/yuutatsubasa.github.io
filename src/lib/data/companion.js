// 陪伴模式（首頁 00 START 點進去的畫面）的資料。

// 可以選的化身。url 是網頁用的輕量版 VRM（原檔太大，不放網站）。
// 新造型的輕量版做好後加在這裡即可。
// scale：坐在椅子上的縮放（預設 SEAT.scale）；H05 是成人體型，軀幹比 H04 長約 1.3 倍，縮小一點才不會比椅子還大
export const COMPANION_MODELS = [
  { id: 'H04-B01', label: 'H04-B01', url: '/companion/models/H04-B01.vrm' },
  { id: 'H05-B01', label: 'H05-B01', url: '/companion/models/H05-B01.vrm', scale: 2.1 }
];

// 預設播放清單。玩家也可以自己加本機的音樂檔（只在這次瀏覽有效，不會上傳）。
export const COMPANION_PLAYLIST = [
  { title: 'Filtered Keys', artist: 'Yuuta Tsubasa · Suno AI', url: '/companion/music/filtered-keys.mp3' }
];

// 點角色時輪流說的話（草稿，請使用者改成自己的口吻）
export const COMPANION_LINES = [
  '嗨～今天也一起加油吧！',
  '要不要先喝口水？',
  '寫程式卡住的話，先休息一下再回來看，常常就想通了。',
  '番茄鐘開起來，我陪你專心 25 分鐘！',
  '欸，你也喜歡索尼克嗎？',
  '這首歌是我做的喔，喜歡的話可以一直放著。',
  '待辦清單寫好了嗎？一件一件來就好。',
  '休息時間到了就要真的休息喔。',
  '今天有哪件事做得不錯？說來聽聽。',
  '有空的話，來直播找我玩吧！'
];

// 角色在 Talkroom 椅子上的位置、坐姿與鏡頭。
// 座標是 Talkroom GLB 的場景座標；pose 是 VRM 正規化骨架的旋轉（弧度，XYZ）。
// 椅面頂端約 y=1.44；靠背前有兩顆抱枕（z 0.4–1.0），所以坐在抱枕前面、背靠抱枕，腳伸進書桌下。
export const SEAT = {
  // 大腿根部要落在的點（椅面上、抱枕前）；換模型時程式會依腿長自動對齊
  seat: [1.1, 1.54, 1.12],
  rotationY: 0,
  // 椅子以場景比例來說很大，角色要放大才坐得進去
  scale: 2.5,
  pose: {
    hips: [0, 0, 0],
    spine: [0.05, 0, 0],
    chest: [0.03, 0, 0],
    leftUpperLeg: [-1.45, 0.1, 0],
    rightUpperLeg: [-1.45, -0.1, 0],
    leftLowerLeg: [1.5, 0, 0],
    rightLowerLeg: [1.5, 0, 0],
    // 雙手往前放在桌緣（在瀏覽器裡用數值搜尋對到桌子位置）
    leftUpperArm: [-0.642, -0.812, -1.484],
    rightUpperArm: [-0.649, 0.762, 1.504],
    leftLowerArm: [0, -0.5, 0],
    rightLowerArm: [0, 0.5, 0]
  },
  camera: {
    // 從書桌前方、稍微偏右看過去，鍵盤在前景
    position: [2.2, 3.2, 7.2],
    target: [1.1, 2.35, 1.3],
    fov: 30,
    // 直式螢幕時沿視線往後拉的距離
    portraitPull: 2.5
  }
};
