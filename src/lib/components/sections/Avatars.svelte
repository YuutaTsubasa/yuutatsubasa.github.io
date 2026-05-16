<script>
  import { onMount, onDestroy } from 'svelte';
  import { VERSIONS } from '$lib/data/versions.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Panel from '$lib/components/atoms/Panel.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import Tag from '$lib/components/atoms/Tag.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  const FALLBACK_IMG = '/images/yuuta-figure-1-1920.webp';

  let selectedIdx = VERSIONS.length - 1;
  let imgIdx = 0;

  $: active = VERSIONS[selectedIdx];
  $: gallery = active.gallery && active.gallery.length > 0 ? active.gallery : [active.image];
  $: currentImg = gallery[imgIdx] ?? FALLBACK_IMG;

  function selectVersion(i) {
    selectedIdx = i;
    imgIdx = 0;
  }

  function imgError(e) {
    if (e.target.src.endsWith(FALLBACK_IMG)) return;
    e.target.src = FALLBACK_IMG;
  }

  let scanning = 75;
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      scanning = 60 + Math.round(Math.sin(Date.now() / 800) * 15 + 15);
    }, 120);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<section id="avatars" class="avatars" data-screen-label="05 Avatars">
  <div class="wrap">
    <SectionHead
      id="avatars"
      en="AVATARS"
      zh="化身展示"
      deco={`RIGS :: ${VERSIONS.length}\nFORMATS :: LIVE2D / 3D\nLATEST :: V${VERSIONS.at(-1)?.version ?? ''}`}
    />

    <!-- Version selector pills -->
    <div class="pills">
      <span class="mono pills-label">SELECT VERSION ▸</span>
      {#each VERSIONS as v, i}
        <button
          class="pill tech"
          class:on={selectedIdx === i}
          on:click={() => selectVersion(i)}
        >
          <span class="pill-num">V{v.short}</span>
        </button>
      {/each}
    </div>

    <!-- Showcase slab -->
    <div class="slab">
      <div class="slab-overlay"></div>

      <svg viewBox="0 0 300 200" class="trace">
        <path d="M0 80 L60 80 L80 60 L160 60 M0 100 L40 100 L60 120 L120 120" stroke="white" stroke-width="0.6" fill="none" />
        <circle cx="160" cy="60" r="3" fill="white" />
        <circle cx="120" cy="120" r="3" fill="white" />
        <text x="0" y="50" fill="white" font-size="10" font-family="JetBrains Mono">::// AVATAR TRACE · V{active.version}</text>
      </svg>

      <div class="display watermark wm-top" aria-hidden>AVA</div>
      <div class="display watermark wm-mid" aria-hidden>TARS</div>
      <div class="tech watermark wm-sub">{active.type.toUpperCase()}</div>

      <div class="mono v-tag">:// VERSION {active.version} //:</div>

      <div class="corner-mark">
        <div class="display mark">V{active.short}</div>
        <div class="tech mark-type">{active.type}</div>
      </div>

      <div class="scan-panel">
        <div class="mono scan-label">運送中</div>
        <div class="display scan-value">{scanning}%</div>
        <div class="mono scan-tag">SCANNING</div>
      </div>

      <!-- Main image viewport -->
      <div class="viewport">
        {#key `${active.id}-${imgIdx}`}
          <img
            src={currentImg}
            alt={`Avatar V${active.version}`}
            on:error={imgError}
          />
        {/key}
      </div>

      <!-- Credits panel -->
      <div class="credits">
        <div class="mono credits-hdr">// CREDITS · V{active.version}</div>
        {#each active.credits as c}
          <div class="cred-row">
            <span class="mono cred-lbl">{c.role}</span>
            <a class="tech cred-val" href={c.url} target="_blank" rel="noopener">
              {c.name} <span class="arr">↗</span>
            </a>
          </div>
          {#if c.note}
            <div class="mono cred-note">└ {c.note}</div>
          {/if}
        {/each}
      </div>

      <div class="bottom-bar">
        <div class="verify">
          <Dot color="#7CC4FF" />
          <span class="mono">驗證通過 / 99%</span>
        </div>
        <div class="mono brand-tag">[ V{active.version} · {active.type.toUpperCase()} ]</div>
      </div>
    </div>

    <!-- Gallery thumbnail strip -->
    {#if gallery.length > 1}
      <div class="thumbs">
        <span class="mono thumbs-label">GALLERY ▸ {imgIdx + 1} / {gallery.length}</span>
        <div class="thumbs-list">
          {#each gallery as g, i}
            <button
              class="thumb"
              class:on={imgIdx === i}
              on:click={() => (imgIdx = i)}
              aria-label={`Image ${i + 1}`}
            >
              <img src={g} alt="" on:error={imgError} />
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Version timeline (clickable) -->
    <div class="timeline-block">
      <div class="timeline-head">
        <div class="mono caption">// VERSION TIMELINE</div>
        <div class="tech timeline-sub">化身演進史 — CLICK TO SHOWCASE</div>
      </div>
      <div class="timeline">
        {#each VERSIONS as v, i}
          <button
            class="version-card"
            class:on={i === selectedIdx}
            on:click={() => selectVersion(i)}
            use:reveal={{ delay: 80 + i * 80, distance: 18 }}
          >
            <div class="version-rail">
              <span class="rail-dot" class:on={i === selectedIdx}></span>
              {#if i < VERSIONS.length - 1}
                <span class="rail-line"></span>
              {/if}
            </div>
            <div class="version-panel">
              <div class="version-head">
                <div class="display version-num">V{v.short}</div>
                <Tag color="var(--blue-bright)">{v.type}</Tag>
              </div>
              <div class="hr"></div>
              {#each v.credits as c}
                <div class="version-row">
                  <span class="mono lbl">{c.role}</span>
                  <span class="val">{c.name}</span>
                </div>
              {/each}
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .avatars {
    position: relative;
    padding: 140px 0 120px;
  }

  /* Pills */
  .pills {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .pills-label {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid var(--line);
    color: var(--silver-1);
    font-family: var(--font-tech);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pill:hover {
    border-color: var(--blue-bright);
    color: var(--blue-bright);
  }
  .pill.on {
    background: linear-gradient(135deg, var(--blue-electric), var(--blue-deep));
    border-color: var(--blue-bright);
    color: #FFFFFF;
    box-shadow: 0 4px 18px rgba(37, 99, 235, 0.25);
  }
  .pill-num {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 14px;
    letter-spacing: 0.05em;
  }

  /* Slab */
  .slab {
    position: relative;
    min-height: 620px;
    background: linear-gradient(115deg, var(--blue-electric) 0%, #1E3A8A 40%, #0F1B30 75%, #050810 100%);
    overflow: hidden;
    border: 1px solid var(--line-strong);
    padding: 40px 48px;
  }
  .slab-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, transparent 0%, transparent 36%, rgba(255, 255, 255, 0.08) 36.2%, rgba(255, 255, 255, 0.08) 38%, transparent 38.2%),
      linear-gradient(115deg, transparent 0%, transparent 64%, rgba(255, 255, 255, 0.05) 64.2%, rgba(255, 255, 255, 0.05) 70%, transparent 70.2%);
    pointer-events: none;
  }
  .trace {
    position: absolute;
    top: 30px;
    left: 30px;
    width: 300px;
    height: 200px;
    opacity: 0.5;
    pointer-events: none;
  }
  .watermark {
    position: absolute;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: -0.02em;
    white-space: nowrap;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.35);
    line-height: 0.8;
    font-weight: 900;
    pointer-events: none;
  }
  .wm-top {
    top: 60px;
    right: -20px;
    font-size: min(16vw, 230px);
    opacity: 0.45;
  }
  .wm-mid {
    top: 38%;
    right: 60px;
    font-size: min(14vw, 200px);
    opacity: 0.4;
  }
  .wm-sub {
    position: absolute;
    bottom: 60px;
    right: 60px;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.4em;
    pointer-events: none;
  }
  .v-tag {
    position: absolute;
    top: 80px;
    right: 14px;
    writing-mode: vertical-rl;
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    letter-spacing: 0.2em;
    pointer-events: none;
  }

  .corner-mark {
    position: absolute;
    left: 48px;
    top: 160px;
    z-index: 2;
  }
  .mark {
    font-size: 56px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.05em;
    line-height: 1;
  }
  .mark-type {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.22em;
    margin-top: 8px;
  }

  .scan-panel {
    position: absolute;
    left: 48px;
    top: 250px;
    width: 220px;
    z-index: 2;
  }
  .scan-label { font-size: 10px; color: rgba(255, 255, 255, 0.7); }
  .scan-value {
    font-size: 38px;
    font-weight: 900;
    color: white;
    line-height: 1;
  }
  .scan-tag {
    margin-top: 6px;
    padding: 3px 10px;
    background: white;
    color: #1E3A8A;
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.15em;
    font-weight: 600;
  }

  /* Landscape-friendly viewport */
  .viewport {
    position: absolute;
    right: 40px;
    top: 70px;
    bottom: 200px;
    width: 56%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    overflow: hidden;
  }
  .viewport::before,
  .viewport::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-color: rgba(255, 255, 255, 0.6);
    border-style: solid;
    border-width: 0;
  }
  .viewport::before {
    top: -1px;
    left: -1px;
    border-top-width: 1px;
    border-left-width: 1px;
  }
  .viewport::after {
    bottom: -1px;
    right: -1px;
    border-bottom-width: 1px;
    border-right-width: 1px;
  }
  .viewport img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    animation: rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  /* Credits panel */
  .credits {
    position: absolute;
    left: 48px;
    bottom: 70px;
    z-index: 3;
    background: rgba(5, 10, 22, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 280px;
    max-width: 360px;
  }
  .credits-hdr {
    color: rgba(124, 196, 255, 0.85);
    font-size: 10px;
    letter-spacing: 0.22em;
    margin-bottom: 4px;
  }
  .cred-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .cred-lbl {
    color: rgba(124, 196, 255, 0.85);
    font-size: 10px;
    letter-spacing: 0.18em;
    min-width: 100px;
    flex-shrink: 0;
  }
  .cred-val {
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: color 0.2s;
  }
  .cred-val:hover {
    color: #7CC4FF;
  }
  .arr {
    font-size: 11px;
    color: rgba(124, 196, 255, 0.8);
    margin-left: 4px;
  }
  .cred-note {
    color: rgba(255, 255, 255, 0.55);
    font-size: 10px;
    line-height: 1.5;
    padding-left: 110px;
    letter-spacing: 0.05em;
  }

  .bottom-bar {
    position: absolute;
    left: 48px;
    bottom: 24px;
    right: 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    z-index: 3;
  }
  .verify {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .verify .mono {
    color: white;
    font-size: 11px;
    letter-spacing: 0.15em;
  }
  .brand-tag {
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    letter-spacing: 0.2em;
  }

  /* Thumbnail strip */
  .thumbs {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .thumbs-label {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    flex-shrink: 0;
  }
  .thumbs-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .thumb {
    width: 72px;
    height: 48px;
    padding: 0;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s;
  }
  .thumb:hover { border-color: var(--blue-bright); }
  .thumb.on {
    border-color: var(--blue-bright);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Timeline */
  .timeline-block { margin-top: 56px; }
  .timeline-head { margin-bottom: 20px; }
  .caption {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .timeline-sub {
    font-size: 13px;
    color: var(--silver-2);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .timeline {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    position: relative;
  }
  .version-card {
    position: relative;
    padding: 20px 0 0;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    color: inherit;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .version-rail {
    position: absolute;
    top: 0;
    left: 22px;
    width: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }
  .rail-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--silver-4);
    transition: all 0.25s;
  }
  .rail-dot.on {
    background: var(--blue-bright);
    box-shadow: 0 0 12px var(--blue-bright);
  }
  .rail-line {
    flex: 1;
    width: 1px;
    background: linear-gradient(180deg, var(--silver-4), transparent);
    margin-top: 4px;
  }
  .version-panel {
    position: relative;
    padding: 22px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.75));
    border: 1px solid var(--line);
    backdrop-filter: blur(8px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
    transition: all 0.25s;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .version-card:hover .version-panel {
    border-color: var(--blue-bright);
    transform: translateY(-2px);
  }
  .version-card.on .version-panel {
    border-color: var(--blue-bright);
    box-shadow:
      0 0 0 1px rgba(37, 99, 235, 0.35),
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 10px 30px rgba(37, 99, 235, 0.18);
  }
  .version-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .version-num {
    font-size: 32px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 1;
  }
  .hr {
    height: 1px;
    background: var(--line);
    margin: 14px 0;
  }
  .version-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
    margin-bottom: 6px;
  }
  .version-row .lbl {
    color: var(--silver-3);
    font-size: 10px;
    letter-spacing: 0.18em;
    min-width: 100px;
    flex-shrink: 0;
  }
  .version-row .val {
    color: var(--silver-1);
    font-weight: 500;
  }

  @media (max-width: 1100px) {
    .slab { min-height: 540px; padding: 28px; }
    .viewport {
      right: 16px;
      top: 60px;
      bottom: 220px;
      width: 50%;
    }
    .credits { min-width: 0; max-width: calc(100% - 48px); right: 24px; }
    .scan-panel { top: 240px; }
    .corner-mark { top: 100px; }
    .wm-mid { display: none; }
  }
  @media (max-width: 760px) {
    .slab { min-height: 0; padding: 22px; }
    .viewport {
      position: relative;
      right: auto;
      top: auto;
      bottom: auto;
      width: 100%;
      height: 220px;
      margin: 160px 0 24px;
    }
    .corner-mark { top: 80px; }
    .scan-panel { top: 80px; left: auto; right: 22px; width: auto; text-align: right; }
    .credits { position: relative; left: auto; bottom: auto; min-width: 0; max-width: 100%; }
    .bottom-bar {
      position: relative;
      left: auto;
      bottom: auto;
      right: auto;
      margin-top: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .brand-tag { white-space: nowrap; }
    .wm-top { font-size: min(28vw, 160px); }
    .wm-sub { right: 22px; bottom: auto; top: 22px; font-size: 14px; }
  }
</style>
