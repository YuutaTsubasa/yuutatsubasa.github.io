<script>
  import { createEventDispatcher } from 'svelte';
  import { SCHEDULE } from '$lib/data/schedule.js';
  import { currentLive, nextUpcoming, dayName, formatTime } from '$lib/utils/schedule.js';
  import { now } from '$lib/stores/now.js';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import { gotoSection } from '$lib/stores/active.js';

  /** 陪伴模式載入失敗時顯示提示 */
  export let error = false;

  const dispatch = createEventDispatcher();

  $: liveStream = currentLive(SCHEDULE, $now);
  $: nextStream = liveStream ? null : nextUpcoming(SCHEDULE, $now);

</script>

<section id="hero" class="start" data-screen-label="00 Start">
  <h1 class="sr-only">悠太翼 YUUTA TSUBASA · 程式系台灣 VTuber</h1>

  <!-- 整塊畫面就是「點一下進入陪伴模式」的按鈕 -->
  <button class="enter" on:click={() => dispatch('enter')} aria-label="進入陪伴模式：悠太翼在房間裡陪你">
    <picture class="bg" aria-hidden="true">
      <source media="(max-aspect-ratio: 1/1)" srcset="/companion/start-portrait.webp" />
      <img src="/companion/start.webp" alt="" fetchpriority="high" />
    </picture>
    <span class="shade" aria-hidden="true"></span>
    <span class="center">
      <img class="logo" src="/images/logo-knight.png" alt="悠太翼 Yuuta Tsubasa" width="2028" height="777" />
      <span class="prompt tech">
        <span class="blink">▶</span> CLICK TO START
        <span class="zh">點一下，進入陪伴模式</span>
      </span>
      {#if error}
        <span class="err" role="alert">陪伴模式載入失敗，請重新整理頁面再試一次。</span>
      {/if}
    </span>
  </button>

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

  <button class="scroll tech" on:click={() => gotoSection('about')}>
    SCROLL ▼ <span class="zh">往下看網站資訊</span>
  </button>
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
  .bg img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s ease, filter 0.6s ease;
  }
  .enter:hover .bg img, .enter:focus-visible .bg img { transform: scale(1.02); filter: saturate(1.08); }
  .shade {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 55%, rgba(8, 20, 50, 0) 30%, rgba(8, 20, 50, 0.35) 100%),
      linear-gradient(180deg, rgba(244, 246, 251, 0.35) 0%, rgba(244, 246, 251, 0) 35%);
  }
  .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(14px, 3vh, 28px);
    padding: 0 16px;
  }
  /* 頻道 logo 是黑色騎士盾牌那款（藍色的 logo.webp 已經不用）；跟直播封面一樣加白色描邊，壓在場景上才看得清楚 */
  .logo {
    width: min(78vw, 760px);
    height: auto;
    filter: drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff)
      drop-shadow(0 10px 24px rgba(15, 45, 120, 0.35));
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
  .prompt .zh { font-family: var(--font-body); font-size: 0.85em; letter-spacing: 0.12em; color: #bfdbfe; }
  .err {
    padding: 6px 14px;
    background: rgba(220, 38, 38, 0.9);
    color: #fff;
    font-size: 13px;
  }
  .blink { animation: blink 1.2s steps(2, start) infinite; color: #60a5fa; }
  @keyframes blink { to { visibility: hidden; } }

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
