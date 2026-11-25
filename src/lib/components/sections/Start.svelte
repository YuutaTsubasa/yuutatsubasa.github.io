<script>
  import { onMount, tick } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { SCHEDULE } from '$lib/data/schedule.js';
  import { currentLive, nextUpcoming, dayName, formatTime } from '$lib/utils/schedule.js';
  import { now } from '$lib/stores/now.js';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import IdentityCard from '$lib/components/atoms/IdentityCard.svelte';
  import { gotoSection } from '$lib/stores/active.js';

  $: liveStream = currentLive(SCHEDULE, $now);
  $: nextStream = liveStream ? null : nextUpcoming(SCHEDULE, $now);

  // 陪伴模式直接在這個區塊裡開起來（不蓋住整頁），往下捲照常看網站。
  // three.js 等程式只在點下去時才下載。
  let Companion = null;
  let playing = false;
  let error = false;
  let section;
  let enterButton;
  let viaHash = false; // 這次是從 #play 開的：網址離開 #play 時才跟著結束

  let starting = false; // 同一時間只跑一個開啟流程；之後的呼叫只更新 viaHash／manual
  let manual = false; // 有人手動按了 Start：下載完照常打開

  async function start(fromHash = false) {
    if (fromHash) viaHash = true;
    else manual = true;
    if (playing || starting) return;
    starting = true;
    error = false;
    try {
      Companion ??= (await import('$lib/components/companion/Companion.svelte')).default;
    } catch (e) {
      // 網路中斷，或網站更新後舊頁面要的檔案已經不在
      console.error(e);
      error = true;
    }
    starting = false;
    const wantManual = manual;
    manual = false;
    // 網址已經不是 #play 就不算「從 #play 開的」（下載途中用上一頁離開了）
    if (location.hash !== '#play') viaHash = false;
    if (error || !(wantManual || viaHash)) {
      viaHash = false;
      return;
    }
    playing = true;
    // 鍵盤使用者：焦點移到剛出現的陪伴畫面
    await tick();
    section?.querySelector('.companion')?.focus({ preventScroll: true });
  }

  async function stop() {
    playing = false;
    viaHash = false;
    // 從 /#play 進站的：結束後拿掉 #play，重新整理或分享網址才不會又自動開起來
    if (location.hash === '#play') replaceState(location.pathname + location.search, {});
    await tick();
    enterButton?.focus({ preventScroll: true });
  }

  // 開始畫面的背景：H04-B01 的動態桌布（跟使用者電腦桌面同一套，ProjectVtuber 渲染的 20 秒循環）。
  // 先顯示封面圖；不想要動態（減少動態效果、省流量）時就只顯示封面圖。手機用 720p。
  const POSTER = '/companion/start/wallpaper-poster.webp';
  let videoSrc = '';
  let video;
  let inView = true; // 00 區塊在畫面內才播放
  onMount(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) return;
    // 手機（窄螢幕）一律 720p，省流量
    videoSrc = matchMedia('(max-width: 768px)').matches ? '/companion/start/wallpaper-720.mp4' : '/companion/start/wallpaper-1080.mp4';
    // 捲離 00 區塊時暫停，省電
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!video) return;
      if (inView) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(section);
    return () => io.disconnect();
  });

  // 直接開 /#play 的連結：進站就開起來
  // 已經在首頁時連到 /#play（或用上一頁回到 #play）不會重新掛載，所以也聽 hashchange
  onMount(() => {
    const onHash = () => {
      if (location.hash !== '#play') {
        // 用上一頁離開 #play：畫面跟著結束（網址已經不是 #play，不用再改）
        if (playing && viaHash) stop();
        return;
      }
      // 沒有 id="play" 的錨點，瀏覽器不會自己捲：在頁面下方點到 #play 連結時捲回 00
      if (window.scrollY > 0) gotoSection('hero');
      start(true);
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });
</script>

<section id="hero" class="start" data-screen-label="00 Start" bind:this={section}>
  <h1 class="sr-only">悠太翼 YUUTA TSUBASA · 程式系台灣 VTuber</h1>

  {#if playing}
    <svelte:component this={Companion} on:close={stop} />
  {:else}
    <!-- 整塊畫面就是「點一下進入陪伴模式」的按鈕 -->
    <button class="enter" bind:this={enterButton} on:click={() => start()} aria-label="進入陪伴模式：悠太翼在房間裡陪你">
      <span class="bg" aria-hidden="true">
        <img src={POSTER} alt="" fetchpriority="high" />
        {#if videoSrc}
          <video bind:this={video} src={videoSrc} poster={POSTER} autoplay muted loop playsinline preload="auto"
            on:play={() => !inView && video.pause()}></video>
        {/if}
      </span>
      <span class="shade" aria-hidden="true"></span>
      <span class="center">
        <img class="logo" src="/images/logo-knight-white.png" alt="悠太翼 Yuuta Tsubasa" width="2028" height="777" />
      </span>
      <span class="press">
        <span class="prompt tech">
          <span class="blink">▶</span> CLICK TO START
          <span class="zh">點一下，進入陪伴模式</span>
        </span>
        {#if error}
          <span class="err" role="alert">陪伴模式載入失敗，請重新整理頁面再試一次。</span>
        {/if}
      </span>
    </button>

    <!-- 原本 Hero 的身分卡，放在角色左側（不蓋住人）；窄螢幕不顯示，往下捲的 PROFILE 有同樣資料 -->
    <aside class="id-card" aria-label="身分卡">
      <IdentityCard />
    </aside>
  {/if}

  {#if liveStream}
    <a class="live-pill live" href={liveStream.url} target="_blank" rel="noopener">
      <Dot color="#EF4444" />
      <span class="tech">LIVE NOW</span>
      <span class="live-title">{liveStream.title}</span>
    </a>
  {:else if nextStream}
    <a class="live-pill next" href={nextStream.url} target="_blank" rel="noopener">
      <Dot color="#22D3EE" />
      <span class="tech">NEXT STREAM</span>
      <span class="live-title">{nextStream.title}</span>
      <span class="mono">{dayName(new Date(nextStream.startsAt))} {formatTime(new Date(nextStream.startsAt))}</span>
    </a>
  {/if}

  {#if !playing}
    <button class="scroll tech" on:click={() => gotoSection('about')}>
      SCROLL ▼ <span class="zh">往下看網站資訊</span>
    </button>
  {/if}
</section>

<style>
  .start {
    position: relative;
    /* 扣掉上方跑馬燈與導覽列（main 的 padding-top） */
    height: calc(100vh - 88px);
    height: calc(100svh - 88px);
    min-height: 480px;
    overflow: hidden;
    background: #cbd9e8;
  }
  .enter {
    position: absolute;
    inset: 0;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    display: block;
    cursor: pointer;
  }
  .bg img,
  .bg video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* 區塊比 16:9 扁時從下面裁，頭頂不要被切掉 */
    object-position: 50% 15%;
    transition: transform 1.2s ease, filter 0.6s ease;
  }
  .enter:hover .bg > *, .enter:focus-visible .bg > * { transform: scale(1.02); filter: saturate(1.08); }
  .shade {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 55%, rgba(8, 20, 50, 0) 30%, rgba(8, 20, 50, 0.35) 100%),
      linear-gradient(180deg, rgba(244, 246, 251, 0.35) 0%, rgba(244, 246, 251, 0) 35%);
  }
  /* 角色在畫面正中間：Logo 放左上的空白處，「點一下開始」像遊戲標題畫面一樣放在下方中央 */
  .center {
    position: absolute;
    left: 84px;
    top: clamp(16px, 7vh, 72px);
  }
  .press {
    position: absolute;
    left: 50%;
    bottom: 92px;
    transform: translateX(-50%);
    display: grid;
    justify-items: center;
    gap: 10px;
  }
  /* 頻道 logo（騎士盾牌那款；藍色的 logo.webp 已經不用）的白色版，加深藍描邊，壓在場景上才看得清楚 */
  .logo {
    width: min(30vw, 420px);
    height: auto;
    filter: drop-shadow(3px 0 0 #0f2d78) drop-shadow(-3px 0 0 #0f2d78) drop-shadow(0 3px 0 #0f2d78) drop-shadow(0 -3px 0 #0f2d78)
      drop-shadow(0 10px 24px rgba(15, 45, 120, 0.45));
  }
  .prompt {
    display: grid;
    justify-items: center;
    gap: 4px;
    padding: 10px 22px;
    background: rgba(10, 22, 52, 0.62);
    border: 1px solid rgba(147, 197, 253, 0.6);
    color: #fff;
    font-size: clamp(13px, 1.6vw, 16px);
    letter-spacing: 0.28em;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .prompt { white-space: nowrap; }
  .prompt .zh { font-family: var(--font-body); font-size: 0.85em; letter-spacing: 0.12em; color: #bfdbfe; }
  .err {
    padding: 6px 14px;
    background: rgba(220, 38, 38, 0.9);
    color: #fff;
    font-size: 13px;
  }
  .blink { animation: blink 1.2s steps(2, start) infinite; color: #60a5fa; }
  @keyframes blink { to { visibility: hidden; } }

  /* 原本 Hero 的身分卡：左下角，夠高的螢幕才放得下 */
  .id-card {
    position: absolute;
    left: 84px;
    bottom: 24px;
    width: 300px;
    z-index: 2;
  }
  @media (max-width: 1100px), (max-height: 800px) {
    .id-card { display: none; }
  }
  /* 沒有左側欄（≤900px）時往左靠 */
  @media (max-width: 900px) {
    .center { left: 20px; }
    .logo { width: min(42vw, 360px); }
  }
  /* 直式手機：Logo 置中在上方，角色在中間 */
  @media (max-aspect-ratio: 1/1) {
    .center {
      left: 0;
      right: 0;
      top: 16px;
      display: flex;
      justify-content: center;
    }
    .logo { width: min(52vw, 260px); }
    .prompt { letter-spacing: 0.18em; }
  }

  .live-pill {
    position: absolute;
    left: 50%;
    top: 16px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: calc(100vw - 32px);
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--line-strong);
    color: var(--silver-0);
    font-size: 13px;
    white-space: nowrap;
    z-index: 2;
  }
  .live-pill.live { border-color: #ef4444; }
  .live-pill .live-title { overflow: hidden; text-overflow: ellipsis; }
  .live-pill .tech { letter-spacing: 0.16em; font-size: 11px; }

  .scroll {
    position: absolute;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid var(--line-strong);
    color: var(--blue-deep);
    font-size: 12px;
    letter-spacing: 0.24em;
    z-index: 2;
    animation: bob 2.2s ease-in-out infinite;
  }
  .scroll .zh { font-family: var(--font-body); letter-spacing: 0.1em; font-size: 11px; color: var(--silver-2); }
  @keyframes bob { 50% { transform: translate(-50%, 4px); } }

  @media (prefers-reduced-motion: reduce) {
    .blink, .scroll { animation: none; }
    .bg img { transition: none; }
  }
</style>
