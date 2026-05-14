<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import { NAV } from '$lib/data/nav.js';
  import { activeSection, gotoSection } from '$lib/stores/active.js';
  import Dot from '$lib/components/atoms/Dot.svelte';

  let timeStr = '';
  let interval;
  let linksEl;
  let indicator = { left: 0, width: 0, visible: false };

  function updateTime() {
    const t = new Date();
    timeStr = t.toTimeString().slice(0, 8);
  }

  // 路由 prefix → 對應 nav id（讓 /archive 與 /archive/[id] 都高亮 ARCHIVE）
  const PATH_PREFIX_TO_SECTION = [
    ['/archive', 'videos'],
    ['/gallery', 'gallery']
  ];

  function matchSection(path) {
    for (const [prefix, id] of PATH_PREFIX_TO_SECTION) {
      if (path === prefix || path.startsWith(prefix + '/')) return id;
    }
    return null;
  }

  $: isHome = $page.url.pathname === '/';
  $: pathSection = matchSection($page.url.pathname);
  $: activeNow = pathSection ?? $activeSection;

  // 反應式：activeNow 變動就更新 indicator 位置
  $: if (typeof window !== 'undefined' && linksEl && activeNow) {
    moveIndicator(activeNow);
  }

  async function moveIndicator(id) {
    await tick();
    if (!linksEl) return;
    const el = linksEl.querySelector(`[data-section="${id}"]`);
    if (!el) {
      indicator = { ...indicator, visible: false };
      return;
    }
    const childRect = el.getBoundingClientRect();
    const parentRect = linksEl.getBoundingClientRect();
    indicator = {
      left: childRect.left - parentRect.left + linksEl.scrollLeft,
      width: childRect.width,
      visible: true
    };
  }

  let resizeHandler;

  onMount(() => {
    updateTime();
    interval = setInterval(updateTime, 1000);

    resizeHandler = () => moveIndicator(activeNow);
    window.addEventListener('resize', resizeHandler);
    // 初始：等字型載入完再對齊（字寬可能改變）
    requestAnimationFrame(() => moveIndicator(activeNow));
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => moveIndicator(activeNow));
    }
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  });

  function handleClick(e, id) {
    if (isHome) {
      e.preventDefault();
      gotoSection(id);
    }
  }
</script>

<header class="nav">
  <a
    class="brand"
    href={isHome ? '#hero' : '/'}
    on:click={(e) => handleClick(e, 'hero')}
  >
    <img src="/images/logo-knight.png" alt="悠太翼 / YUUTA TSUBASA" />
    <div class="brand-tag">
      <div class="mono tag">VTUBER // V5.0</div>
    </div>
  </a>

  <nav class="links" bind:this={linksEl}>
    <span
      class="indicator"
      style:left={`${indicator.left}px`}
      style:width={`${indicator.width}px`}
      style:opacity={indicator.visible ? 1 : 0}
      aria-hidden
    ></span>
    {#each NAV as n}
      <a
        class="nav-btn tech"
        class:active={activeNow === n.id}
        data-section={n.id}
        href={isHome ? `#${n.id}` : `/#${n.id}`}
        on:click={(e) => handleClick(e, n.id)}
      >
        <span class="mono num">{n.num}</span>
        {n.label}
      </a>
    {/each}
  </nav>

  <div class="status">
    <span class="mono time">{timeStr}</span>
    <Dot color="#22D3EE" />
  </div>
</header>

<style>
  .nav {
    position: fixed;
    top: 28px;
    left: 0;
    right: 0;
    height: 60px;
    z-index: 50;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 254, 0.78));
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    padding: 0 32px;
    gap: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    flex-shrink: 0;
  }
  .brand img {
    height: 34px;
    width: auto;
    display: block;
  }
  .brand-tag {
    padding-left: 12px;
    border-left: 1px solid var(--line);
  }
  .tag {
    font-size: 9px;
    color: var(--blue-bright);
    letter-spacing: 0.25em;
  }
  .links {
    position: relative;
    display: flex;
    gap: 2px;
    margin-left: auto;
    align-items: stretch;
    height: 34px;
    overflow: hidden;
  }
  .indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    border: 1px solid var(--line-strong);
    background: rgba(59, 130, 246, 0.12);
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.16) inset;
    transition: left 0.32s cubic-bezier(0.2, 0.7, 0.2, 1),
      width 0.32s cubic-bezier(0.2, 0.7, 0.2, 1),
      opacity 0.2s;
    pointer-events: none;
    z-index: 0;
  }
  .nav-btn {
    position: relative;
    z-index: 1;
    padding: 6px 14px;
    color: var(--silver-2);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: color 0.2s;
    flex-shrink: 0;
  }
  .nav-btn:hover {
    color: var(--blue-bright);
  }
  .nav-btn.active {
    color: var(--blue-bright);
  }
  .num {
    font-size: 9px;
    color: var(--silver-3);
    margin-right: 6px;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-left: 14px;
    border-left: 1px solid var(--line);
    flex-shrink: 0;
  }
  .time {
    font-size: 11px;
    color: var(--silver-2);
  }

  /* RWD */
  @media (max-width: 1100px) {
    .nav { padding: 0 16px; gap: 12px; }
    .links {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      min-width: 0;
    }
    .links::-webkit-scrollbar { display: none; }
    .nav-btn { padding: 6px 10px; font-size: 11px; letter-spacing: 0.14em; }
    .num { margin-right: 4px; }
  }
  @media (max-width: 780px) {
    .brand-tag { display: none; }
    .status { display: none; }
  }
  @media (max-width: 520px) {
    .nav { padding: 0 10px; gap: 8px; }
    .nav-btn .num { display: none; }
    .nav-btn { padding: 6px 8px; font-size: 10px; }
  }
</style>
