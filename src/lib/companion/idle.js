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
const SPREAD = { Index: -1, Middle: -0.3, Ring: 0.4, Little: 1 };

/** 四指的彎曲（curl：0 伸直、1 握拳）與張開（spread） */
function fingers(side, curl, spread = 0) {
  const s = side === 'left' ? -1 : 1;
  const pose = {};
  for (const f of FINGERS) {
    pose[`${side}${f}Proximal`] = [0, s * SPREAD[f] * spread, s * curl];
    pose[`${side}${f}Intermediate`] = [0, 0, s * curl * 1.2];
    pose[`${side}${f}Distal`] = [0, 0, s * curl];
  }
  return pose;
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

// ── 動作 ──

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
  ]
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

// 調整坐姿：挺一下背、聳肩、重心左右換一下
const shiftSeat = {
  duration: 4.6,
  weight: 3,
  keys: [
    {
      t: 1.0,
      add: { spine: [-0.1, 0, 0.05], chest: [-0.05, 0, -0.03], head: [0.06, 0, -0.03] },
      pose: {
        leftShoulder: [0, 0, 0.16], rightShoulder: [0, 0, -0.16],
        leftLowerArm: [0, -0.86, 0], rightLowerArm: [0, 0.86, 0]
      }
    },
    {
      t: 2.1,
      add: { spine: [-0.06, 0, -0.05], chest: [-0.03, 0, 0.03], head: [0.03, 0, 0.03] },
      pose: { leftShoulder: [0, 0, 0.06], rightShoulder: [0, 0, -0.06] }
    },
    { t: 3.2, add: { spine: [0.03, 0, 0.01] }, pose: { leftShoulder: [0, 0, -0.04], rightShoulder: [0, 0, 0.04] } },
    { t: 4.2 }
  ]
};

// 手指輕敲桌緣：右手手腕微抬，小指到食指輪流敲
const fingerTap = {
  duration: 4.4,
  weight: 3,
  keys: [
    { t: 0.6, pose: { rightHand: [0.02, 0, 0.2], ...fingers('right', 0.22, 0.05) }, add: { head: [0.04, -0.05, 0] } },
    { t: 3.6, same: true },
    { t: 4.2 }
  ],
  fx(t) {
    const w = window01(t, 0.6, 3.7, 0.35);
    const out = {};
    FINGERS.forEach((f, i) => {
      // 小指先、食指後，每輪 0.42 秒；抬起慢、敲下快
      const phase = (t / 0.42 + i * 0.2) % 1;
      const lift = phase < 0.6 ? smooth(phase / 0.6) : 1 - smooth((phase - 0.6) / 0.4);
      out[`right${f}Proximal`] = [0, 0, -0.3 * lift * w];
    });
    return out;
  }
};

// 伸懶腰：雙手握拳舉到頭兩側往上撐，背往後挺、閉眼
const stretchUp = {
  leftShoulder: [0, 0, 0.15], rightShoulder: [0, 0, -0.15],
  leftUpperArm: [-1.4, -0.2, 0.05, 'ZYX'], rightUpperArm: [-1.4, 0.2, -0.05, 'ZYX'],
  leftLowerArm: [0, -1.55, 0], rightLowerArm: [0, 1.55, 0],
  leftHand: [0, 0, 0.2], rightHand: [0, 0, -0.2],
  ...fingers('left', 0.9), ...fingers('right', 0.9)
};
const stretchTop = {
  ...stretchUp,
  leftShoulder: [0, 0, 0.26], rightShoulder: [0, 0, -0.26],
  leftUpperArm: [-1.4, -0.12, 0.42, 'ZYX'], rightUpperArm: [-1.4, 0.12, -0.42, 'ZYX'],
  leftLowerArm: [0, -1.2, 0], rightLowerArm: [0, 1.2, 0]
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
    { t: 5.3, pose: stretchUp, add: { spine: [-0.04, 0, 0], head: [0.04, 0, 0] }, expr: { blink: 0.3 } },
    { t: 7.0 }
  ]
};

// 想事情：右手握拳抵著下巴，視線飄到旁邊
const thinkPose = {
  rightUpperArm: [-0.727, 0.747, 1.618],
  rightLowerArm: [0, 1.975, 0],
  rightHand: [0, 0, 0.25],
  ...fingers('right', 1.0),
  rightThumbProximal: [0, 0.1, 0]
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
    // 想的時候頭輕輕點
    const w = window01(t, 2.6, 5.6, 0.5);
    return { head: [Math.sin(t * 2.6) * 0.025 * w, 0, 0] };
  }
};

// 撥頭髮：左手舉到耳邊順兩下
const hairPose = {
  leftUpperArm: [-1.276, -0.193, -1.195],
  leftLowerArm: [0, -2.425, 0],
  leftHand: [0, 0, 0],
  ...fingers('left', 0.35, 0.05)
};
const hairTouch = {
  duration: 5.6,
  weight: 2,
  cooldown: 40,
  keys: [
    { t: 1.3, pose: hairPose, add: { head: [0.06, -0.1, 0.1], neck: [0.02, 0, 0.03] } },
    { t: 3.7, same: true },
    { t: 5.2 }
  ],
  fx(t) {
    const w = window01(t, 1.3, 3.7, 0.4);
    const s = Math.sin((t - 1.3) * 5.2);
    return {
      leftLowerArm: [0, s * 0.07 * w, 0],
      leftHand: [0, 0, -s * 0.18 * w],
      leftIndexProximal: [0, 0, -0.12 * (s + 1) * w],
      leftMiddleProximal: [0, 0, -0.12 * (s + 1) * w]
    };
  }
};

// 打招呼（點角色時）：手肘靠著身體、前臂朝上、掌心向前，小幅左右揮
const wavePose = {
  // 手肘往外打開一點，手掌才不會擋到臉
  rightUpperArm: [-0.7, 0.25, 0.6],
  rightLowerArm: [-1.25, 2.0, 0, 'YXZ'],
  rightHand: [0, 0, 0.1],
  ...fingers('right', 0.06, 0.12),
  rightThumbProximal: [0, 0.15, 0],
  rightThumbDistal: [0, 0, 0]
};
const wave = {
  duration: 2.8,
  weight: 0, // 不會被隨機抽到，只由 play('wave') 觸發
  keys: [
    { t: 0.5, pose: wavePose, add: { head: [0, 0, -0.07], spine: [-0.02, 0, 0] }, ease: 'out' },
    { t: 2.1, same: true },
    { t: 2.8 }
  ],
  fx(t) {
    const w = window01(t, 0.3, 2.25, 0.3);
    const s = Math.sin((t - 0.3) * 9.5);
    // 上臂繞自己的軸轉＝前臂像雨刷左右擺；手腕慢半拍跟著甩
    return {
      rightUpperArm: [s * 0.2 * w, 0, 0],
      rightHand: [0, 0, Math.sin((t - 0.3) * 9.5 - 0.9) * 0.16 * w]
    };
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
