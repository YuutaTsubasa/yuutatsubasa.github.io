// 陪伴模式（首頁 00 START 點進去的畫面）的資料。

// 可以選的化身。url 是網頁用的輕量版 VRM（原檔太大，不放網站）。
// 新造型的輕量版做好後加在這裡即可。
// scale：坐在椅子上的縮放（預設 SEAT.scale）；H05 是成人體型，軀幹比 H04 長約 1.3 倍，縮小一點才不會塞滿畫面
export const COMPANION_MODELS = [
  { id: 'H04-B01', label: 'H04-B01', url: '/companion/models/H04-B01.vrm' },
  { id: 'H05-B01', label: 'H05-B01', url: '/companion/models/H05-B01.vrm', scale: 1.7 }
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
export const SEAT = {
  // 骨盆要落在的位置（椅墊頂約 y=2.4、椅背內側約 z=0.1）
  hips: [1.1, 2.6, 0.35],
  rotationY: 0,
  scale: 2.0,
  // 椅子上的抱枕會穿過角色的腿，坐下時把它藏起來
  hideNodes: ['21_Chair_RuntimeMesh001_1'],
  pose: {
    hips: [0, 0, 0],
    spine: [0.05, 0, 0],
    chest: [0.03, 0, 0],
    leftUpperLeg: [-1.45, 0.08, 0],
    rightUpperLeg: [-1.45, -0.08, 0],
    leftLowerLeg: [1.45, 0, 0],
    rightLowerLeg: [1.45, 0, 0],
    // 手放在膝上（在瀏覽器裡用數值搜尋對到大腿位置）
    leftUpperArm: [-0.16, -0.63, -1.465],
    rightUpperArm: [-0.112, 0.829, 1.325],
    leftLowerArm: [0, -0.9, 0],
    rightLowerArm: [0, 0.9, 0]
  },
  camera: {
    // 從右前方稍高的斜角看
    position: [3.4, 4.3, 6.4],
    target: [1.1, 3.0, 0.6],
    fov: 30,
    // 直式螢幕時沿視線往後拉的距離
    portraitPull: 2.5
  }
};
