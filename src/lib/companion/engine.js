// 陪伴模式的 3D 場景：直播 Talkroom 房間＋坐在椅子上的 VRM。
// 只在進入陪伴模式時動態載入（three 與 three-vrm 不會進首頁的 bundle）。

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { SEAT } from '$lib/data/companion.js';
import { createIdle, eulerToQuat, POSE_BONES } from './idle.js';

const SCENE_URL = '/companion/talkroom.glb';
const AMBIENT_CLIP = 'Talkroom_Ambient_48s';

// 點角色時輪流出現的表情（VRM 1.0 預設表情名稱；模型沒有就略過）
const REACTIONS = ['happy', 'surprised', 'relaxed', 'happy'];

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ onProgress?: (ratio: number, label: string) => void, onCharacterClick?: () => void, mobile?: boolean, idleMotions?: boolean }} opts
 */
export async function createCompanion(canvas, opts = {}) {
  const { onProgress = () => {}, onCharacterClick = () => {}, mobile = false, idleMotions = true } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#cbd9e8');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;

  // 燈光沿用 Talkroom 預覽的 rendering-config.json
  scene.add(new THREE.HemisphereLight('#e9f4ff', '#8190ab', 0.6));
  const sun = new THREE.DirectionalLight('#fff6ed', 2.2);
  sun.position.set(-3.5, 6, 4);
  sun.target.position.set(0, 1.5, -1);
  sun.castShadow = !mobile;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { near: 0.1, far: 30, left: -10, right: 10, top: 10, bottom: -10 });
  sun.shadow.bias = -0.00008;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 2;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#b9d8ff', 0.5);
  fill.position.set(4, 4, 2);
  scene.add(fill);
  // 角色臉部補光：場景主光從左後方來，臉容易暗
  const faceLight = new THREE.DirectionalLight('#ffffff', 0.9);
  scene.add(faceLight, faceLight.target);

  const camera = new THREE.PerspectiveCamera(SEAT.camera.fov, 1, 0.05, 400);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.register((parser) => new VRMLoaderPlugin(parser));

  // 兩個下載（場景、模型）各佔一半進度
  const progress = { scene: 0, model: 0 };
  const report = (label) => onProgress((progress.scene + progress.model) / 2, label);

  let room;
  try {
    room = await loader.loadAsync(SCENE_URL, (e) => {
      if (e.total) { progress.scene = e.loaded / e.total; report('ROOM'); }
    });
  } catch (err) {
    // 下載失敗就先釋放 WebGL，否則反覆重試會耗盡瀏覽器的 WebGL context
    scene.environment?.dispose();
    pmrem.dispose();
    renderer.dispose();
    throw err;
  }
  progress.scene = 1;
  report('AVATAR');
  room.scene.traverse((o) => {
    if (o.isMesh) { o.castShadow = !mobile; o.receiveShadow = !mobile; }
  });
  for (const name of SEAT.hideNodes ?? []) {
    const node = room.scene.getObjectByName(name);
    if (node) node.visible = false;
  }
  scene.add(room.scene);
  const mixer = new THREE.AnimationMixer(room.scene);
  const clip = room.animations.find((a) => a.name === AMBIENT_CLIP);
  if (clip) mixer.clipAction(clip).play();

  // ── 角色 ──
  let vrm = null;
  let loadToken = 0;
  let disposed = false;
  const lookTarget = new THREE.Object3D();
  scene.add(lookTarget);
  const pointer = new THREE.Vector2(0, 0);
  const pointerSmoothed = new THREE.Vector2(0, 0);

  let blinkTimer = 2;
  let blinkPhase = -1;
  let reaction = null; // { name, t }
  const idle = createIdle();
  idle.setEnabled(idleMotions);
  const _base = new THREE.Quaternion();
  let reactionIndex = 0;

  function frameCamera() {
    const c = SEAT.camera;
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    // 直式（手機）時把鏡頭拉遠一點，讓角色整個上半身都在畫面裡
    const pull = aspect < 1 ? c.portraitPull : 0;
    const dir = new THREE.Vector3().fromArray(c.position).sub(new THREE.Vector3().fromArray(c.target)).normalize();
    camera.position.fromArray(c.position).addScaledVector(dir, pull);
    camera.lookAt(new THREE.Vector3().fromArray(c.target));
    faceLight.position.copy(camera.position).add(new THREE.Vector3(0.6, 1.2, 0));
    faceLight.target.position.fromArray(c.target);
  }

  let modelScale = SEAT.scale;

  function seat(v) {
    const h = v.humanoid;
    const bone = (name) => h.getNormalizedBoneNode(name);
    const pose = SEAT.pose;
    for (const [name, rot] of Object.entries(pose)) {
      const b = bone(name);
      if (b) b.rotation.set(rot[0], rot[1], rot[2]);
    }
    v.scene.position.set(0, 0, 0);
    v.scene.rotation.y = SEAT.rotationY;
    v.scene.scale.setScalar(modelScale);
    // 不同模型的腿長不同：先擺好姿勢，再把整個模型移到大腿根部落在椅面上
    v.humanoid.update();
    v.scene.updateMatrixWorld(true);
    const hips = h.getRawBoneNode('hips').getWorldPosition(new THREE.Vector3());
    const thigh = h.getRawBoneNode('leftUpperLeg').getWorldPosition(new THREE.Vector3());
    v.scene.position.fromArray(SEAT.seat).sub(new THREE.Vector3(hips.x, thigh.y, hips.z));
  }

  async function loadModel(url, scale = SEAT.scale) {
    const token = ++loadToken;
    progress.model = 0;
    const gltf = await loader.loadAsync(url, (e) => {
      if (e.total && token === loadToken) { progress.model = e.loaded / e.total; report('AVATAR'); }
    });
    const next = gltf.userData.vrm;
    // 換模型時舊的下載才回來，或下載途中已經離開陪伴模式：丟掉這份
    if (token !== loadToken || disposed) {
      VRMUtils.deepDispose(gltf.scene);
      return;
    }
    if (!next) throw new Error('Not a VRM file');
    VRMUtils.rotateVRM0(next);
    next.scene.traverse((o) => {
      if (o.isMesh) { o.castShadow = !mobile; o.frustumCulled = false; }
    });
    if (next.lookAt) next.lookAt.target = lookTarget;
    if (vrm) {
      scene.remove(vrm.scene);
      VRMUtils.deepDispose(vrm.scene);
    }
    vrm = next;
    reaction = null;
    idle.reset();
    blinkPhase = -1;
    modelScale = scale;
    seat(vrm);
    scene.add(vrm.scene);
    progress.model = 1;
    report('READY');
  }

  // ── 互動 ──
  const raycaster = new THREE.Raycaster();
  function onPointerMove(e) {
    // 按住時記下最大位移：拖出去再拖回原處放開不算點擊
    if (press) press.moved = Math.max(press.moved, Math.hypot(e.clientX - press.x, e.clientY - press.y));
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  }
  // 點角色：按下又放開、幾乎沒移動才算（手機上從角色身上開始滑動捲頁時不會觸發）
  let press = null;
  function onPointerDown(e) {
    onPointerMove(e);
    if (e.button !== 0) return; // 右鍵（選單）、中鍵不算點角色
    press = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
    // 滑鼠拖出畫面外也要記得位移（觸控不擷取，才不會妨礙捲動）
    if (e.pointerType === 'mouse') canvas.setPointerCapture?.(e.pointerId);
  }
  function onPointerUp(e) {
    const p = press;
    press = null;
    if (!p || !vrm) return;
    const moved = Math.max(p.moved, Math.hypot(e.clientX - p.x, e.clientY - p.y));
    if (moved > 10 || performance.now() - p.t > 600) return;
    onPointerMove(e);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(vrm.scene, true).length) {
      react();
      onCharacterClick();
    }
  }
  const onPointerCancel = () => (press = null);
  function react() {
    if (!vrm) return;
    idle.play('wave'); // 點角色：打招呼（正在播的待機動作會平順接過去）；不管模型有沒有對應的表情都會揮
    const em = vrm.expressionManager;
    const name = REACTIONS[reactionIndex++ % REACTIONS.length];
    if (!em?.getExpression(name)) return;
    // 上一個表情還沒播完就換下一個：先歸零，不然會殘留在臉上
    if (reaction) em.setValue(reaction.name, 0);
    reaction = { name, t: 0 };
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);

  function resize() {
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / Math.max(1, hgt);
    camera.updateProjectionMatrix();
    frameCamera();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ── 每幀 ──
  const clock = new THREE.Clock();
  let running = true;
  let raf = 0;
  let elapsed = 0;

  // 手機限 30fps：省電，也減輕 GPU 負擔
  const minFrame = mobile ? 1 / 30 : 0;
  let pending = 0;

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!running) return;
    pending += clock.getDelta();
    if (pending < minFrame) return;
    const dt = Math.min(pending, 0.1);
    pending = 0;
    elapsed += dt;
    mixer.update(dt);

    if (vrm) {
      // 待機動作（Fable 設計，src/lib/companion/idle.js）：每格先更新，下面各骨頭再疊上去
      idle.update(dt);
      const add = idle.add;

      // 視線跟著滑鼠（看向鏡頭附近，幅度不大）；待機動作可以把視線帶到別處（gaze）
      pointerSmoothed.lerp(pointer, 1 - Math.exp(-dt * 4));
      const t = new THREE.Vector3().fromArray(SEAT.camera.position);
      lookTarget.position.set(
        t.x + pointerSmoothed.x * 1.6 + add.gaze[0],
        t.y + pointerSmoothed.y * 1.0 + add.gaze[1],
        t.z
      );

      // 呼吸與輕微晃動，加上待機動作對軀幹、頭的疊加
      const breath = Math.sin(elapsed * 1.6);
      const bone = (name) => vrm.humanoid.getNormalizedBoneNode(name);
      const base = (name) => SEAT.pose[name] ?? [0, 0, 0];
      const torso = {
        spine: [base('spine')[0] + breath * 0.012, base('spine')[1], base('spine')[2]],
        chest: [base('chest')[0] + breath * 0.01, base('chest')[1], base('chest')[2]],
        upperChest: base('upperChest'),
        neck: base('neck'),
        head: [
          -pointerSmoothed.y * 0.08,
          pointerSmoothed.x * 0.18 + Math.sin(elapsed * 0.35) * 0.03,
          Math.sin(elapsed * 0.27) * 0.02 + (reaction ? Math.sin(Math.min(reaction.t, 1) * Math.PI) * 0.08 : 0)
        ]
      };
      for (const [name, r] of Object.entries(torso)) {
        const b = bone(name);
        const d = add[name];
        if (b) b.rotation.set(r[0] + d[0], r[1] + d[1], r[2] + d[2]);
      }

      // 手臂與手指：基準坐姿＋前臂、手腕的細微晃動（左右不同步，不會像機器人），再交給待機動作
      const sway = {
        leftLowerArm: [0, Math.sin(elapsed * 0.8) * 0.05, Math.sin(elapsed * 0.6 + 1) * 0.03],
        rightLowerArm: [0, Math.sin(elapsed * 0.7 + 2) * 0.05, Math.sin(elapsed * 0.55 + 0.5) * 0.03],
        leftHand: [Math.sin(elapsed * 1.1 + 0.3) * 0.06, 0, Math.sin(elapsed * 0.9) * 0.05],
        rightHand: [Math.sin(elapsed * 1.0 + 1.7) * 0.06, 0, Math.sin(elapsed * 0.85 + 2.2) * 0.05]
      };
      for (const name of POSE_BONES) {
        const b = bone(name);
        if (!b) continue;
        const r0 = base(name);
        const s0 = sway[name];
        const r = s0 ? [r0[0] + s0[0], r0[1] + s0[1], r0[2] + s0[2]] : r0;
        eulerToQuat(r, _base);
        idle.apply(name, _base, b.quaternion);
      }

      // 眨眼
      const em = vrm.expressionManager;
      if (em) {
        blinkTimer -= dt;
        if (blinkTimer <= 0 && blinkPhase < 0) blinkPhase = 0;
        let blink = 0;
        if (blinkPhase >= 0) {
          blinkPhase += dt / 0.16;
          blink = Math.sin(Math.min(blinkPhase, 1) * Math.PI);
          if (blinkPhase >= 1) { blinkPhase = -1; blinkTimer = 2.5 + Math.random() * 4; blink = 0; }
        }
        // 待機動作裡的閉眼（伸懶腰、轉脖子）
        em.setValue('blink', Math.max(blink, idle.expr.blink ?? 0));
        if (reaction) {
          reaction.t += dt / 2.2;
          const w = reaction.t < 0.15 ? reaction.t / 0.15 : reaction.t > 0.8 ? Math.max(0, (1 - reaction.t) / 0.2) : 1;
          em.setValue(reaction.name, w);
          if (reaction.t >= 1) { em.setValue(reaction.name, 0); reaction = null; }
        }
      }
      vrm.update(dt);
    }
    renderer.render(scene, camera);
  }
  tick();

  return {
    loadModel,
    react,
    /** 頭頂在畫面上的位置（0–1，左上為原點），給對話泡泡定位用 */
    headAnchor() {
      const head = vrm?.humanoid.getRawBoneNode('head');
      if (!head) return null;
      const p = head.getWorldPosition(new THREE.Vector3());
      p.y += 0.28 * modelScale; // 頭骨在下巴附近，往上到頭髮頂
      p.project(camera);
      return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
    },
    setRunning(v) { running = v; if (v) clock.getDelta(); },
    /** 給除錯用：調整座位與鏡頭 */
    debug: { scene, camera, idle, get vrm() { return vrm; }, reseat: () => vrm && seat(vrm), frameCamera, renderer },
    dispose() {
      disposed = true;
      loadToken++;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      if (vrm) VRMUtils.deepDispose(vrm.scene);
      room.scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          for (const m of [].concat(o.material)) {
            for (const k of Object.keys(m)) if (m[k]?.isTexture) m[k].dispose();
            m.dispose();
          }
        }
      });
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
    }
  };
}
