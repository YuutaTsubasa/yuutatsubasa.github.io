// 坐著時雙手放在大腿上：用 IK（反向運動學）把手腕放到大腿表面。
//
// 只用固定角度擺手（沒有 IK）時，不同模型的腿粗、手長都不一樣，加上平常的小晃動，
// 手很容易穿進大腿（使用者 2026-11-25 回報）。這裡改成：
//   1. 換模型時先把手臂舉開，從大腿正上方往下打射線，量出每個模型大腿（含盔甲、衣服）的上表面；
//   2. 每一格把手腕放到那個點上方一點（兩段骨頭的解析 IK，手肘朝原本動畫的方向彎）；
//   3. 手掌順著大腿方向平貼，再疊上待機動作對手腕、手指的小動作；
//   4. 待機動作把手臂抬離大腿時（揮手、伸懶腰、看手…），依手臂偏離坐姿的角度平順地交回原本的動畫。

import * as THREE from 'three';

const SIDES = ['left', 'right'];
const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

const _s = new THREE.Vector3();
const _e = new THREE.Vector3();
const _w = new THREE.Vector3();
const _t = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qp = new THREE.Quaternion();
const _qpInv = new THREE.Quaternion();
const _qd = new THREE.Quaternion();
const _qh = new THREE.Quaternion();
const _qfk = new THREE.Quaternion();
const _m = new THREE.Matrix4();

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 在骨頭自己的父座標系裡套用一個「世界座標的旋轉」 */
function rotateWorld(bone, qWorld) {
  bone.parent.getWorldQuaternion(_qp);
  _qpInv.copy(_qp).invert();
  // local' = parent⁻¹ · q · parent · local
  bone.quaternion.premultiply(_qp).premultiply(qWorld).premultiply(_qpInv);
  bone.updateMatrixWorld(true);
}

/**
 * @param {import('@pixiv/three-vrm').VRM} vrm
 * @param {object} cfg SEAT.hands
 */
export function createArmIK(vrm, cfg) {
  const h = vrm.humanoid;
  const node = (name) => h.getNormalizedBoneNode(name);
  const arms = {};
  let rest = null;

  /**
   * 量大腿表面。呼叫前骨架要是坐姿（腿已經擺好）；這裡會暫時把手臂舉成 T 字，量完放回去。
   */
  function measure() {
    const saved = new Map();
    for (const side of SIDES) {
      for (const b of ['Shoulder', 'UpperArm', 'LowerArm', 'Hand']) {
        const n = node(`${side}${b}`);
        if (n) { saved.set(n, n.quaternion.clone()); n.quaternion.identity(); }
      }
    }
    h.update();
    vrm.scene.updateMatrixWorld(true);
    const meshes = [];
    const bounds = [];
    vrm.scene.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      if (o.isSkinnedMesh) {
        // 射線要用目前姿勢的蒙皮位置：骨架矩陣平常在 render 時才更新。
        // 包圍盒是為了這次量測算的（T 字手臂），量完要還原，不然之後點角色的射線會用到過時的包圍盒
        bounds.push([o, o.boundingSphere, o.boundingBox]);
        o.skeleton.update();
        o.computeBoundingSphere();
        o.computeBoundingBox();
      }
      meshes.push(o);
    });
    const ray = new THREE.Raycaster();
    for (const side of SIDES) {
      const thigh = node(`${side}UpperLeg`);
      const knee = node(`${side}LowerLeg`);
      const upper = node(`${side}UpperArm`);
      const lower = node(`${side}LowerArm`);
      const hand = node(`${side}Hand`);
      if (!thigh || !knee || !upper || !lower || !hand) continue;
      const hip = thigh.getWorldPosition(new THREE.Vector3());
      const kn = knee.getWorldPosition(new THREE.Vector3());
      const len = hip.distanceTo(kn);
      const p = hip.clone().lerp(kn, cfg.along);
      // 往身體外側挪一點（左手在 +X）
      p.x += (side === 'left' ? 1 : -1) * cfg.outward * len;
      // 打幾條射線取中位數：衣服上細細的帶子、垂下來的繩子只會擋到其中一兩條，不會讓手浮在帶子上
      const ys = [];
      const step = len * 0.09;
      for (const [dx, dz] of [[0, 0], [step, 0], [-step, 0], [0, step], [0, -step], [step, step], [-step, -step]]) {
        ray.set(new THREE.Vector3(p.x + dx, p.y + len, p.z + dz), DOWN);
        ray.far = len * 2;
        // 第一個往下打到、又不會高過大腿太多的面（避免打到垂下來的頭髮或下巴）
        const hit = ray.intersectObjects(meshes, false).find((x) => x.point.y < p.y + len * 0.6);
        if (hit) ys.push(hit.point.y);
      }
      ys.sort((m, n) => m - n);
      const surface = p.clone();
      surface.y = ys.length ? ys[Math.floor(ys.length / 2)] : p.y + len * 0.12;
      arms[side] = {
        thigh, knee, upper, lower, hand,
        // 存成大腿骨的區域座標：大腿動了也會跟著
        local: thigh.worldToLocal(surface.clone()),
        lift: cfg.lift * len,
        hits: ys,
        sign: side === 'left' ? 1 : -1
      };
    }
    for (const [n, q] of saved) n.quaternion.copy(q);
    for (const [o, sphere, box] of bounds) { o.boundingSphere = sphere; o.boundingBox = box; }
    vrm.scene.updateMatrixWorld(true);
    // 用 IK 算一次「手放在大腿上」的姿勢，當這個模型手臂的坐姿基準：
    // 待機動作都從這個姿勢出發、回到這個姿勢，抬手、放手時才不會先繞去別的位置
    rest = {};
    for (const side of SIDES) {
      const a = arms[side];
      if (!a) continue;
      place(a, _qd.identity());
      for (const b of ['UpperArm', 'LowerArm', 'Hand']) rest[`${side}${b}`] = a[b === 'UpperArm' ? 'upper' : b === 'LowerArm' ? 'lower' : 'hand'].quaternion.clone();
    }
    h.update();
    vrm.scene.updateMatrixWorld(true);
  }

  /** 手腕放到大腿表面上、手掌平貼；handDelta：待機動作對手腕的變化（相對坐姿基準） */
  function place(a, handDelta) {
    a.upper.parent.updateWorldMatrix(true, false);
    a.upper.updateMatrixWorld(true);
    // 目標：大腿表面上方一點
    _t.copy(a.local);
    a.thigh.localToWorld(_t);
    _t.addScaledVector(UP, a.lift);
    solve(a, _t);

    // 手掌平貼大腿：手指朝膝蓋（稍微往內），掌心朝下
    a.thigh.getWorldPosition(_v1);
    a.knee.getWorldPosition(_v2);
    _x.subVectors(_v2, _v1);
    _x.y -= cfg.droop * _x.length();
    _x.addScaledVector(UP, -_x.dot(UP) * 0.5).normalize();
    _x.applyAxisAngle(UP, a.sign * cfg.inward);
    _y.copy(UP).addScaledVector(_x, -UP.dot(_x)).normalize();
    // 左手骨頭朝 +X、右手朝 -X（T 字姿勢時掌心朝 -Y）
    if (a.sign < 0) _x.negate();
    _z.crossVectors(_x, _y);
    _m.makeBasis(_x, _y, _z);
    _qh.setFromRotationMatrix(_m);
    a.hand.parent.getWorldQuaternion(_qp);
    a.hand.quaternion.copy(_qp.invert().multiply(_qh)).multiply(handDelta);
    a.upper.updateMatrixWorld(true);
  }

  /** 兩段骨頭 IK：把 hand 的位置移到 target，手肘往目前彎的方向 */
  function solve(a, target) {
    a.upper.getWorldPosition(_s);
    a.lower.getWorldPosition(_e);
    a.hand.getWorldPosition(_w);
    const la = _s.distanceTo(_e);
    const lb = _e.distanceTo(_w);
    const d = Math.min(Math.max(_s.distanceTo(target), Math.abs(la - lb) + 1e-4), (la + lb) * 0.999);
    _dir.subVectors(target, _s).normalize();
    // 手肘往哪彎：設定的方向（往後、稍微往外，不會向兩側張開），取跟「肩→目標」垂直的分量
    _pole.set(a.sign * cfg.elbow[0], cfg.elbow[1], cfg.elbow[2]);
    _pole.addScaledVector(_dir, -_pole.dot(_dir));
    if (_pole.lengthSq() < 1e-8) _pole.subVectors(_e, _s).addScaledVector(_dir, -_dir.dot(_pole));
    _pole.normalize();
    const cosA = (la * la + d * d - lb * lb) / (2 * la * d);
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    // 新手肘位置
    _v2.copy(_s).addScaledVector(_dir, la * cosA).addScaledVector(_pole, la * sinA);
    _v1.subVectors(_e, _s).normalize();
    _q.setFromUnitVectors(_v1, _v2.clone().sub(_s).normalize());
    rotateWorld(a.upper, _q);
    // 前臂：從現在的手腕方向轉到目標
    a.lower.getWorldPosition(_e);
    a.hand.getWorldPosition(_w);
    _v1.subVectors(_w, _e).normalize();
    _v2.subVectors(target, _e).normalize();
    _q.setFromUnitVectors(_v1, _v2);
    rotateWorld(a.lower, _q);
  }

  /**
   * 每格呼叫：骨頭已經是待機動作算好的旋轉。
   * @param {Record<string, THREE.Quaternion>} base 各骨頭的坐姿基準（含小晃動），用來判斷待機動作有沒有把手抬走
   */
  function update(base) {
    for (const side of SIDES) {
      const a = arms[side];
      if (!a) continue;
      // 待機動作讓上臂、前臂偏離坐姿越多，IK 越少（0.08 弧度以內全 IK，0.45 以上全交給動畫）
      const dev = Math.max(
        a.upper.quaternion.angleTo(base[`${side}UpperArm`]),
        a.lower.quaternion.angleTo(base[`${side}LowerArm`])
      );
      const w = 1 - smoothstep(0.08, 0.45, dev);
      if (w <= 0) continue;

      const fkUpper = a.upper.quaternion.clone();
      const fkLower = a.lower.quaternion.clone();
      const fkHand = a.hand.quaternion.clone();
      // 待機動作對手腕的變化（相對坐姿基準）：敲手指時抬手腕之類的小動作
      place(a, _qd.copy(base[`${side}Hand`]).invert().multiply(fkHand));

      if (w < 1) {
        a.upper.quaternion.copy(_qfk.copy(fkUpper).slerp(a.upper.quaternion, w));
        a.lower.quaternion.copy(_qfk.copy(fkLower).slerp(a.lower.quaternion, w));
        a.hand.quaternion.copy(_qfk.copy(fkHand).slerp(a.hand.quaternion, w));
      }
      a.upper.updateMatrixWorld(true);
    }
  }

  return {
    measure,
    update,
    /** 這個模型手臂的坐姿基準（區域旋轉），measure() 之後才有 */
    get rest() { return rest; },
    get arms() { return arms; }
  };
}
