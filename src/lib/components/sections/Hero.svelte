<script>
  import { onMount, onDestroy } from 'svelte';
  import { PROFILE } from '$lib/data/profile.js';
  import { SCHEDULE } from '$lib/data/schedule.js';
  import { currentLive, nextUpcoming, dayName, formatDate, formatTime } from '$lib/utils/schedule.js';
  import { now } from '$lib/stores/now.js';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Tele from '$lib/components/atoms/Tele.svelte';
  import ScanBar from '$lib/components/atoms/ScanBar.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  $: liveStream = currentLive(SCHEDULE, $now);
  $: nextStream = liveStream ? null : nextUpcoming(SCHEDULE, $now);

  let timeStr = '';
  let dateStr = '';
  let signal = 92;
  let scrollY = 0;
  let interval;
  let signalInterval;
  let scrollHandler;
  let dust = [];

  function update() {
    const t = new Date();
    timeStr = t.toTimeString().slice(0, 8);
    dateStr = t.toISOString().slice(0, 10).replace(/-/g, '.');
  }

  onMount(() => {
    update();
    interval = setInterval(update, 1000);
    signalInterval = setInterval(() => {
      signal = Math.round(90 + Math.sin(Date.now() / 700) * 9);
    }, 140);

    // dust 粒子：60 個小白點 + 各自 float-up + opacity twinkle
    dust = Array.from({ length: 60 }, () => ({
      cx: Math.random() * 1000,
      cy: 350 + Math.random() * 400,
      r: 0.5 + Math.random() * 1.4,
      duration: 9 + Math.random() * 13,
      delay: -Math.random() * 16,
      opacity: 0.3 + Math.random() * 0.55
    }));

    // 視差：背景圖滾動時上移較慢
    let raf = 0;
    scrollHandler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        scrollY = window.scrollY;
        raf = 0;
      });
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
    if (signalInterval) clearInterval(signalInterval);
    if (scrollHandler && typeof window !== 'undefined') {
      window.removeEventListener('scroll', scrollHandler);
    }
  });

  const vitals = [
    { label: 'SONIC LOVE',      value: 99, color: '#60A5FA' },
    { label: 'CODING POWER',    value: 88, color: '#A78BFA' },
    { label: 'STREAMING VALUE', value: 92, color: '#22D3EE' }
  ];
</script>

<section id="hero" class="hero" data-screen-label="01 Hero">
  <h1 class="sr-only">悠太翼 YUUTA TSUBASA · 程式系台灣 VTuber</h1>
  <div aria-hidden class="bg-art" style:transform={`translate3d(0, ${scrollY * 0.28}px, 0) scale(1.05)`}></div>
  <div aria-hidden class="bg-vignette"></div>
  <div aria-hidden class="bg-slash"></div>
  <svg aria-hidden class="bg-dust" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
    {#each dust as p}
      <circle
        cx={p.cx}
        cy={p.cy}
        r={p.r}
        fill={`rgba(255, 255, 255, ${p.opacity})`}
        class="dust-particle"
        style="animation-duration: {p.duration}s; animation-delay: {p.delay}s;"
      />
    {/each}
  </svg>
  <div aria-hidden class="watermark display" style:transform={`translate3d(0, ${-scrollY * 0.12}px, 0)`}>KNIGHT</div>

  <div class="wrap inner">
    <!-- LEFT: identity card -->
    <div class="col-left">
      <div class="mono trans">▸ TRANSMISSION ESTABLISHED // {dateStr}</div>

      <div class="card" use:reveal={{ delay: 80 }}>
        <Corners />
        <div class="mono caption">// IDENTITY CARD</div>
        <div class="display name-block">
          {#each PROFILE.name_breakdown as ch}
            <div class="name-char">
              <span class="kana-top">{ch.kana}</span>
              <span class="cjk">{ch.cjk}</span>
              <span class="bopo">
                <span class="bopo-syl">{ch.bopo}</span>
                {#if ch.tone}<span class={`bopo-tone tone-${ch.tone}`} aria-label={`第${ch.tone}聲`}></span>{/if}
              </span>
              <span class="pinyin">{ch.pinyin}</span>
            </div>
          {/each}
        </div>
        <div class="tech name-en-sub">
          {#each PROFILE.name_en.split('') as c}
            <span class="en-c">{c === ' ' ? ' ' : c}</span>
          {/each}
        </div>
        <div class="hr"></div>
        <div class="tele-list">
          <Tele label="ROLE" value={PROFILE.callsign} accent="var(--blue-bright)" />
          <Tele label="DEBUT" value={PROFILE.debut} />
          <Tele label="BIRTH" value={PROFILE.birth} />
          <Tele label="ORIGIN" value={PROFILE.origin} />
          <Tele label="LANGUAGE" value={PROFILE.language} />
          <Tele label="CONTENT" value={PROFILE.content} />
          <Tele label="AGENCY" value={PROFILE.agency} accent="var(--accent-cyan)" />
          <Tele label="PLATFORM" value={PROFILE.platform} />
          <Tele label="FANBASE" value={PROFILE.fanbase} />
        </div>
        <div class="hr"></div>
        <ScanBar progress={signal} label="SIGNAL" />
      </div>

      {#if liveStream}
        <a class="live-pill live" href={liveStream.url} target="_blank" rel="noopener" use:reveal={{ delay: 220 }}>
          <Dot color="#EF4444" />
          <span class="tech live-label">LIVE NOW</span>
          <span class="live-title">{liveStream.title}</span>
          <span class="spacer"></span>
          <span class="mono live-time">{liveStream.platforms?.join(' · ')}</span>
        </a>
      {:else if nextStream}
        <a class="live-pill next" href={nextStream.url} target="_blank" rel="noopener" use:reveal={{ delay: 220 }}>
          <Dot color="#22D3EE" />
          <span class="tech next-label">NEXT STREAM</span>
          <span class="live-title">{nextStream.title}</span>
          <span class="spacer"></span>
          <span class="mono live-time">
            {dayName(new Date(nextStream.startsAt))} {formatTime(new Date(nextStream.startsAt))}
          </span>
        </a>
      {/if}
    </div>

    <!-- MIDDLE: mission / vitals -->
    <div class="col-mid">
      <div class="card pad-md" use:reveal={{ delay: 140 }}>
        <Corners />
        <div class="mono caption">// MISSION BRIEF</div>
        <div class="tech mission">
          來自【終焉理想庭】的台灣 VTuber，以程式・遊戲・唱歌・雜談為主軸，將日常的好奇心一同直播。
        </div>
      </div>

      <div class="card pad-md" use:reveal={{ delay: 200 }}>
        <Corners />
        <div class="mono caption">// VITALS</div>
        <div class="vitals">
          {#each vitals as v}
            <div>
              <div class="vital-hdr">
                <span>{v.label}</span>
                <span style:color={v.color}>{v.value}/100</span>
              </div>
              <div class="vital-track">
                <div
                  class="vital-fill"
                  style:width={`${v.value}%`}
                  style:background={v.color}
                  style:box-shadow={`0 0 8px ${v.color}`}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="mono sysinfo" use:reveal={{ delay: 280 }}>
        ::SYS / OPTIMAL<br />
        ::CONN / 4G STABLE<br />
        ::FPS / 60 LOCK<br />
        ::ENC / RSA-4096
      </div>
    </div>

    <!-- RIGHT: HUD overlay -->
    <div class="col-right">
      <svg viewBox="0 0 600 600" class="ring-svg">
        <circle cx="300" cy="300" r="280" fill="none" stroke="var(--blue-bright)" stroke-width="0.5" stroke-dasharray="2 6" />
        <circle cx="300" cy="300" r="240" fill="none" stroke="var(--blue-bright)" stroke-width="0.5" stroke-dasharray="20 4" />
        <circle cx="300" cy="300" r="200" fill="none" stroke="var(--blue-bright)" stroke-width="1" />
        {#each Array.from({ length: 24 }) as _, i}
          <line x1="300" y1="20" x2="300" y2={i % 6 === 0 ? 40 : 30} stroke="var(--blue-bright)" stroke-width="0.8" transform={`rotate(${i * 15} 300 300)`} />
        {/each}
      </svg>

      <svg viewBox="0 0 120 120" class="crosshair">
        <circle cx="60" cy="60" r="3" fill="currentColor" />
        <circle cx="60" cy="60" r="22" fill="none" stroke="currentColor" stroke-width="0.8" />
        <line x1="60" y1="0" x2="60" y2="38" stroke="currentColor" stroke-width="0.8" />
        <line x1="60" y1="82" x2="60" y2="120" stroke="currentColor" stroke-width="0.8" />
        <line x1="0" y1="60" x2="38" y2="60" stroke="currentColor" stroke-width="0.8" />
        <line x1="82" y1="60" x2="120" y2="60" stroke="currentColor" stroke-width="0.8" />
      </svg>

      <div class="reticle-top">
        <div class="reticle-row">
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M14 0 H20 M20 0 V6" stroke="currentColor" stroke-width="1" fill="none" /></svg>
          <span>HEAD ／ TARGET LOCKED</span>
        </div>
      </div>

      <div class="reticle-mid">
        <div class="reticle-row">
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M0 0 H6 M0 0 V6" stroke="currentColor" stroke-width="1" fill="none" /></svg>
          <span>ARMOR ／ AZURE-PLATE</span>
        </div>
        <div class="integrity">INTEGRITY 98.3%</div>
      </div>

      <div class="scroll-hint mono">▼ SCROLL TO UNFOLD ARCHIVE ▼</div>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100vh;
    padding-top: 96px;
    overflow: hidden;
  }
  .bg-art {
    position: absolute;
    inset: 0;
    background-image: image-set(
      url('/images/yuuta-figure-1-1280.webp') 1x,
      url('/images/yuuta-figure-1-2560.webp') 2x
    );
    background-image: -webkit-image-set(
      url('/images/yuuta-figure-1-1280.webp') 1x,
      url('/images/yuuta-figure-1-2560.webp') 2x
    );
    background-size: cover;
    background-position: 70% 25%;
    background-repeat: no-repeat;
    z-index: 0;
  }
  @media (min-width: 1280px) {
    .bg-art {
      background-image: image-set(
        url('/images/yuuta-figure-1-1920.webp') 1x,
        url('/images/yuuta-figure-1-2560.webp') 1.5x
      );
      background-image: -webkit-image-set(
        url('/images/yuuta-figure-1-1920.webp') 1x,
        url('/images/yuuta-figure-1-2560.webp') 1.5x
      );
    }
  }
  .bg-vignette {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(244, 246, 251, 0.78) 0%, rgba(244, 246, 251, 0.25) 22%, rgba(244, 246, 251, 0) 38%, rgba(244, 246, 251, 0) 58%, rgba(244, 246, 251, 0.25) 75%, rgba(244, 246, 251, 0.78) 100%),
      linear-gradient(180deg, rgba(244, 246, 251, 0.4) 0%, rgba(244, 246, 251, 0) 18%, rgba(244, 246, 251, 0) 80%, rgba(244, 246, 251, 0.85) 100%);
    z-index: 1;
    pointer-events: none;
  }
  .bg-slash {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, transparent 38%, rgba(59, 130, 246, 0.10) 38.2%, rgba(59, 130, 246, 0.10) 62%, transparent 62.2%),
      linear-gradient(115deg, transparent 64%, rgba(34, 211, 238, 0.04) 64.2%, rgba(34, 211, 238, 0.04) 92%, transparent 92.2%);
    z-index: 1;
    pointer-events: none;
  }
  .bg-dust {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }
  .dust-particle {
    animation-name: dust-float;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes dust-float {
    0%   { transform: translateY(0); opacity: 0; }
    10%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateY(-220px); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .dust-particle { animation: none; opacity: 0.5; }
  }
  .watermark {
    position: absolute;
    top: 120px;
    right: -40px;
    font-size: min(28vw, 420px);
    line-height: 0.85;
    font-weight: 900;
    background: linear-gradient(180deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.04em;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1;
  }
  .inner {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 380px 240px 1fr;
    gap: 32px;
    align-items: start;
  }

  .col-left { padding-top: 24px; }
  .col-mid { padding-top: 24px; display: flex; flex-direction: column; gap: 18px; }
  .col-right {
    position: relative;
    height: calc(100vh - 140px);
    min-height: 560px;
  }

  .trans {
    display: inline-block;
    color: #7CC4FF;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    margin-bottom: 14px;
    padding: 4px 10px;
    background: rgba(8, 16, 31, 0.92);
    border: 1px solid rgba(124, 196, 255, 0.32);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 14px rgba(8, 16, 31, 0.18);
  }

  .card {
    position: relative;
    padding: 22px 22px 28px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(241, 244, 251, 0.7));
    border: 1px solid var(--line);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 4px 18px rgba(15, 45, 120, 0.06);
  }
  .pad-md { padding: 18px; }

  .caption {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    margin-bottom: 10px;
  }
  .name-block {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 32px;
    width: 100%;
  }
  .name-char {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
  }
  .kana-top {
    font-size: 10px;
    color: var(--blue-bright);
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .cjk {
    font-size: 38px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 1;
  }
  .bopo {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 3px;
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .bopo-syl {
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-size: 10px;
    color: var(--silver-3);
    line-height: 1.1;
    letter-spacing: 0.04em;
  }
  /* 用 CSS 畫聲調符號，避免 modifier letter 在不同瀏覽器渲染太小看不到 */
  .bopo-tone {
    display: inline-block;
    width: 6px;
    height: 14px;
    position: relative;
    margin-top: 1px;
    flex-shrink: 0;
  }
  .bopo-tone.tone-2::before {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 5px;
    height: 1px;
    background: var(--silver-2);
    transform: rotate(-40deg);
    transform-origin: left center;
  }
  .bopo-tone.tone-3::before {
    content: 'ˇ';
    position: absolute;
    top: -3px;
    left: 0;
    font-size: 10px;
    color: var(--silver-2);
    font-weight: 700;
    line-height: 1;
  }
  .bopo-tone.tone-4::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 0;
    width: 5px;
    height: 1px;
    background: var(--silver-2);
    transform: rotate(40deg);
    transform-origin: left center;
  }
  .bopo-tone.tone-5::before {
    content: '·';
    position: absolute;
    top: -2px;
    left: 1px;
    font-size: 12px;
    color: var(--silver-2);
    font-weight: 700;
    line-height: 1;
  }
  .pinyin {
    font-size: 10px;
    color: var(--silver-2);
    margin-top: 4px;
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }
  .name-en-sub {
    display: flex;
    justify-content: center;
    width: 100%;
    font-size: 14px;
    color: var(--blue-bright);
    margin-top: 8px;
    letter-spacing: 0.22em;
  }
  .en-c {
    display: inline-block;
    min-width: 0.4em;
    text-align: center;
  }
  .hr {
    height: 1px;
    background: var(--line);
    margin: 18px 0;
  }
  .tele-list { display: grid; gap: 8px; }

  .live-pill {
    margin-top: 18px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    backdrop-filter: blur(10px);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .live-pill:hover {
    transform: translateY(-2px);
  }
  .live-pill.live {
    border: 1px solid rgba(220, 38, 38, 0.55);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(254, 242, 242, 0.9));
    box-shadow: 0 4px 18px rgba(220, 38, 38, 0.14);
  }
  .live-pill.next {
    border: 1px solid rgba(8, 145, 178, 0.45);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(236, 254, 255, 0.9));
    box-shadow: 0 4px 18px rgba(8, 145, 178, 0.12);
  }
  .live-label {
    color: #B91C1C;
    font-size: 12px;
    letter-spacing: 0.14em;
    font-weight: 700;
  }
  .next-label {
    color: var(--accent-cyan);
    font-size: 12px;
    letter-spacing: 0.14em;
    font-weight: 700;
  }
  .live-title {
    color: var(--silver-1);
    font-size: 12px;
  }
  .spacer { flex: 1; }
  .live-time {
    font-size: 11px;
    color: var(--silver-2);
  }

  .mission {
    font-size: 13px;
    line-height: 1.7;
    color: var(--silver-1);
  }
  .vitals { display: grid; gap: 10px; margin-top: 6px; }
  .vital-hdr {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }
  .vital-track {
    height: 3px;
    background: rgba(30, 58, 138, 0.10);
    position: relative;
  }
  .vital-fill {
    height: 100%;
  }
  .sysinfo {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    line-height: 2;
  }

  .ring-svg {
    position: absolute;
    top: 50%;
    right: 8%;
    width: 520px;
    height: 520px;
    transform: translateY(-50%);
    animation: spin-slow 80s linear infinite;
    opacity: 0.5;
  }
  .crosshair {
    position: absolute;
    top: 38%;
    right: 22%;
    width: 110px;
    height: 110px;
    color: var(--blue-bright);
    opacity: 0.75;
  }
  .reticle-top {
    position: absolute;
    top: 60px;
    right: 10%;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--blue-bright);
    text-align: right;
  }
  .reticle-top .reticle-row {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 8px;
  }
  .reticle-mid {
    position: absolute;
    top: 55%;
    left: 20px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent-cyan);
  }
  .reticle-mid .reticle-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .integrity {
    margin-top: 4px;
    color: var(--silver-3);
    padding-left: 28px;
  }
  .scroll-hint {
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }

  @media (max-width: 1100px) {
    .hero { padding-top: 700px; }
    .inner { grid-template-columns: 1fr; gap: 24px; }
    .col-right { height: 500px; min-height: 500px; }
    .watermark { font-size: min(36vw, 320px); }
  }
</style>
