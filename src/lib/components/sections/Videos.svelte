<script>
  import { onMount } from 'svelte';
  import { VIDEOS, VIDEO_TAGS, VIDEO_FILTERS } from '$lib/data/videos.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Tag from '$lib/components/atoms/Tag.svelte';
  import { archiveHomeFilter } from '$lib/stores/filters.js';
  import { reveal } from '$lib/utils/reveal.js';

  $: list = $archiveHomeFilter === 'all' ? VIDEOS : VIDEOS.filter((v) => v.tags?.includes($archiveHomeFilter));

  function tagsOf(ids) {
    return (ids ?? []).map((id) => VIDEO_TAGS.find((t) => t.id === id)).filter(Boolean);
  }

  // 標籤過長時用左右箭頭代替 scrollbar
  let tabsEl;
  let canLeft = false;
  let canRight = false;
  function updateScroll() {
    if (!tabsEl) return;
    canLeft = tabsEl.scrollLeft > 1;
    canRight = tabsEl.scrollLeft < tabsEl.scrollWidth - tabsEl.clientWidth - 1;
  }
  function scrollTabs(dir) {
    if (!tabsEl) return;
    tabsEl.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }
  onMount(() => {
    updateScroll();
    const ro = new ResizeObserver(updateScroll);
    if (tabsEl) ro.observe(tabsEl);
    return () => ro.disconnect();
  });
</script>

<section id="videos" class="videos" data-screen-label="04 Videos">
  <div class="wrap">
    <SectionHead
      id="videos"
      en="ARCHIVE"
      zh="影片庫"
      deco={`COUNT :: ${VIDEOS.length} ENTRIES\nFILTER :: ${VIDEO_FILTERS.find((f) => f.id === $archiveHomeFilter)?.enLabel ?? 'ALL'}\nUPDATED :: ${VIDEOS[0]?.date ?? '—'}`}
    />

    <div class="tabs-wrap">
      <button
        class="tabs-arrow tabs-arrow-left"
        class:on={canLeft}
        type="button"
        aria-label="scroll left"
        tabindex={canLeft ? 0 : -1}
        on:click={() => scrollTabs(-1)}
      >
        <svg viewBox="0 0 10 16" aria-hidden>
          <path d="M7 3 L3 8 L7 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div
        class="tabs"
        class:fade-left={canLeft}
        class:fade-right={canRight}
        bind:this={tabsEl}
        on:scroll={updateScroll}
      >
        {#each VIDEO_FILTERS as f}
          <button
            class="tab tech"
            class:active={$archiveHomeFilter === f.id}
            on:click={() => archiveHomeFilter.set(f.id)}
          >
            {f.enLabel}
          </button>
        {/each}
      </div>
      <button
        class="tabs-arrow tabs-arrow-right"
        class:on={canRight}
        type="button"
        aria-label="scroll right"
        tabindex={canRight ? 0 : -1}
        on:click={() => scrollTabs(1)}
      >
        <svg viewBox="0 0 10 16" aria-hidden>
          <path d="M3 3 L7 8 L3 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="grid">
      {#each list as v, i}
        {@const tags = tagsOf(v.tags)}
        {@const primary = tags[0]?.color ?? '#3B82F6'}
        <a
          class="card"
          href={`/archive/${v.slug}`}
          use:reveal={{ delay: 80 + i * 90 }}
        >
          <Corners color="var(--line-strong)" size={10} />
          <div
            class="thumb"
            style="background:
              linear-gradient(135deg, {primary}40, rgba(8,16,32,.9)),
              radial-gradient(circle at 30% 40%, {primary}60, transparent 60%);"
          >
            {#if v.thumbnail}
              <img class="thumb-img" src={v.thumbnail} alt={v.title} loading="lazy" />
            {:else}
              <svg viewBox="0 0 400 200" class="wave">
                {#each Array.from({ length: 40 }) as _, k}
                  <rect
                    x={k * 10}
                    y={100 - Math.abs(Math.sin(k * 0.7 + i) * 60)}
                    width="3"
                    height={Math.abs(Math.sin(k * 0.7 + i) * 120)}
                    fill={primary}
                  />
                {/each}
              </svg>
            {/if}
            <div class="play-wrap">
              <div class="play">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF"><path d="M8 5v14l11-7L8 5z" /></svg>
              </div>
            </div>
            <div class="type-tag">
              {#each tags as t}
                <Tag color={t.color} solid>{t.enLabel}</Tag>
              {/each}
            </div>
            {#if v.duration}
              <div class="mono duration">{v.duration}</div>
            {/if}
            <span class="mono idx">#{String(i + 1).padStart(2, '0')}</span>
          </div>

          <div class="body">
            <div class="title">{v.title}</div>
            <div class="meta mono">
              <span>{v.date}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>

    <div class="more">
      <a class="btn btn-primary" href="/archive">▸ VIEW FULL ARCHIVE</a>
    </div>
  </div>
</section>

<style>
  .videos {
    position: relative;
    padding: 140px 0 120px;
  }
  .tabs-wrap {
    position: relative;
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
  }
  .tabs {
    flex: 1;
    display: flex;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-behavior: smooth;
    min-width: 0;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tabs.fade-right {
    -webkit-mask-image: linear-gradient(90deg, black, black calc(100% - 22px), transparent);
    mask-image: linear-gradient(90deg, black, black calc(100% - 22px), transparent);
  }
  .tabs.fade-left {
    -webkit-mask-image: linear-gradient(90deg, transparent, black 22px, black);
    mask-image: linear-gradient(90deg, transparent, black 22px, black);
  }
  .tabs.fade-left.fade-right {
    -webkit-mask-image: linear-gradient(90deg, transparent, black 22px, black calc(100% - 22px), transparent);
    mask-image: linear-gradient(90deg, transparent, black 22px, black calc(100% - 22px), transparent);
  }
  .tabs-arrow {
    flex-shrink: 0;
    width: 24px;
    height: 38px;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid var(--line);
    color: var(--blue-bright);
    cursor: pointer;
    padding: 0;
    z-index: 4;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    align-self: center;
  }
  .tabs-arrow svg {
    width: 10px;
    height: 16px;
    display: block;
  }
  .tabs-arrow.on { display: inline-flex; }
  .tabs-arrow:hover {
    background: var(--blue-bright);
    color: #FFFFFF;
    border-color: var(--blue-bright);
  }
  .tabs-arrow-left { margin-right: -1px; }
  .tabs-arrow-right { margin-left: -1px; }
  .tabs-arrow.on { animation: tabs-arrow-bob 1.6s ease-in-out infinite; }
  .tabs-arrow-left.on { animation-name: tabs-arrow-bob-left; }
  @keyframes tabs-arrow-bob-left {
    0%, 100% { transform: translateX(0); }
    50%      { transform: translateX(-3px); }
  }
  @keyframes tabs-arrow-bob {
    0%, 100% { transform: translateX(0); }
    50%      { transform: translateX(3px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .tabs-arrow.on { animation: none; }
  }
  .tab {
    padding: 12px 20px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--silver-2);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .tab:hover { color: var(--blue-bright); }
  .tab.active {
    color: var(--blue-bright);
    border-bottom-color: var(--blue-bright);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .card {
    position: relative;
    background: linear-gradient(180deg, #FFFFFF, #F4F6FB);
    border: 1px solid var(--line);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.25s, border-color 0.2s, box-shadow 0.25s;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .card:hover {
    transform: translateY(-6px) scale(1.005);
    border-color: var(--blue-bright);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 44px rgba(37, 99, 235, 0.22), 0 0 0 1px rgba(37, 99, 235, 0.28);
  }
  .thumb {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }
  .wave {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.35;
  }
  .thumb-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .play-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .play {
    width: 54px;
    height: 54px;
    border: 1.5px solid #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
  .type-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-width: calc(100% - 80px);
  }
  .duration {
    position: absolute;
    bottom: 10px;
    right: 10px;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #FFFFFF;
    font-size: 11px;
  }
  .idx {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.7);
  }
  .body { padding: 16px 18px 18px; }
  .title {
    font-size: 14px;
    color: var(--silver-0);
    line-height: 1.5;
    font-weight: 500;
    min-height: 42px;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.1em;
  }
  .more {
    margin-top: 32px;
    text-align: center;
  }

  @media (max-width: 1100px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 700px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
