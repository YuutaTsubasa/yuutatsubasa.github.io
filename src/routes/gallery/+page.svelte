<script>
  import { onMount, onDestroy } from 'svelte';
  import { GALLERY } from '$lib/data/gallery.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  let yearFilter = 'all';
  let cols = 3;

  function updateCols() {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 600px)').matches) cols = 1;
    else if (window.matchMedia('(max-width: 900px)').matches) cols = 2;
    else cols = 3;
  }

  onMount(() => {
    updateCols();
    window.addEventListener('resize', updateCols);
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', updateCols);
  });

  // 從資料動態生出年份 chip
  $: years = (() => {
    const map = new Map();
    for (const g of GALLERY) {
      const y = g.date.slice(0, 4);
      if (!y) continue;
      map.set(y, (map.get(y) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  })();

  $: list = yearFilter === 'all'
    ? GALLERY
    : GALLERY.filter((g) => g.date.startsWith(yearFilter));

  // 手動把 list round-robin 分到 N 欄。避免 CSS column-count 在動態 hover/reveal 時重排
  $: distributed = (() => {
    const out = Array.from({ length: cols }, () => []);
    list.forEach((g, i) => out[i % cols].push(g));
    return out;
  })();
</script>

<Seo
  title="GALLERY · 悠太翼 YUUTA TSUBASA"
  description="粉絲為悠太翼繪製的同人作品收藏 — 翼友作品集。"
/>

<section class="gallery-list">
  <div class="wrap">
    <SectionHead
      num="05 / 06 — VISUAL CODEX"
      en="GALLERY"
      zh="作品・画廊コーデックス"
      deco={`ENTRIES :: ${String(GALLERY.length).padStart(3, '0')} PIECES\nSORT :: NEWEST\nFILTER :: ${yearFilter === 'all' ? 'ALL YEARS' : yearFilter}`}
    />

    <div class="filter-row">
      <span class="mono filter-label">VIEW ▸</span>
      <span class="chip on tech">WALL</span>
      <span class="sep"></span>
      <button
        class="chip tech"
        class:on={yearFilter === 'all'}
        on:click={() => (yearFilter = 'all')}
      >ALL · {String(GALLERY.length).padStart(2, '0')}</button>
      {#each years as [y, count]}
        <button
          class="chip tech"
          class:on={yearFilter === y}
          on:click={() => (yearFilter = y)}
        >{y} · {String(count).padStart(2, '0')}</button>
      {/each}
      <span class="spacer"></span>
      <span class="mono showing">{list.length} PIECES INDEXED</span>
    </div>

    {#if list.length === 0}
      <div class="empty mono">// NO PIECES IN THIS YEAR</div>
    {:else}
      <div class="masonry" style="--cols: {cols};">
        {#each distributed as col, ci}
          <div class="col">
            {#each col as g, i (g.id)}
              <a class="tile" href={`/gallery/${g.slug}`} use:reveal={{ delay: Math.min((i * cols + ci) * 50, 600), distance: 18 }}>
                <Corners color="var(--line-strong)" size={10} />
                <img class="tile-img" src={g.thumbnail} alt={g.title} loading="lazy" />
                <div class="bottom-fade" aria-hidden></div>
                <span class="mono tile-id">#{String(g.num ?? i + 1).padStart(3, '0')}</span>
                <span class="mono tile-date">{g.date}</span>
                <div class="tile-foot">
                  <div class="mono by">BY</div>
                  <div class="tech artist">{g.artist}</div>
                </div>
              </a>
            {/each}
          </div>
        {/each}
      </div>
    {/if}

    <div class="bottom">
      <a class="mono back" href="/#gallery">◀ BACK TO HOME</a>
      <span class="mono note">{GALLERY.length} pieces · ALL CREDITS RESERVED</span>
    </div>
  </div>
</section>

<style>
  .gallery-list {
    position: relative;
    padding: 140px 0 120px;
    min-height: 100vh;
  }
  .wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 18px 0 16px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 24px;
  }
  .filter-label {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    margin-right: 4px;
  }
  .sep {
    width: 1px;
    height: 18px;
    background: var(--line);
    margin: 0 6px;
  }
  .chip {
    padding: 5px 12px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid var(--line);
    color: var(--silver-2);
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-tech);
    font-weight: 600;
  }
  .chip:hover {
    color: var(--blue-bright);
    border-color: var(--line-strong);
  }
  .chip.on {
    background: rgba(37, 99, 235, 0.1);
    border-color: var(--blue-bright);
    color: var(--blue-bright);
  }
  .spacer { flex: 1; }
  .showing {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
  }

  .masonry {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    gap: 16px;
    align-items: start;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .tile {
    position: relative;
    display: block;
    overflow: hidden;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, rgba(15, 30, 60, 0.85), rgba(5, 15, 35, 0.95));
    color: inherit;
    text-decoration: none;
    transition: transform 0.25s, border-color 0.2s, box-shadow 0.2s;
  }
  .tile:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: var(--blue-bright);
    box-shadow: 0 14px 40px rgba(37, 99, 235, 0.22), 0 0 0 1px rgba(37, 99, 235, 0.28);
  }
  .tile-img {
    display: block;
    width: 100%;
    height: auto;
  }
  .bottom-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 48%;
    background: linear-gradient(180deg, transparent 0%, rgba(5, 10, 25, 0.78) 70%, rgba(5, 10, 25, 0.95) 100%);
    pointer-events: none;
  }
  .tile-id {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: 0.18em;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  }
  .tile-date {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.72);
    letter-spacing: 0.15em;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  }
  .tile-foot {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 12px;
  }
  .by {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.18em;
  }
  .artist {
    font-size: 14px;
    color: white;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-top: 2px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }

  .empty {
    padding: 60px 0;
    text-align: center;
    color: var(--silver-3);
    font-size: 12px;
    letter-spacing: 0.18em;
  }

  .bottom {
    margin-top: 36px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--silver-3);
    flex-wrap: wrap;
    gap: 12px;
  }
  .back {
    color: var(--silver-2);
    text-decoration: none;
    transition: color 0.15s;
  }
  .back:hover { color: var(--blue-bright); }

  /* cols 數量由 JS 設 CSS var --cols，response 直接吃變數 */
</style>
