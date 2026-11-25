// 陪伴模式（首頁 00 START 點進去的畫面）的資料。

// 可以選的化身。url 是網頁用的輕量版 VRM（原檔太大，不放網站）。
// 新造型的輕量版做好後加在這裡即可。
// scale：坐在椅子上的縮放（預設 SEAT.scale）；H05 是成人體型，軀幹比 H04 長約 1.3 倍，縮小一點才不會比椅子還大
// group：造型面板分成正太版、青年版兩欄（使用者 2026-11-26：這樣比較好找）；label 是欄裡的名稱，name 是完整名稱
export const COMPANION_MODEL_GROUPS = [
  { id: 'H04', label: '正太版' },
  { id: 'H05', label: '青年版' }
];
export const COMPANION_MODELS = [
  { id: 'H04-B01', group: 'H04', label: '盔甲', name: '正太盔甲版', url: '/companion/models/H04-B01.vrm' },
  { id: 'H04-B02', group: 'H04', label: '便服', name: '正太便服版', url: '/companion/models/H04-B02.vrm' },
  { id: 'H04-B06', group: 'H04', label: '白盔', name: '正太白盔版', url: '/companion/models/H04-B06.vrm' },
  { id: 'H05-B01', group: 'H05', label: '盔甲', name: '青年盔甲版', url: '/companion/models/H05-B01.vrm', scale: 2.1 },
  { id: 'H05-B02', group: 'H05', label: '便服', name: '青年便服版', url: '/companion/models/H05-B02.vrm', scale: 2.1 },
  { id: 'H05-B06', group: 'H05', label: '白盔', name: '青年白盔版', url: '/companion/models/H05-B06.vrm', scale: 2.1 }
];

// 光線氛圍（使用者 2026-11-26 要的：比較冷、比較溫暖、比較銳利、黑白）。
// 數值是乘在預設燈光上的倍數（exposure 曝光、env 環境反光、ambient 天空光、key 主光、fillPower 補光、facePower 臉部補光），
// 顏色會取代該燈的預設顏色；shadowRadius 是影子邊緣的柔和度（小＝銳利）。
// filter 是套在整個 3D 畫面上的 CSS 調色（黑白就是這裡做的）。
export const COMPANION_LIGHTS = [
  { id: 'default', label: '預設' },
  {
    id: 'warm', label: '溫暖',
    sky: '#fff1dc', ground: '#a08770', sun: '#ffd9a8', fill: '#ffe2c2', face: '#fff0de',
    exposure: 1.04, key: 1.05,
    filter: 'sepia(0.14) saturate(1.08)'
  },
  {
    id: 'cool', label: '冷調',
    sky: '#dcebff', ground: '#6f82a6', sun: '#dbe8ff', fill: '#a9c8ff', face: '#eef4ff',
    exposure: 0.96, fillPower: 1.4,
    filter: 'saturate(0.92) hue-rotate(-6deg) brightness(0.98)'
  },
  {
    id: 'sharp', label: '銳利',
    ambient: 0.55, env: 0.6, key: 1.35, fillPower: 0.6, facePower: 0.8, shadowRadius: 0.6,
    filter: 'contrast(1.18) saturate(1.12)'
  },
  {
    id: 'mono', label: '黑白',
    exposure: 1.02,
    filter: 'grayscale(1) contrast(1.08)'
  }
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
  // 那顆抱枕的白色滾邊和葉子徽章跟椅背的白線是同一個網格（不能整個藏）：
  // 只刪掉落在抱枕正面那一層的三角形（網格自己的座標；使用者 2026-11-26：抱枕拿掉後留下一個奇怪的框框）
  trimNodes: [{ node: '21_Chair_RuntimeMesh001_2', min: [-0.3, -0.7, 0.26], max: [0.75, -0.1, 0.31] }],
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
    // 雙手放在大腿上（使用者 2026-11-25：閒置時雙手抬著往前很怪）。這裡的手臂角度只是 IK 的起點，
    // 實際的坐姿由下面 hands 的 IK 依每個模型量到的大腿表面算出來（固定角度會穿進大腿）
    // 左右手各放在自己的大腿上（不要垂進兩腿中間，會被膝甲擋住、看不到手指動作）
    leftUpperArm: [0.101, -1.351, -0.998],
    rightUpperArm: [0.064, 1.335, 1.04],
    leftLowerArm: [0, -0.618, 0],
    rightLowerArm: [0, 0.619, 0],
    // 手腕稍微往下垂、往內收
    leftHand: [0.15, 0, -0.2],
    rightHand: [0.15, 0, 0.2],
    ...relaxedFingers()
  },
  // 雙手放在大腿上的 IK（src/lib/companion/armik.js）。上面 pose 的手臂角度只是起點（決定手肘往哪彎），
  // 手腕的實際位置由 IK 依每個模型量到的大腿表面決定，不會穿進去。數值都是大腿長的比例或弧度：
  hands: {
    along: 0.58, // 手腕放在大腿從胯下到膝蓋的哪裡（0 胯下、1 膝蓋）
    outward: 0.12, // 往身體外側挪多少
    lift: 0.05, // 手腕離大腿表面多高（手掌的厚度）
    droop: 0.15, // 手指往下垂多少
    inward: 0.12, // 手指往身體內側轉多少
    shoulderForward: 0.3, // 上臂外側朝外、稍微往前多少（0＝正朝外）；沒有這個上臂會往內扭，肩膀看起來內凹
    elbow: [0.35, -0.2, -1] // 手肘彎的方向 [往外, 往上, 往前]（往後、稍微往外，不要向兩側張開）
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
