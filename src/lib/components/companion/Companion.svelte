<script>
  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
  import { COMPANION_MODELS, COMPANION_MODEL_GROUPS, COMPANION_LIGHTS, COMPANION_PLAYLIST, COMPANION_LINES } from '$lib/data/companion.js';
  import { load, save } from '$lib/companion/storage.js';

  const dispatch = createEventDispatcher();

  let canvas;
  let engine = null;
  let loading = true;
  let loadRatio = 0;
  let loadLabel = 'ROOM';
  let error = '';
  let uiHidden = false;
  let panel = null; // 'todo' | 'model' | 'light' | null
  let mobile = false;

  // ── 時鐘 ──
  let now = new Date();
  const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  $: dateLabel = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${WEEK[now.getDay()]}`;
  $: timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // ── 對話 ──
  let line = '';
  let lineTimer;
  let lastLine = -1;
  let bubbleAt = null; // { x, y }：頭頂在畫面上的比例位置
  function say(text) {
    const at = engine?.headAnchor();
    // 頭太靠近畫面上緣時，泡泡至少留在畫面內
    bubbleAt = at ? { x: Math.min(0.8, Math.max(0.2, at.x)), y: Math.max(0.16, at.y) } : null;
    line = text;
    clearTimeout(lineTimer);
    lineTimer = setTimeout(() => (line = ''), 4500);
  }
  function sayRandom() {
    let i;
    do i = Math.floor(Math.random() * COMPANION_LINES.length);
    while (COMPANION_LINES.length > 1 && i === lastLine);
    lastLine = i;
    say(COMPANION_LINES[i]);
  }

  // ── 番茄鐘 ──
  const pomoClean = (v) => ({
    work: Math.min(180, Math.max(1, Math.round(+v?.work || 25))),
    rest: Math.min(60, Math.max(1, Math.round(+v?.rest || 5)))
  });
  let pomo = pomoClean(load('pomodoro', null));
  let pomoMode = 'work'; // 'work' | 'rest'
  let pomoRunning = false;
  let pomoEndAt = 0;
  let pomoLeft = pomo.work * 60;
  let pomoCycles = 0;
  let pomoEditing = false;
  $: pomoTotal = (pomoMode === 'work' ? pomo.work : pomo.rest) * 60;
  $: pomoRatio = pomoTotal ? pomoLeft / pomoTotal : 0;
  $: pomoLabel = `${String(Math.floor(pomoLeft / 60)).padStart(2, '0')}:${String(pomoLeft % 60).padStart(2, '0')}`;

  function pomoToggle() {
    if (pomoRunning) {
      // 背景暫停回來後馬上按暫停：先追上實際時間（可能已經換到下一段）再停
      pomoTick();
      pomoLeft = Math.max(1, Math.ceil((pomoEndAt - Date.now()) / 1000));
      pomoRunning = false;
    } else {
      unlockChime();
      pomoEndAt = Date.now() + pomoLeft * 1000;
      pomoRunning = true;
      if (pomoMode === 'work' && pomoLeft === pomo.work * 60) say('好，開始專心！我在旁邊陪你。');
    }
  }
  function pomoReset() {
    pomoRunning = false;
    pomoMode = 'work';
    pomoLeft = pomo.work * 60;
  }
  function pomoTick() {
    if (!pomoRunning) return;
    const remaining = pomoEndAt - Date.now();
    if (remaining > 0) {
      pomoLeft = Math.ceil(remaining / 1000);
      return;
    }
    // 手機鎖屏或分頁在背景時計時器會暫停：回來後照實際經過的時間推進，可能一次跨好幾段
    while (pomoEndAt <= Date.now()) {
      if (pomoMode === 'work') pomoCycles += 1;
      pomoMode = pomoMode === 'work' ? 'rest' : 'work';
      pomoEndAt += Math.max(1, pomoMode === 'work' ? pomo.work : pomo.rest) * 60 * 1000;
    }
    pomoLeft = Math.ceil((pomoEndAt - Date.now()) / 1000);
    chime();
    say(pomoMode === 'rest' ? '辛苦了！休息一下吧。' : '休息結束，繼續加油！');
  }
  // 編輯時改的是草稿；儲存時驗證完才套用到計時中的設定
  let pomoDraft = { ...pomo };
  function pomoEdit() {
    pomoDraft = { ...pomo };
    pomoEditing = true;
  }
  function pomoSave() {
    pomo = pomoClean(pomoDraft);
    save('pomodoro', pomo);
    pomoEditing = false;
    pomoReset();
  }
  // 提示音：AudioContext 要在使用者按「開始」時建立／喚醒，iOS Safari 才會出聲
  let audioCtx = null;
  function unlockChime() {
    try {
      audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
      audioCtx.resume?.();
    } catch {}
  }
  function chime() {
    const ctx = audioCtx;
    if (!ctx) return;
    try {
      [880, 1175, 1568].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        o.type = 'sine';
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.65);
      });
    } catch {}
  }


  // ── 待辦 ──
  let todos = load('todos', []);
  let todoInput = '';
  $: todoLeft = todos.filter((t) => !t.done).length;
  function todoAdd() {
    const text = todoInput.trim();
    if (!text) return;
    todos = [...todos, { id: Date.now(), text: text.slice(0, 120), done: false }];
    todoInput = '';
    save('todos', todos);
  }
  function todoToggle(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    save('todos', todos);
    if (todos.find((t) => t.id === id)?.done) say('完成一件了，很棒！');
  }
  function todoRemove(id) {
    todos = todos.filter((t) => t.id !== id);
    save('todos', todos);
  }
  function todoClearDone() {
    todos = todos.filter((t) => !t.done);
    save('todos', todos);
  }

  // ── 音樂 ──
  let audio;
  let playlist = COMPANION_PLAYLIST.map((t) => ({ ...t }));
  let track = 0;
  let playing = false;
  let repeatOne = false;
  let volume = load('volume', 0.6);
  let current = 0;
  let duration = 0;
  let fileInput;
  $: song = playlist[track];
  $: if (audio) audio.volume = volume;

  const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '--:--');

  async function playIndex(i, autoplay = true) {
    track = (i + playlist.length) % playlist.length;
    await tick();
    audio.load();
    if (autoplay) audio.play().catch(() => (playing = false));
  }
  function togglePlay() {
    // 記住使用者要不要音樂：自己按了暫停，下次進來就不自動播
    musicAuto = audio.paused;
    save('musicAuto', musicAuto);
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }
  // 進來就播音樂（使用者 2026-11-26 要的）。從 00 START 點進來時瀏覽器允許有聲自動播放；
  // 直接開 /#play 之類沒點過頁面的情況會被擋，就等訪客第一次在陪伴畫面上點擊或按鍵時再開始
  let musicAuto = load('musicAuto', true) !== false;
  let autoplayPending = false;
  function autoplayMusic() {
    if (!musicAuto || !audio?.paused) return;
    audio.play().catch(() => {
      if (destroyed || autoplayPending) return;
      autoplayPending = true;
      root.addEventListener('pointerdown', autoplayOnGesture, true);
      root.addEventListener('keydown', autoplayOnGesture, true);
    });
  }
  function stopAutoplayWait() {
    if (!autoplayPending) return;
    autoplayPending = false;
    root?.removeEventListener('pointerdown', autoplayOnGesture, true);
    root?.removeEventListener('keydown', autoplayOnGesture, true);
  }
  function autoplayOnGesture(e) {
    // 點的是播放器本身：交給播放器（不然按「播放」會變成先播再停）；調音量、拖進度不會開始播放，所以繼續等下一次點擊。
    // 播放器真的開始播放時（on:play）就不再等
    if (e.target?.closest?.('.music')) return;
    stopAutoplayWait();
    if (musicAuto && audio?.paused) audio.play().catch(() => {});
  }
  function onEnded() {
    if (repeatOne) {
      audio.currentTime = 0;
      audio.play();
    } else {
      playIndex(track + 1);
    }
  }
  function seek(e) {
    if (duration) audio.currentTime = (+e.target.value / 1000) * duration;
  }
  function addFiles(e) {
    const files = [...(e.target.files ?? [])].filter((f) => f.type.startsWith('audio/'));
    if (!files.length) return;
    const start = playlist.length;
    playlist = [
      ...playlist,
      ...files.map((f) => ({ title: f.name.replace(/\.[^.]+$/, ''), artist: '本機檔案', url: URL.createObjectURL(f), local: true }))
    ];
    e.target.value = '';
    playIndex(start);
  }

  // ── 化身 ──
  let modelId = load('model', COMPANION_MODELS[0].id);
  if (!COMPANION_MODELS.some((m) => m.id === modelId)) modelId = COMPANION_MODELS[0].id;
  // 換造型：下載成功才記住；失敗就留在原本的造型（engine 在失敗時不會換掉目前的模型）
  async function pickModel(id) {
    panel = null;
    if (id === modelId) return;
    loading = true;
    try {
      const m = COMPANION_MODELS.find((m) => m.id === id);
      await engine.loadModel(m.url, m.scale);
      modelId = id;
      save('model', id);
      say('換好衣服了，好看嗎？');
    } catch (e) {
      console.error(e);
      say('這套衣服暫時拿不到，等一下再試試看。');
    }
    loading = false;
  }

  // ── 光線 ──
  let lightId = load('light', 'default');
  if (!COMPANION_LIGHTS.some((l) => l.id === lightId)) lightId = 'default';
  $: light = COMPANION_LIGHTS.find((l) => l.id === lightId) ?? COMPANION_LIGHTS[0];
  $: engine?.setLighting(light);
  function pickLight(id) {
    lightId = id;
    save('light', id);
  }

  // ── 其他 ──
  // 只有陪伴模式自己開的全螢幕，離開時才退出（不動使用者原本就開著的全螢幕）
  let ownFullscreen = false;
  let canFullscreen = false; // iPhone Safari 不支援網頁全螢幕，就不顯示按鈕
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        ownFullscreen = false;
      } else {
        // 只讓 00 區塊（陪伴畫面）全螢幕
        await root.requestFullscreen();
        ownFullscreen = true;
        // 全螢幕請求完成前就已經離開陪伴模式
        if (destroyed) document.exitFullscreen().catch(() => {});
      }
    } catch {}
  }
  // 使用者用瀏覽器自己退出全螢幕，就不再算是陪伴模式開的
  function onFullscreenChange() {
    if (!document.fullscreenElement) ownFullscreen = false;
  }
  function close() {
    dispatch('close');
  }
  function onKey(e) {
    if (e.key === 'Escape' && panel) panel = null;
  }

  // 捲離 00 區塊或分頁在背景時暫停 3D 畫面（音樂照常播，可以邊聽邊看網站）
  let root;
  let inView = true;
  let observer;
  function updateRunning() {
    engine?.setRunning(inView && !document.hidden);
  }
  function onVisibility() {
    updateRunning();
  }
  // 首頁的自訂游標畫在最上層：滑鼠在陪伴畫面上時改用系統游標
  function pointerIn() {
    document.documentElement.classList.add('companion-hover');
  }
  function pointerOut() {
    document.documentElement.classList.remove('companion-hover');
  }

  let clockTimer;
  let destroyed = false; // 載入途中就離開時，不要再建立或使用 3D 場景
  onMount(async () => {
    mobile = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    canFullscreen = !!document.fullscreenEnabled;
    observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateRunning();
    });
    observer.observe(root);
    clockTimer = setInterval(() => {
      now = new Date();
      pomoTick();
    }, 500);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    // 一進來就開始放音樂（不用等 3D 場景載完，離點擊越近越不會被瀏覽器擋）
    autoplayMusic();
    try {
      const { createCompanion } = await import('$lib/companion/engine.js');
      if (destroyed) return;
      const created = await createCompanion(canvas, {
        mobile,
        onProgress: (r, label) => { loadRatio = r; loadLabel = label; },
        onCharacterClick: sayRandom
      });
      if (destroyed) return created.dispose();
      engine = created;
      updateRunning();
      const m = COMPANION_MODELS.find((m) => m.id === modelId);
      try {
        await engine.loadModel(m.url, m.scale);
      } catch (e) {
        // 記住的造型載不到（例如之後被移除），退回預設造型，不要讓訪客卡在錯誤畫面
        const fallback = COMPANION_MODELS[0];
        if (m.id === fallback.id || destroyed) throw e;
        console.error(e);
        modelId = fallback.id;
        save('model', fallback.id);
        await engine.loadModel(fallback.url, fallback.scale);
      }
      if (destroyed) return;
      if (import.meta.env.DEV) window.__companion = engine;
      loading = false;
      say('歡迎回來！今天想做什麼呢？');
    } catch (e) {
      if (destroyed) return;
      console.error(e);
      error = '陪伴模式載入失敗。請重新整理頁面再試一次；如果還是不行，可能是瀏覽器不支援 WebGL。';
      loading = false;
    }
  });

  onDestroy(() => {
    destroyed = true;
    clearInterval(clockTimer);
    clearTimeout(lineTimer);
    if (typeof document !== 'undefined') {
      // 不管是按「結束」還是換到別的頁面，都要退出陪伴畫面開的全螢幕
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (ownFullscreen && document.fullscreenElement === root) document.exitFullscreen().catch(() => {});
      document.removeEventListener('visibilitychange', onVisibility);
      document.documentElement.classList.remove('companion-hover');
    }
    observer?.disconnect();
    stopAutoplayWait();
    engine?.dispose();
    // 從畫面移除的 <audio> 仍可能繼續播放：離開時一定要停掉
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    for (const t of playlist) if (t.local) URL.revokeObjectURL(t.url);
    audioCtx?.close().catch(() => {});
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="companion" class:ui-hidden={uiHidden} bind:this={root} role="region" aria-label="悠太翼 陪伴模式" tabindex="-1"
  on:keydown={onKey} on:pointerenter={pointerIn} on:pointerleave={pointerOut}>
  <canvas bind:this={canvas} class="stage" style:filter={light.filter ?? null} aria-label="悠太翼坐在房間裡，點他會說話"></canvas>

  {#if line}
    <div class="bubble" role="status"
      style:left={bubbleAt ? `${bubbleAt.x * 100}%` : null}
      style:top={bubbleAt ? `${bubbleAt.y * 100}%` : null}>{line}</div>
  {/if}

  <!-- 番茄鐘 -->
  <section class="card pomo" inert={uiHidden || undefined} aria-label="番茄鐘">
    <div class="ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" class="track" />
        <circle cx="60" cy="60" r="52" class="bar" class:rest={pomoMode === 'rest'}
          style:stroke-dashoffset={326.7 * (1 - pomoRatio)} />
      </svg>
      <div class="ring-text">
        <span class="tech mode">{pomoMode === 'work' ? 'FOCUS' : 'BREAK'}</span>
        <span class="mono big">{pomoLabel}</span>
        <span class="mono cycles">↻ {pomoCycles}</span>
      </div>
    </div>
    {#if pomoEditing}
      <form class="pomo-edit" on:submit|preventDefault={pomoSave}>
        <label>專心 <input type="number" min="1" max="180" bind:value={pomoDraft.work} /> 分</label>
        <label>休息 <input type="number" min="1" max="60" bind:value={pomoDraft.rest} /> 分</label>
        <button class="chip" type="submit">儲存</button>
      </form>
    {:else}
      <div class="row">
        <button class="icon" on:click={pomoToggle} aria-label={pomoRunning ? '暫停' : '開始'}>
          {#if pomoRunning}<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
          {:else}<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>{/if}
        </button>
        <button class="icon" on:click={pomoReset} aria-label="重設">
          <svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>
        </button>
        <button class="icon" on:click={pomoEdit} aria-label="設定時間">
          <svg viewBox="0 0 24 24"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L15 3.5h-4L10.6 6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>
        </button>
      </div>
    {/if}
  </section>

  <!-- 日期時鐘 -->
  <section class="card clock" inert={uiHidden || undefined} aria-label="時鐘">
    <div class="mono date">{dateLabel}</div>
    <div class="mono time">{timeLabel}</div>
  </section>

  <!-- 音樂 -->
  <section class="card music" inert={uiHidden || undefined} aria-label="音樂播放器">
    <div class="now">
      <div class="disc" class:spin={playing} aria-hidden="true"></div>
      <div class="meta">
        <div class="title">{song?.title ?? '—'}</div>
        <div class="artist">{song?.artist ?? ''}</div>
      </div>
    </div>
    <input class="seek" type="range" min="0" max="1000" value={duration ? (current / duration) * 1000 : 0}
      on:input={seek} aria-label="播放進度" />
    <div class="row controls">
      <span class="mono t">{fmt(current)}</span>
      <button class="icon" on:click={() => playIndex(track - 1)} aria-label="上一首">
        <svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>
      </button>
      <button class="icon main" on:click={togglePlay} aria-label={playing ? '暫停' : '播放'}>
        {#if playing}<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
        {:else}<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>{/if}
      </button>
      <button class="icon" on:click={() => playIndex(track + 1)} aria-label="下一首">
        <svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>
      </button>
      <button class="icon" class:on={repeatOne} on:click={() => (repeatOne = !repeatOne)} aria-label="單曲循環" aria-pressed={repeatOne}>
        <svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zM17 17H7v-3l-4 4 4 4v-3h12v-6h-2z"/></svg>
      </button>
      <span class="mono t">{fmt(duration)}</span>
    </div>
    <div class="row extra">
      <label class="vol">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9zM16.5 12A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>
        <input type="range" min="0" max="1" step="0.01" bind:value={volume} on:change={() => save('volume', volume)} aria-label="音量" />
      </label>
      <button class="chip" on:click={() => fileInput.click()}>＋ 加入自己的音樂</button>
      <input bind:this={fileInput} type="file" accept="audio/*" multiple hidden on:change={addFiles} />
    </div>
    <audio bind:this={audio} src={song?.url} preload="metadata"
      on:play={() => { playing = true; stopAutoplayWait(); }} on:pause={() => (playing = false)} on:ended={onEnded}
      on:timeupdate={() => (current = audio.currentTime)} on:loadedmetadata={() => (duration = audio.duration)}></audio>
  </section>

  <!-- 面板 -->
  {#if panel === 'todo'}
    <section class="card sheet" inert={uiHidden || undefined} aria-label="待辦清單">
      <header><span class="tech">TO-DO</span><span class="mono">{todoLeft} LEFT</span></header>
      <form class="todo-add" on:submit|preventDefault={todoAdd}>
        <input bind:value={todoInput} maxlength="120" placeholder="今天要做什麼？" aria-label="新增待辦" />
        <button class="chip" type="submit">新增</button>
      </form>
      <ul class="todos">
        {#each todos as t (t.id)}
          <li class:done={t.done}>
            <label><input type="checkbox" checked={t.done} on:change={() => todoToggle(t.id)} /> <span>{t.text}</span></label>
            <button class="x" on:click={() => todoRemove(t.id)} aria-label="刪除">×</button>
          </li>
        {:else}
          <li class="empty">還沒有待辦。寫下第一件事吧！</li>
        {/each}
      </ul>
      {#if todos.some((t) => t.done)}
        <button class="chip ghost" on:click={todoClearDone}>清除已完成</button>
      {/if}
      <p class="note">待辦只存在這台裝置的瀏覽器裡。</p>
    </section>
  {:else if panel === 'model'}
    <section class="card sheet" inert={uiHidden || undefined} aria-label="換造型">
      <header><span class="tech">AVATAR</span><span class="mono">{COMPANION_MODELS.length} RIGS</span></header>
      <div class="groups">
        {#each COMPANION_MODEL_GROUPS as g}
          <div class="group" role="group" aria-labelledby="avatar-group-{g.id}">
            <h3 id="avatar-group-{g.id}">{g.label}</h3>
            <ul class="models">
              {#each COMPANION_MODELS.filter((m) => m.group === g.id) as m}
                <li><button class:active={m.id === modelId} aria-pressed={m.id === modelId} aria-label={m.name}
                  on:click={() => pickModel(m.id)}>{m.label}</button></li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </section>
  {:else if panel === 'light'}
    <section class="card sheet" inert={uiHidden || undefined} aria-label="光線">
      <header><span class="tech">LIGHTING</span><span class="mono">{light.label}</span></header>
      <ul class="models lights">
        {#each COMPANION_LIGHTS as l}
          <li><button class:active={l.id === lightId} aria-pressed={l.id === lightId} on:click={() => pickLight(l.id)}>{l.label}</button></li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- 底部按鈕 -->
  <nav class="dock" aria-label="陪伴模式功能">
    <button class:on={panel === 'todo'} on:click={() => (panel = panel === 'todo' ? null : 'todo')} aria-label="待辦清單">
      <svg viewBox="0 0 24 24"><path d="M4 5h2v2H4zm4 0h12v2H8zM4 11h2v2H4zm4 0h12v2H8zm-4 6h2v2H4zm4 0h12v2H8z"/></svg>
      <span>待辦</span>
      {#if todoLeft}<b class="badge">{todoLeft}</b>{/if}
    </button>
    <button class:on={panel === 'model'} on:click={() => (panel = panel === 'model' ? null : 'model')} aria-label="換造型">
      <svg viewBox="0 0 24 24"><path d="M9 3 4 6v5h3v10h10V11h3V6l-5-3a3 3 0 0 1-6 0z"/></svg>
      <span>造型</span>
    </button>
    <button class:on={panel === 'light'} on:click={() => (panel = panel === 'light' ? null : 'light')} aria-label="光線">
      <svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5 1.5 3h-3zm0 20-1.5-3h3zM2 12l3-1.5v3zm20 0-3 1.5v-3zM4.9 4.9l3.2 1-2.1 2.1zm14.2 14.2-3.2-1 2.1-2.1zM4.9 19.1l1-3.2 2.1 2.1zM19.1 4.9l-1 3.2-2.1-2.1z"/></svg>
      <span>光線</span>
    </button>
    <button on:click={() => (uiHidden = !uiHidden)} aria-label={uiHidden ? '顯示介面' : '隱藏介面'} aria-pressed={uiHidden}>
      <svg viewBox="0 0 24 24"><path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
      <span>{uiHidden ? '顯示' : '專心看'}</span>
    </button>
    {#if canFullscreen}
      <button on:click={toggleFullscreen} aria-label="全螢幕">
        <svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>
        <span>全螢幕</span>
      </button>
    {/if}
    <span class="sep" aria-hidden="true"></span>
    <button class="exit" on:click={close} aria-label="結束陪伴模式">
      <svg viewBox="0 0 24 24"><path d="M10 17l1.4-1.4-2.6-2.6H20v-2H8.8l2.6-2.6L10 7l-5 5zM4 3h8v2H4v14h8v2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>
      <span>結束</span>
    </button>
  </nav>

  {#if loading || error}
    <div class="loader" class:solid={!engine}>
      {#if error}
        <p class="err">{error}</p>
        <div class="row">
          <button class="chip" on:click={() => location.reload()}>重新整理</button>
          <button class="chip ghost dark" on:click={close}>結束</button>
        </div>
      {:else}
        <span class="tech">LOADING {loadLabel}</span>
        <div class="bar-wrap"><div class="bar-fill" style:width={`${Math.round(loadRatio * 100)}%`}></div></div>
        <span class="mono">{Math.round(loadRatio * 100)}%</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .companion {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #cbd9e8;
    color: #fff;
    font-family: var(--font-body);
    overflow: hidden;
    cursor: auto;
    outline: none;
  }
  .companion :global(*) { cursor: auto; }
  /* 首頁的自訂游標畫在最上層，陪伴模式裡用系統游標 */
  :global(html.companion-hover .cursor-dot),
  :global(html.companion-hover .cursor-ring) { display: none; }
  .companion .stage:active { cursor: grabbing; }
  .companion button, .companion label, .companion input[type='range'] { cursor: pointer; }
  .stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    /* 手機上手指上下滑動要能捲動整頁（左右滑是轉視角） */
    touch-action: pan-y;
    /* 可以拖曳轉視角 */
    cursor: grab;
  }

  .card {
    position: absolute;
    background: rgba(10, 22, 52, 0.55);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    border: 1px solid rgba(147, 197, 253, 0.45);
    box-shadow: 0 10px 30px rgba(8, 20, 50, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: opacity 0.3s, transform 0.3s;
  }
  .ui-hidden .card, .ui-hidden .bubble { opacity: 0; pointer-events: none; transform: translateY(6px); }

  .row { display: flex; align-items: center; gap: 8px; }
  .icon {
    width: 34px; height: 34px;
    display: grid; place-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(147, 197, 253, 0.35);
    color: #fff;
  }
  .icon svg { width: 18px; height: 18px; fill: currentColor; }
  .icon:hover, .icon.on { background: var(--blue-electric); border-color: var(--blue-glow); }
  .icon.main { width: 42px; height: 42px; background: var(--blue-electric); }
  .chip {
    padding: 6px 12px;
    background: var(--blue-electric);
    border: 1px solid var(--blue-glow);
    color: #fff;
    font-family: var(--font-tech);
    font-size: 12px;
    letter-spacing: 0.06em;
  }
  .chip.ghost { background: transparent; }
  .chip.ghost.dark { color: var(--blue-deep); border-color: var(--blue-deep); }
  .mono { font-family: var(--font-mono); }
  .tech { font-family: var(--font-tech); letter-spacing: 0.18em; }

  /* 番茄鐘 */
  .pomo { top: 16px; left: 16px; padding: 14px; display: grid; gap: 10px; justify-items: center; }
  .ring { position: relative; width: 150px; height: 150px; }
  .ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: rgba(255, 255, 255, 0.15); }
  .ring .bar { stroke: #60a5fa; stroke-dasharray: 326.7; stroke-linecap: round; transition: stroke-dashoffset 0.5s linear; }
  .ring .bar.rest { stroke: #34d399; }
  .ring-text { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; gap: 2px; }
  .ring-text .mode { font-size: 11px; color: #bfdbfe; }
  .ring-text .big { font-size: 32px; font-weight: 500; }
  .ring-text .cycles { font-size: 11px; color: #bfdbfe; }
  .pomo-edit { display: grid; gap: 6px; font-size: 13px; }
  .pomo-edit input { width: 52px; padding: 2px 4px; background: rgba(255,255,255,.9); color: #0b1428; border: 0; }

  /* 時鐘 */
  .clock { top: 16px; right: 16px; padding: 12px 22px; text-align: center; }
  .clock .date { font-size: 14px; color: #dbeafe; }
  .clock .time { font-size: 56px; line-height: 1.05; letter-spacing: 0.04em; }

  /* 音樂 */
  .music { left: 16px; bottom: 92px; width: 340px; padding: 14px 16px; display: grid; gap: 8px; }
  .now { display: flex; gap: 12px; align-items: center; }
  .disc {
    width: 44px; height: 44px; border-radius: 50%; flex: none;
    background: radial-gradient(circle, #0b1428 0 18%, #93c5fd 19% 22%, #1d4ed8 23% 60%, #60a5fa 61% 64%, #1e3a8a 65%);
  }
  .disc.spin { animation: spin 4s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .meta { min-width: 0; }
  .title { font-family: var(--font-tech); font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .artist { font-size: 12px; color: #bfdbfe; }
  .seek { width: 100%; accent-color: #60a5fa; }
  .controls { justify-content: space-between; }
  .controls .t { font-size: 11px; color: #bfdbfe; min-width: 34px; }
  .extra { justify-content: space-between; }
  .vol { display: flex; align-items: center; gap: 6px; }
  .vol svg { width: 16px; height: 16px; fill: #bfdbfe; }
  .vol input { width: 90px; accent-color: #60a5fa; }

  /* 面板 */
  .sheet { right: 16px; bottom: 92px; width: 320px; max-height: min(60vh, 460px); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
  .sheet header { display: flex; justify-content: space-between; font-size: 12px; color: #bfdbfe; }
  .todo-add { display: flex; gap: 6px; }
  .todo-add input { flex: 1; min-width: 0; padding: 6px 8px; background: rgba(255,255,255,.92); color: #0b1428; border: 0; font-size: 14px; }
  .todos { list-style: none; margin: 0; padding: 0; overflow-y: auto; display: grid; gap: 4px; }
  .todos li { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; background: rgba(255,255,255,.06); }
  .todos li label { display: flex; gap: 8px; align-items: center; font-size: 14px; min-width: 0; }
  .todos li label span { overflow-wrap: anywhere; }
  .todos li.done span { text-decoration: line-through; opacity: 0.55; }
  .todos li.empty { font-size: 13px; color: #bfdbfe; }
  .todos input[type='checkbox'] { accent-color: #60a5fa; width: 16px; height: 16px; flex: none; }
  .x { background: none; border: 0; color: #bfdbfe; font-size: 18px; line-height: 1; }
  .note { margin: 0; font-size: 11px; color: #93c5fd; }
  .groups { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .group h3 { margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #bfdbfe; letter-spacing: .08em; }
  .group .models { grid-template-columns: 1fr; }
  .models { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .models button { width: 100%; padding: 10px; background: rgba(255,255,255,.06); border: 1px solid rgba(147,197,253,.35); color: #fff; font-family: var(--font-tech); letter-spacing: .08em; }
  .models button.active { background: var(--blue-electric); border-color: var(--blue-glow); }

  /* 對話泡泡 */
  .bubble {
    position: absolute;
    left: 50%;
    top: 14%;
    /* 泡泡的下緣對齊頭頂 */
    transform: translate(-50%, -100%);
    max-width: min(80vw, 420px);
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.95);
    color: #0b1428;
    border: 2px solid var(--blue-electric);
    font-size: 15px;
    line-height: 1.5;
    box-shadow: 0 8px 24px rgba(15, 45, 120, 0.25);
    animation: pop 0.25s ease-out;
    pointer-events: none;
  }
  @keyframes pop { from { opacity: 0; transform: translate(-50%, calc(-100% + 6px)); } }

  /* 底部按鈕 */
  .dock {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
    background: rgba(10, 22, 52, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(147, 197, 253, 0.45);
  }
  .dock button {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 2px;
    min-width: 58px;
    padding: 6px 8px;
    background: transparent;
    border: 1px solid transparent;
    color: #fff;
    font-size: 11px;
    white-space: nowrap;
  }
  .dock button svg { width: 22px; height: 22px; fill: currentColor; }
  .dock button:hover, .dock button.on { background: rgba(37, 99, 235, 0.55); border-color: var(--blue-glow); }
  .dock .exit:hover { background: rgba(220, 38, 38, 0.7); border-color: #f87171; }
  .dock .sep { width: 1px; align-self: stretch; background: rgba(147, 197, 253, 0.35); margin: 0 2px; }
  .badge {
    position: absolute; top: 2px; right: 8px;
    min-width: 16px; height: 16px; padding: 0 4px;
    border-radius: 8px; background: var(--accent-warn); font-size: 10px; line-height: 16px;
  }

  /* 載入 */
  .loader {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 10px;
    background: rgba(203, 217, 232, 0.6);
    color: var(--silver-0);
    z-index: 5;
  }
  .loader.solid { background: linear-gradient(160deg, #e8eef8, #c3d3ea); }
  .bar-wrap { width: min(70vw, 320px); height: 6px; background: rgba(15, 45, 120, 0.15); }
  .bar-fill { height: 100%; background: var(--blue-electric); transition: width 0.2s; }
  .err { max-width: 80vw; text-align: center; }

  /* 寬螢幕時網站左右有固定的側欄（章節編號、社群按鈕），介面往內縮讓開 */
  @media (min-width: 901px) {
    .pomo { left: 84px; }
    .music { left: 84px; }
    .clock { right: 66px; }
    .sheet { right: 66px; }
  }

  /* 手機 */
  @media (max-width: 768px) {
    .pomo { top: 10px; left: 10px; padding: 8px; gap: 6px; }
    .ring { width: 96px; height: 96px; }
    .ring-text .big { font-size: 20px; }
    .ring-text .mode, .ring-text .cycles { font-size: 9px; }
    .icon { width: 28px; height: 28px; }
    .clock { top: 10px; right: 10px; padding: 6px 12px; }
    .clock .date { font-size: 11px; }
    .clock .time { font-size: 34px; }
    .music { left: 10px; right: 10px; width: auto; bottom: 84px; padding: 10px 12px; gap: 6px; }
    .title { font-size: 15px; }
    .vol { display: none; }
    .extra { justify-content: flex-end; }
    .sheet { left: 10px; right: 10px; width: auto; bottom: 84px; max-height: 55vh; }
    .bubble { font-size: 14px; }
    .dock { bottom: 10px; gap: 2px; padding: 4px; max-width: calc(100vw - 20px); }
    .dock button { min-width: 0; padding: 5px 6px; font-size: 10px; }
    .dock button svg { width: 20px; height: 20px; }
  }
</style>
