// 陪伴模式角色的待機動作：每隔一段隨機時間挑一個播，播完平順回到基準坐姿。
// 只轉骨頭（VRM 正規化骨架），不動場景物件，手機 30fps 也夠輕。
//
// 動作（clip）的格式：
//   duration  秒數
//   weight    被抽中的機率權重
//   cooldown  播過之後至少隔幾秒才會再抽到
//   keys      關鍵格，照 t（秒）排序；開頭（t=0）與結尾（t=duration）自動是基準坐姿
//     pose    骨頭的絕對旋轉 [x, y, z, order?]（弧度；order 預設 'XYZ'）。沒寫的骨頭＝基準坐姿
//     add     疊加在軀幹、頭上的旋轉（spine、chest、upperChest、neck、head），
//             以及 gaze：[x, y] 視線目標的位移（場景座標，+x 是畫面右邊、+y 是上）
//     expr    表情權重，例如 { blink: 1 }
//     same    true＝沿用上一格的 pose／add／expr，再蓋上這格寫的
//     ease    這一格「進來」的緩動：'smooth'（預設）、'in'、'out'、'linear'
//   fx(t)     選用：隨時間變化的小動作（敲手指、揮手的擺動），回傳 { 骨頭: [x, y, z] }，
//             疊在該骨頭自己的座標上（軀幹與頭則是加在 add 上）
//
// 方向慣例（已實測）：角色面向 +Z，左手在 +X。上臂 z：左手負、右手正是放下；
// 下臂 y：左手負、右手正是彎手肘；手指 z：左手負、右手正是往掌心彎；頭 y 正是轉向畫面右邊、x 正是低頭。

import * as THREE from 'three';

const FINGERS = ['Index', 'Middle', 'Ring', 'Little'];
const SPREAD = { Index: 1, Middle: 0.3, Ring: -0.4, Little: -1 };
// 基準坐姿的手指彎曲（食指→小指），跟 data/companion.js 的 relaxedFingers 一致；手指「伸直」時用來抵銷
const RELAXED = [0.22, 0.3, 0.38, 0.46];

/**
 * 四指的彎曲與張開（絕對姿勢，寫在關鍵格的 pose 裡）。
 * curl：0 伸直、1 握拳；給陣列 [食指, 中指, 無名指, 小指] 可以每根不同。spread：張開。
 */
function fingers(side, curl, spread = 0) {
  const s = side === 'left' ? -1 : 1;
  const pose = {};
  FINGERS.forEach((f, i) => {
    const c = Array.isArray(curl) ? curl[i] : curl;
    pose[`${side}${f}Proximal`] = [0, s * SPREAD[f] * spread, s * c];
    pose[`${side}${f}Intermediate`] = [0, 0, s * c * 1.2];
    pose[`${side}${f}Distal`] = [0, 0, s * c];
  });
  return pose;
}

/** 拇指（絕對姿勢）。out：正＝往外張開、負＝往食指靠；bend：指尖往掌心彎 */
function thumb(side, out, bend = 0) {
  const s = side === 'left' ? -1 : 1;
  return {
    [`${side}ThumbMetacarpal`]: [0, s * out * 0.6, 0],
    [`${side}ThumbProximal`]: [0, s * out, s * -bend * 0.5],
    [`${side}ThumbDistal`]: [0, s * -bend, 0]
  };
}

/**
 * fx 用：四指各自在目前的姿勢上再彎一點（正＝往掌心、負＝伸直抬起）。
 * fn(i) 回傳一個數字，或 [近端, 中段, 遠端, 張開]；i：0 食指 … 3 小指。
 */
function curlFx(out, side, fn) {
  const s = side === 'left' ? -1 : 1;
  FINGERS.forEach((f, i) => {
    const c = fn(i);
    const p = Array.isArray(c) ? c[0] : c;
    const m = Array.isArray(c) ? c[1] ?? p : p;
    const d = Array.isArray(c) ? c[2] ?? m * 0.8 : p * 0.8;
    const y = Array.isArray(c) ? c[3] ?? 0 : 0;
    out[`${side}${f}Proximal`] = [0, s * SPREAD[f] * y, s * p];
    out[`${side}${f}Intermediate`] = [0, 0, s * m];
    out[`${side}${f}Distal`] = [0, 0, s * d];
  });
  return out;
}

const swapSide = (name) =>
  name.startsWith('left') ? 'right' + name.slice(4) : name.startsWith('right') ? 'left' + name.slice(5) : name;
const flip = (r) => (r.length > 3 ? [r[0], -r[1], -r[2], r[3]] : [r[0], -r[1], -r[2]]);
function mirrorMap(map) {
  if (!map) return map;
  const out = {};
  for (const [name, r] of Object.entries(map)) out[swapSide(name)] = name === 'gaze' ? [-r[0], r[1]] : flip(r);
  return out;
}
/** 左右對調的版本（看左邊→看右邊、右手敲→左手敲） */
function mirror(clip) {
  return {
    ...clip,
    keys: clip.keys.map((k) => ({ ...k, pose: mirrorMap(k.pose), add: mirrorMap(k.add) })),
    fx: clip.fx && ((t) => mirrorMap(clip.fx(t)))
  };
}

// 一段時間內由 0 升到 1 再降回 0 的包絡
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const window01 = (t, a, b, fade) => smooth(clamp01((t - a) / fade)) * smooth(clamp01((b - t) / fade));
// 從 t=a 開始、長度 len 的一個小鼓包（0→1→0）
const bump = (t, a, len) => window01(t, a, a + len, len / 2);

// ── 動作 ──
// 原則：手臂要移到別處的動作（揮手、托腮、撥頭髮、伸懶腰）才在 pose 寫手臂的絕對旋轉；
// 其他只在原地動的（敲手指、手指小動作、調整坐姿）一律用 fx 疊在基準坐姿上，基準坐姿改了也不會怪。

// 看旁邊（窗外）：頭與上半身轉過去，停一下再回來
const lookAside = {
  duration: 5.6,
  weight: 3,
  keys: [
    { t: 1.1, add: { head: [-0.04, 0.5, 0.03], neck: [0, 0.14, 0], upperChest: [0, 0.06, 0], gaze: [3.2, 0.3] } },
    { t: 3.7, add: { head: [-0.07, 0.58, 0.05], neck: [0, 0.16, 0], upperChest: [0, 0.08, 0], gaze: [3.8, 0.5] }, ease: 'linear' },
    { t: 4.9 }
  ]
};

// 低頭看桌面（鍵盤、筆記），中間換個地方看
const lookDesk = {
  duration: 6,
  weight: 3,
  keys: [
    { t: 1.0, add: { head: [0.3, 0.1, 0], neck: [0.1, 0, 0], spine: [0.03, 0, 0], gaze: [0.6, -2.4] } },
    { t: 2.6, same: true },
    { t: 3.2, add: { head: [0.32, -0.12, -0.03], neck: [0.1, -0.03, 0], spine: [0.03, 0, 0], gaze: [-0.7, -2.4] } },
    { t: 4.6, same: true },
    { t: 5.6 }
  ],
  fx(t) {
    // 看的時候右手食指、中指無意識地點兩下
    const out = {};
    return curlFx(out, 'right', (i) => (i < 2 ? -0.16 * (bump(t, 1.5 + i * 0.09, 0.3) + bump(t, 1.95 + i * 0.09, 0.3)) : 0));
  }
};

// 轉轉脖子：左右各歪一下
const neckRoll = {
  duration: 5.4,
  weight: 2,
  cooldown: 25,
  keys: [
    { t: 1.0, add: { head: [0.05, 0.04, 0.26], neck: [0, 0, 0.1] }, pose: { rightShoulder: [0, 0, 0.06] } },
    { t: 1.9, same: true, expr: { blink: 0.7 } },
    { t: 3.1, add: { head: [0.05, -0.04, -0.26], neck: [0, 0, -0.1] }, pose: { leftShoulder: [0, 0, -0.06] }, expr: { blink: 0.7 } },
    { t: 4.0, same: true, expr: { blink: 0 } },
    { t: 5.0 }
  ]
};

// 調整坐姿：挺一下背、聳肩、重心左右換一下；手跟著撐一下（手指伸直壓住，再放鬆）
const shiftSeat = {
  duration: 4.6,
  weight: 3,
  keys: [
    {
      t: 1.0,
      add: { spine: [-0.1, 0, 0.05], chest: [-0.05, 0, -0.03], head: [0.06, 0, -0.03] },
      pose: { leftShoulder: [0, 0, 0.16], rightShoulder: [0, 0, -0.16] }
    },
    {
      t: 2.1,
      add: { spine: [-0.06, 0, -0.05], chest: [-0.03, 0, 0.03], head: [0.03, 0, 0.03] },
      pose: { leftShoulder: [0, 0, 0.06], rightShoulder: [0, 0, -0.06] }
    },
    { t: 3.2, add: { spine: [0.03, 0, 0.01] }, pose: { leftShoulder: [0, 0, -0.04], rightShoulder: [0, 0, 0.04] } },
    { t: 4.2 }
  ],
  fx(t) {
    const press = window01(t, 0.2, 2.2, 0.7);
    const regrip = bump(t, 2.5, 1.2);
    const out = {
      leftLowerArm: [0, -0.16 * press, 0],
      rightLowerArm: [0, 0.16 * press, 0]
    };
    // 撐的時候手指伸直、微張；坐回去之後手指依序收回來重新放好
    const f = (i) => [-RELAXED[i] * 0.7 * press + 0.12 * bump(t, 2.5 + i * 0.1, 0.9), -0.2 * press + 0.1 * regrip, -0.1 * press, 0.08 * press];
    curlFx(out, 'left', f);
    curlFx(out, 'right', f);
    return out;
  }
};

// 手指輕敲：手留在原地（大腿上），四指微微拱起，小指到食指一根一根抬起、落下；敲兩串、中間停一拍
const fingerTap = {
  duration: 4.8,
  weight: 3,
  keys: [
    { t: 0.6, pose: { ...fingers('right', [0.2, 0.24, 0.28, 0.34], 0.07), ...thumb('right', 0.1, 0.1) }, add: { head: [0.05, -0.05, 0], gaze: [-0.4, -1.2] } },
    { t: 4.0, same: true },
    { t: 4.6 }
  ],
  fx(t) {
    // 兩串：0.7–2.2 秒、2.6–3.9 秒
    const group = window01(t, 0.7, 2.25, 0.2) + window01(t, 2.6, 3.95, 0.2);
    // 手腕稍微抬起來，手指才有空間敲
    const out = { rightHand: [0, 0, -0.1 * window01(t, 0.3, 4.1, 0.4)] };
    return curlFx(out, 'right', (i) => {
      // 每輪 0.46 秒，小指先、食指後（各差 0.08 秒）；抬起慢、敲下快，敲到之後停一下
      const phase = (((t - 0.7 - (3 - i) * 0.08) / 0.46) % 1 + 1) % 1;
      const lift = phase < 0.5 ? smooth(phase / 0.5) : phase < 0.64 ? 1 - smooth((phase - 0.5) / 0.14) : 0;
      const hit = phase >= 0.64 && phase < 0.8 ? Math.sin(((phase - 0.64) / 0.16) * Math.PI) : 0;
      const k = group * (i === 3 ? 0.8 : 1);
      // 抬起：指根往上、指節略伸直；敲到：指尖多壓一點
      return [(-0.4 * lift + 0.05 * hit) * k, (-0.1 * lift + 0.08 * hit) * k, 0.06 * hit * k];
    });
  }
};

// 手指小動作：小指到食指像波浪一樣輕輕收一下、放開，拇指搓一搓食指側邊（平常手不會完全不動）
const fidget = {
  duration: 3.6,
  weight: 2.5,
  keys: [],
  fx(t) {
    const rub = window01(t, 0.5, 3.0, 0.5);
    const out = {
      rightHand: [0, 0, 0.04 * bump(t, 0.4, 1.4) + 0.04 * bump(t, 1.7, 1.4)],
      rightThumbProximal: [0, (-0.12 - 0.1 * Math.sin(t * 7.5)) * rub, 0.06 * rub],
      rightThumbDistal: [0, -0.12 * (0.5 + 0.5 * Math.sin(t * 7.5 - 0.6)) * rub, 0]
    };
    return curlFx(out, 'right', (i) => {
      const c = bump(t, 0.4 + (3 - i) * 0.13, 0.9) + bump(t, 1.7 + (3 - i) * 0.13, 0.9);
      return [0.22 * c, 0.3 * c, 0.2 * c];
    });
  }
};

// 活動手指：右手抬到胸前、掌心朝自己，低頭看著手；五指張開伸直，再從小指到食指一根一根收起來，最後放鬆
const FLEX_CURL = [0.25, 0.32, 0.4, 0.48];
const flexPose = {
  rightUpperArm: [-0.235, 0.434, 1.232],
  rightLowerArm: [-1.5, 1.906, 0, 'YXZ'],
  rightHand: [0, 0, 0.05],
  ...fingers('right', FLEX_CURL, 0.03),
  ...thumb('right', 0.05, 0.1)
};
const handFlex = {
  duration: 5.4,
  weight: 2,
  cooldown: 30,
  keys: [
    { t: 0.9, pose: flexPose, add: { head: [0.16, -0.1, 0.03], neck: [0.05, 0, 0], gaze: [-0.5, -1.7] } },
    { t: 4.4, same: true },
    { t: 5.2 }
  ],
  fx(t) {
    const open = window01(t, 1.0, 2.4, 0.45);
    const out = {
      // 張開時手腕轉一下，看看手背
      rightLowerArm: [0.35 * open, 0, 0],
      rightHand: [0, 0, -0.12 * open + 0.1 * window01(t, 2.6, 4.3, 0.5)],
      rightThumbMetacarpal: [0, 0.15 * open, 0],
      rightThumbProximal: [0, 0.3 * open - 0.3 * window01(t, 3.3, 4.3, 0.35), 0]
    };
    return curlFx(out, 'right', (i) => {
      // 張開：食指先、小指後；收：小指先，每根差 0.2 秒
      const o = window01(t, 1.0 + i * 0.07, 2.4 + i * 0.04, 0.45);
      const c = window01(t, 2.5 + (3 - i) * 0.2, 4.3, 0.35);
      const k = FLEX_CURL[i];
      return [-k * o + 0.6 * c, -k * 1.2 * o + 0.7 * c, -k * o + 0.5 * c, 0.2 * o];
    });
  }
};

// 伸懶腰：雙手握拳舉到頭兩側往上撐，撐到頂時手指張開，背往後挺、閉眼
const stretchUp = {
  leftShoulder: [0, 0, 0.15], rightShoulder: [0, 0, -0.15],
  leftUpperArm: [-1.4, -0.2, 0.05, 'ZYX'], rightUpperArm: [-1.4, 0.2, -0.05, 'ZYX'],
  leftLowerArm: [0, -1.55, 0], rightLowerArm: [0, 1.55, 0],
  leftHand: [0, 0, 0.2], rightHand: [0, 0, -0.2],
  ...fingers('left', 0.9), ...fingers('right', 0.9),
  ...thumb('left', -0.2, 0.4), ...thumb('right', -0.2, 0.4)
};
const stretchTop = {
  ...stretchUp,
  leftShoulder: [0, 0, 0.26], rightShoulder: [0, 0, -0.26],
  leftUpperArm: [-1.4, -0.12, 0.42, 'ZYX'], rightUpperArm: [-1.4, 0.12, -0.42, 'ZYX'],
  leftLowerArm: [0, -1.2, 0], rightLowerArm: [0, 1.2, 0],
  leftHand: [0, 0, 0.3], rightHand: [0, 0, -0.3],
  ...fingers('left', [0.05, 0.03, 0.06, 0.1], 0.24), ...fingers('right', [0.05, 0.03, 0.06, 0.1], 0.24),
  ...thumb('left', 0.35), ...thumb('right', 0.35)
};
const stretchDown = {
  ...stretchUp,
  ...fingers('left', [0.45, 0.55, 0.62, 0.7], 0.04), ...fingers('right', [0.45, 0.55, 0.62, 0.7], 0.04),
  ...thumb('left', 0, 0.15), ...thumb('right', 0, 0.15)
};
const stretch = {
  duration: 7.4,
  weight: 1.2,
  cooldown: 70,
  keys: [
    { t: 1.5, pose: stretchUp, add: { spine: [-0.08, 0, 0], chest: [-0.06, 0, 0], head: [-0.05, 0, 0] } },
    {
      t: 2.7,
      pose: stretchTop,
      add: { spine: [-0.16, 0, 0], chest: [-0.12, 0, 0], upperChest: [-0.1, 0, 0], neck: [-0.08, 0, 0], head: [-0.2, 0, 0.05], gaze: [0, 1.2] },
      expr: { blink: 1 }
    },
    {
      t: 4.3,
      pose: stretchTop,
      add: { spine: [-0.17, 0, 0.03], chest: [-0.13, 0, 0.02], upperChest: [-0.1, 0, 0], neck: [-0.08, 0, 0], head: [-0.22, 0, -0.04], gaze: [0, 1.2] },
      expr: { blink: 1 },
      ease: 'linear'
    },
    { t: 5.3, pose: stretchDown, add: { spine: [-0.04, 0, 0], head: [0.04, 0, 0] }, expr: { blink: 0.3 } },
    { t: 7.0 }
  ],
  fx(t) {
    // 撐到頂時手指用力張開、微微顫一下
    const w = window01(t, 2.6, 4.4, 0.4);
    const out = {};
    const f = (i) => [0, 0, 0, 0.05 * Math.sin(t * 5 + i) * w];
    curlFx(out, 'left', f);
    curlFx(out, 'right', f);
    return out;
  }
};

// 想事情：右手鬆鬆地握著抵住下巴（食指握得最鬆、小指最緊），視線飄到旁邊，食指偶爾點一下
const thinkPose = {
  rightUpperArm: [-0.727, 0.747, 1.618],
  rightLowerArm: [0, 1.975, 0],
  rightHand: [0, 0, 0.25],
  ...fingers('right', [0.72, 0.86, 0.95, 1.0], 0.02),
  ...thumb('right', -0.1, 0.25)
};
const think = {
  duration: 8.4,
  weight: 2,
  cooldown: 40,
  keys: [
    { t: 1.4, pose: thinkPose, add: { head: [0.1, 0.06, -0.1], neck: [0.04, 0, 0], spine: [0.02, 0, -0.03] } },
    { t: 2.6, same: true, add: { head: [0.06, 0.16, -0.1], neck: [0.04, 0, 0], spine: [0.02, 0, -0.03], gaze: [2.2, 1.2] } },
    { t: 5.4, same: true, ease: 'linear' },
    { t: 6.4, same: true, add: { head: [0.12, 0.02, -0.08], neck: [0.04, 0, 0], spine: [0.02, 0, -0.03] } },
    { t: 8.0 }
  ],
  fx(t) {
    // 想的時候頭輕輕點；食指鬆開點兩下，其他手指跟著鬆一點
    const w = window01(t, 2.6, 5.6, 0.5);
    const tap = bump(t, 3.0, 0.5) + bump(t, 3.55, 0.5) + bump(t, 4.9, 0.6);
    const out = { head: [Math.sin(t * 2.6) * 0.025 * w, 0, 0] };
    return curlFx(out, 'right', (i) => (i === 0 ? [-0.24 * tap, -0.3 * tap, -0.18 * tap] : -0.05 * tap * (1 - i * 0.25)));
  }
};

// 撥頭髮：左手舉到太陽穴旁，手指插進頭髮往後梳兩下（食指先、小指後依序收），最後順一下放下
const hairPose = {
  leftUpperArm: [-1.249, -0.12, -0.985],
  leftLowerArm: [-0.8, -2.295, 0, 'YXZ'],
  leftHand: [0, 0, -0.1],
  ...fingers('left', [0.3, 0.36, 0.42, 0.5], 0.12),
  ...thumb('left', 0.2, 0.1)
};
const hairTouch = {
  duration: 5.8,
  weight: 2,
  cooldown: 40,
  keys: [
    { t: 1.3, pose: hairPose, add: { head: [0.06, -0.1, 0.1], neck: [0.02, 0, 0.03] } },
    { t: 3.9, same: true },
    { t: 5.4 }
  ],
  fx(t) {
    const w = window01(t, 1.2, 3.9, 0.35);
    // 一下 1.15 秒：前 60% 往後梳（手指依序收進去），後 40% 手指鬆開回到前面
    const comb = (x) => {
      const p = (((x - 1.4) / 1.15) % 1 + 1) % 1;
      return p < 0.6 ? smooth(p / 0.6) : 1 - smooth((p - 0.6) / 0.4);
    };
    const s = comb(t) * w;
    const out = {
      leftUpperArm: [0.1 * s, 0, 0],
      leftLowerArm: [0, -0.1 * s, 0],
      leftHand: [0, 0, -0.22 * s],
      leftThumbProximal: [0, 0.1 * s, 0]
    };
    return curlFx(out, 'left', (i) => {
      const c = comb(t - i * 0.07) * w;
      return [0.28 * c, 0.34 * c, 0.2 * c, -0.06 * c];
    });
  }
};

// 打招呼（點角色時）：手肘在身側、前臂直立、掌心朝鏡頭，五指張開；
// 擺動幾乎都在手腕（手掌左右輕擺），前臂只跟著動一點點，手指慢半拍跟著甩
const waveArm = {
  rightUpperArm: [-0.751, -0.604, 0.997],
  rightLowerArm: [0, 2.404, 0],
  rightHand: [0, 0, -0.08]
};
const waveOpen = {
  ...waveArm,
  ...fingers('right', [0.04, 0.02, 0.05, 0.1], 0.2),
  ...thumb('right', 0.3)
};
const wave = {
  duration: 3.3,
  weight: 0, // 不會被隨機抽到，只由 play('wave') 觸發
  keys: [
    // 手抬起來的路上手指還半彎著，到位之後才張開
    { t: 0.42, pose: { ...waveArm, ...fingers('right', [0.24, 0.3, 0.36, 0.42], 0.04), ...thumb('right', 0.05, 0.1) }, add: { head: [0, 0.03, -0.05], spine: [-0.02, 0, 0] }, ease: 'out' },
    { t: 0.66, pose: waveOpen, add: { head: [-0.02, 0.04, -0.1], neck: [0, 0, -0.03], spine: [-0.02, 0, 0] } },
    { t: 2.35, same: true },
    // 放下之前手指先鬆開
    { t: 2.6, pose: { ...waveArm, ...fingers('right', [0.16, 0.22, 0.28, 0.34], 0.08), ...thumb('right', 0.1, 0.05) }, add: { head: [0, 0.02, -0.05] } },
    { t: 3.3 }
  ],
  fx(t) {
    const w = window01(t, 0.5, 2.5, 0.3);
    const ph = (t - 0.5) * 11.5;
    const s = Math.sin(ph);
    const out = {
      rightUpperArm: [s * 0.035 * w, 0, 0],
      // 手腕：繞手背的法線轉＝手掌在自己的平面上左右擺
      rightHand: [0, s * 0.34 * w, 0],
      rightThumbProximal: [0, Math.sin(ph - 0.8) * 0.06 * w, 0],
      head: [0, 0, Math.sin(ph * 0.5) * 0.012 * w]
    };
    return curlFx(out, 'right', (i) => {
      // 手指比手掌慢一點，越外側的手指越慢；甩過去時指尖多彎一點
      const lag = Math.sin(ph - 0.9 - i * 0.22);
      const c = 0.05 + 0.05 * lag;
      return [c * w, c * 1.4 * w, c * w, 0.05 * Math.sin(ph - 0.6) * w];
    });
  }
};

export const CLIPS = {
  lookLeft: mirror(lookAside),
  lookRight: lookAside,
  lookDesk,
  neckRoll,
  shiftSeat,
  fingerTapRight: fingerTap,
  fingerTapLeft: mirror(fingerTap),
  fidgetRight: fidget,
  fidgetLeft: mirror(fidget),
  handFlexRight: handFlex,
  handFlexLeft: mirror(handFlex),
  stretch,
  think,
  hairTouch,
  wave
};

// 會被待機動作控制的骨頭（絕對旋轉）；其餘軀幹與頭走 add
const ARM = ['Shoulder', 'UpperArm', 'LowerArm', 'Hand', 'ThumbMetacarpal', 'ThumbProximal', 'ThumbDistal'];
export const POSE_BONES = ['left', 'right'].flatMap((side) => [
  ...ARM.map((n) => side + n),
  ...FINGERS.flatMap((f) => ['Proximal', 'Intermediate', 'Distal'].map((seg) => side + f + seg))
]);
export const ADD_BONES = ['spine', 'chest', 'upperChest', 'neck', 'head', 'gaze'];
const ADD_SET = new Set(ADD_BONES);

const EASE = {
  smooth,
  linear: (t) => t,
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) * (1 - t)
};

const _euler = new THREE.Euler();
const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();
const _qfx = new THREE.Quaternion();

/** [x, y, z, order?] → 四元數 */
export function eulerToQuat(r, out = new THREE.Quaternion()) {
  return out.setFromEuler(_euler.set(r[0], r[1], r[2], r[3] ?? 'XYZ'));
}

function compile(name, clip) {
  const frames = [{ t: 0, pose: {}, add: {}, expr: {} }];
  for (const k of clip.keys) {
    const prev = frames[frames.length - 1];
    frames.push({
      t: k.t,
      pose: { ...(k.same ? prev.pose : null), ...k.pose },
      add: { ...(k.same ? prev.add : null), ...k.add },
      expr: { ...(k.same ? prev.expr : null), ...k.expr },
      ease: EASE[k.ease] ?? smooth
    });
  }
  if (frames[frames.length - 1].t < clip.duration) frames.push({ t: clip.duration, pose: {}, add: {}, expr: {}, ease: smooth });
  const bones = new Set();
  const exprs = new Set();
  for (const f of frames) {
    f.quats = new Map(Object.entries(f.pose).map(([bone, r]) => [bone, eulerToQuat(r)]));
    for (const bone of f.quats.keys()) bones.add(bone);
    for (const e of Object.keys(f.expr)) exprs.add(e);
  }
  return { name, duration: clip.duration, weight: clip.weight ?? 1, cooldown: clip.cooldown ?? 0, frames, bones, exprs, fx: clip.fx };
}

/**
 * 待機動作控制器。每格：update(dt) → 對每根骨頭 apply(name, 基準四元數) → 讀 add／expr。
 * @param {{ gap?: [number, number], firstGap?: [number, number], blend?: number, random?: () => number }} opts
 */
export function createIdle(opts = {}) {
  const { gap = [6, 13], firstGap = [3, 5], blend = 0.35, random = Math.random } = opts;
  const clips = new Map(Object.entries(CLIPS).map(([name, clip]) => [name, compile(name, clip)]));
  const exprNames = [...new Set([...clips.values()].flatMap((c) => [...c.exprs]))];

  let cur = null; // { clip, t, seg, u, fx }
  let snap = null; // 被打斷時的姿勢，用來接到新動作：{ quats, add, expr, f }
  let wait = firstGap[0] + random() * (firstGap[1] - firstGap[0]);
  let now = 0;
  let lastName = '';
  let enabled = true;
  const lastPlayed = new Map();
  const last = new Map(POSE_BONES.map((name) => [name, new THREE.Quaternion()]));
  const touched = new Set(); // 目前（含交接中）有被動作改到的骨頭

  const add = Object.fromEntries(ADD_BONES.map((name) => [name, [0, 0, 0]]));
  const expr = Object.fromEntries(exprNames.map((name) => [name, 0]));

  function pick() {
    let total = 0;
    const pool = [];
    for (const clip of clips.values()) {
      if (!clip.weight || clip.name === lastName) continue;
      if (clip.cooldown && lastPlayed.has(clip.name) && now - lastPlayed.get(clip.name) < clip.cooldown) continue;
      pool.push(clip);
      total += clip.weight;
    }
    let r = random() * total;
    for (const clip of pool) {
      r -= clip.weight;
      if (r <= 0) return clip;
    }
    return pool[pool.length - 1] ?? null;
  }

  function start(clip) {
    if (cur || snap) {
      // 動作還在播（或還在交接）：記下現在的樣子，從這裡接到新動作，不會跳一下
      const quats = new Map();
      for (const name of touched) quats.set(name, last.get(name).clone());
      snap = {
        quats,
        add: Object.fromEntries(ADD_BONES.map((name) => [name, add[name].slice()])),
        expr: { ...expr },
        f: 0
      };
    }
    cur = { clip, t: 0, seg: 0, u: 0, fx: null };
    lastName = clip.name;
    lastPlayed.set(clip.name, now);
  }

  function locate() {
    const { frames } = cur.clip;
    let i = 0;
    while (i < frames.length - 2 && cur.t >= frames[i + 1].t) i++;
    const a = frames[i];
    const b = frames[i + 1];
    cur.seg = i;
    cur.u = b.ease(clamp01((cur.t - a.t) / Math.max(1e-6, b.t - a.t)));
  }

  function update(dt) {
    now += dt;
    if (cur) {
      cur.t += dt;
      if (cur.t >= cur.clip.duration) {
        cur = null;
        wait = gap[0] + random() * (gap[1] - gap[0]);
      }
    } else if (enabled) {
      wait -= dt;
      if (wait <= 0) {
        const clip = pick();
        if (clip) start(clip);
        else wait = 2;
      }
    }
    if (snap) {
      snap.f += dt / blend;
      if (snap.f >= 1) snap = null;
    }

    touched.clear();
    if (snap) for (const name of snap.quats.keys()) touched.add(name);
    for (const name of ADD_BONES) add[name][0] = add[name][1] = add[name][2] = 0;
    for (const name of exprNames) expr[name] = 0;

    if (cur) {
      locate();
      const { frames, bones, fx } = cur.clip;
      const a = frames[cur.seg];
      const b = frames[cur.seg + 1];
      for (const name of bones) touched.add(name);
      for (const name of ADD_BONES) {
        const va = a.add[name];
        const vb = b.add[name];
        if (!va && !vb) continue;
        for (let i = 0; i < 3; i++) add[name][i] = (va?.[i] ?? 0) * (1 - cur.u) + (vb?.[i] ?? 0) * cur.u;
      }
      for (const name of exprNames) expr[name] = (a.expr[name] ?? 0) * (1 - cur.u) + (b.expr[name] ?? 0) * cur.u;
      cur.fx = fx ? fx(cur.t) : null;
      if (cur.fx) {
        for (const [name, r] of Object.entries(cur.fx)) {
          if (ADD_SET.has(name)) for (let i = 0; i < 3; i++) add[name][i] += r[i] ?? 0;
          else touched.add(name);
        }
      }
    }
    if (snap) {
      const k = 1 - smooth(snap.f);
      for (const name of ADD_BONES) for (let i = 0; i < 3; i++) add[name][i] += (snap.add[name][i] - add[name][i]) * k;
      for (const name of exprNames) expr[name] += (snap.expr[name] - expr[name]) * k;
    }
  }

  /**
   * 算出一根骨頭這一格的旋轉。
   * @param {string} name
   * @param {THREE.Quaternion} base 基準坐姿（已含平常的小晃動）
   * @param {THREE.Quaternion} out
   */
  function apply(name, base, out) {
    out.copy(base);
    if (!touched.has(name)) return out;
    if (cur) {
      const { frames, bones } = cur.clip;
      if (bones.has(name)) {
        const qa = frames[cur.seg].quats.get(name) ?? base;
        const qb = frames[cur.seg + 1].quats.get(name) ?? base;
        out.slerpQuaternions(_qa.copy(qa), _qb.copy(qb), cur.u);
      }
      const r = cur.fx?.[name];
      if (r) out.multiply(eulerToQuat(r, _qfx));
    }
    if (snap) {
      const from = snap.quats.get(name);
      if (from) out.copy(_qa.copy(from).slerp(out, smooth(snap.f)));
    }
    last.get(name)?.copy(out);
    return out;
  }

  return {
    update,
    apply,
    /** 軀幹、頭的疊加旋轉與視線位移（每格 update 後更新） */
    add,
    /** 表情權重（每格 update 後更新） */
    expr,
    /** 立刻播指定的動作；正在播的會平順接過去 */
    play(name) {
      const clip = clips.get(name);
      if (clip) start(clip);
      return !!clip;
    },
    /** 關掉後不再自動挑動作（正在播的會播完） */
    setEnabled(v) { enabled = v; },
    /** 換模型時歸零 */
    reset() {
      cur = null;
      snap = null;
      wait = firstGap[0] + random() * (firstGap[1] - firstGap[0]);
    },
    get current() { return cur ? cur.clip.name : null; },
    get time() { return cur ? cur.t : 0; },
    names: [...clips.keys()],
    durations: Object.fromEntries([...clips.values()].map((c) => [c.name, c.duration]))
  };
}
