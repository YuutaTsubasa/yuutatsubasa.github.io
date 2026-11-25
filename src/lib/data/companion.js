// 陪伴模式（首頁 00 START 點進去的畫面）的資料。

// 可以選的化身。url 是網頁用的輕量版 VRM（原檔太大，不放網站）。
// 新造型的輕量版做好後加在這裡即可。
// scale：坐在椅子上的縮放（預設 SEAT.scale）；H05 是成人體型，軀幹比 H04 長約 1.3 倍，縮小一點才不會比椅子還大
export const COMPANION_MODELS = [
  { id: 'H04-B01', label: '正太盔甲版', url: '/companion/models/H04-B01.vrm' },
  { id: 'H05-B01', label: '青年盔甲版', url: '/companion/models/H05-B01.vrm', scale: 2.1 }
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
  '待辦清單寫好了嗎？一件一件來就好。',
  '休息時間到了就要真的休息喔。',
  '今天有哪件事做得不錯？說來聽聽。',
  '有空的話，來直播找我玩吧！'
];

// 手指自然微彎（不然手掌是直直張開的，看起來很呆）。
// VRM 正規化骨架靜止時手掌朝下：左手繞 Z 軸負方向、右手正方向就是往掌心彎；越往小指彎越多。
function relaxedFingers() {
  const pose = {};
  const fingers = [['Index', 0.22], ['Middle', 0.3], ['Ring', 0.38], ['Little', 0.46]];
  for (const [side, sign] of [['left', -1], ['right', 1]]) {
    for (const [name, base] of fingers) {
      pose[`${side}${name}Proximal`] = [0, 0, sign * base];
      pose[`${side}${name}Intermediate`] = [0, 0, sign * (base + 0.25)];
      pose[`${side}${name}Distal`] = [0, 0, sign * (base + 0.1)];
    }
    // 拇指往掌心收一點
    pose[`${side}ThumbProximal`] = [0, sign * -0.25, sign * 0.1];
    pose[`${side}ThumbDistal`] = [0, sign * -0.2, 0];
  }
  return pose;
}

// 角色在 Talkroom 椅子上的位置、坐姿與鏡頭。
// 座標是 Talkroom GLB 的場景座標；pose 是 VRM 正規化骨架的旋轉（弧度，XYZ）。
// 椅面頂端約 y=1.44；靠背前有兩顆抱枕：前面那顆（z 0.7–1.0）拿掉，人才坐得進去、膝蓋不會撞到書桌（z≥2.0）；
// 後面深色那顆（z 0.4–0.6）跟椅子是同一個網格，留著當靠墊。
export const SEAT = {
  // 大腿根部要落在的點（椅面上、深色抱枕前）；換模型時程式會依腿長自動對齊
  seat: [1.1, 1.54, 0.78],
  // 拿掉的物件：椅子上前面那顆抱枕
  hideNodes: ['21_Chair_RuntimeMesh001_1'],
  rotationY: 0,
  // 椅子以場景比例來說很大，角色要放大才坐得進去
  scale: 2.5,
  pose: {
    hips: [0, 0, 0],
    // 背挺直（前傾會讓頭往下，看鏡頭時變成翻白眼往上看）
    spine: [0.04, 0, 0],
    chest: [0.02, 0, 0],
    leftUpperLeg: [-1.45, 0.1, 0],
    rightUpperLeg: [-1.45, -0.1, 0],
    leftLowerLeg: [1.5, 0, 0],
    rightLowerLeg: [1.5, 0, 0],
    // 雙手放在大腿上（使用者 2026-11-25：閒置時雙手抬著往前很怪；在瀏覽器裡用數值搜尋對到大腿位置）
    leftUpperArm: [-0.004, -1.418, -1.028],
    rightUpperArm: [-0.105, 1.381, 1.139],
    leftLowerArm: [0, -0.558, 0],
    rightLowerArm: [0, 0.56, 0],
    // 手腕稍微往下垂、往內收
    leftHand: [0.15, 0, -0.2],
    rightHand: [0.15, 0, 0.2],
    ...relaxedFingers()
  },
  camera: {
    // 正對角色、置中（使用者 2026-11-25：像桌布一樣，角色待在中間、不要斜），書桌在前景
    position: [1.1, 3.15, 7.4],
    target: [1.1, 2.4, 1.2],
    fov: 30,
    // 直式螢幕時沿視線往後拉的距離
    portraitPull: 2.5,
    // 拖曳畫面可以轉動視角的上限（弧度）：左右約 ±12°、上下約 ±6°（使用者 2026-11-25 要的）
    look: { yaw: 0.22, pitch: 0.1 }
  }
};
