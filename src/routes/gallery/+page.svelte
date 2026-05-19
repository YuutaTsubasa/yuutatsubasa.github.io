<script>
  import { GALLERY, GALLERY_CATEGORIES, findGalleryCategory } from '$lib/data/gallery.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { galleryPageYear, galleryPageCategory } from '$lib/stores/filters.js';
  import { reveal } from '$lib/utils/reveal.js';

  // 每個分類的件數，提供 chip 標註
  $: categoryCounts = (() => {
    const m = Object.fromEntries(GALLERY_CATEGORIES.map((c) => [c.id, 0]));
    for (const g of GALLERY) {
      if (m[g.category] != null) m[g.category] += 1;
    }
    return m;
  })();

  // 從資料動態生出年份 chip（依目前分類過濾）
  $: years = (() => {
    const pool = $galleryPageCategory === 'all'
      ? GALLERY
      : GALLERY.filter((g) => g.category === $galleryPageCategory);
    const map = new Map();
    for (const g of pool) {
      const y = g.date.slice(0, 4);
      if (!y) continue;
      map.set(y, (map.get(y) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  })();

  $: list = (() => {
    let out = $galleryPageCategory === 'all'
      ? GALLERY
      : GALLERY.filter((g) => g.category === $galleryPageCategory);
    if ($galleryPageYear !== 'all') {
      out = out.filter((g) => g.date.startsWith($galleryPageYear));
    }
    return out;
  })();
</script>

<Seo
  title="GALLERY · 悠太翼 YUUTA TSUBASA"
  description="粉絲為悠太翼繪製的同人作品收藏 — 翼友作品集。"
/>

<section id="main" class="gallery-list">
  <div class="wrap">
    <SectionHead
      id="gallery"
      suffix="VISUAL CODEX"
      en="GALLERY"
      zh="作品・画廊コーデックス"
      level={1}
      deco={`ENTRIES :: ${String(GALLERY.length).padStart(3, '0')} PIECES\nSORT :: NEWEST\nFILTER :: ${$galleryPageCategory === 'all' ? 'ALL' : findGalleryCategory($galleryPageCategory)?.enLabel ?? $galleryPageCategory} · ${$galleryPageYear === 'all' ? 'ALL YEARS' : $galleryPageYear}`}
    />

    <div class="filter-row">
      <span class="mono filter-label">CATEGORY ▸</span>
      <button
        class="chip tech"
        class:on={$galleryPageCategory === 'all'}
        on:click={() => { galleryPageCategory.set('all'); galleryPageYear.set('all'); }}
      >ALL · {String(GALLERY.length).padStart(2, '0')}</button>
      {#each GALLERY_CATEGORIES as c}
        <button
          class="chip tech"
          class:on={$galleryPageCategory === c.id}
          style:--cat={c.color}
          on:click={() => { galleryPageCategory.set(c.id); galleryPageYear.set('all'); }}
        >{c.label} · {String(categoryCounts[c.id]).padStart(2, '0')}</button>
      {/each}
    </div>

    <div class="filter-row">
      <span class="mono filter-label">YEAR ▸</span>
      <button
        class="chip tech"
        class:on={$galleryPageYear === 'all'}
        on:click={() => galleryPageYear.set('all')}
      >ALL</button>
      {#each years as [y, count]}
        <button
          class="chip tech"
          class:on={$galleryPageYear === y}
          on:click={() => galleryPageYear.set(y)}
        >{y} · {String(count).padStart(2, '0')}</button>
      {/each}
      <span class="spacer"></span>
      <span class="mono showing">{list.length} PIECES INDEXED</span>
    </div>

    {#if list.length === 0}
      <div class="empty mono">// NO PIECES IN THIS YEAR</div>
    {:else}
      <div class="masonry">
        {#each list as g, i (g.id)}
          {@const c = findGalleryCategory(g.category)}
          <a class="tile" href={`/gallery/${g.slug}`} use:reveal={{ delay: Math.min(i * 30, 600), distance: 18 }}>
            <Corners color="var(--line-strong)" size={10} />
            <img class="tile-img" src={g.thumbnail} alt={g.title} loading="lazy" />
            <div class="bottom-fade" aria-hidden></div>
            <span class="mono tile-id">#{String(g.num ?? i + 1).padStart(3, '0')}</span>
            {#if c}
              <span class="tech tile-tag" style:--tag={c.color}>{c.label}</span>
            {/if}
            <div class="tile-foot">
              <div class="tile-foot-left">
                <div class="mono by">BY</div>
                <div class="tech artist">{g.artist}</div>
              </div>
              <span class="mono tile-date">{g.date}</span>
            </div>
          </a>
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
  .chip[style*='--cat'].on {
    background: color-mix(in srgb, var(--cat) 12%, transparent);
    border-color: var(--cat);
    color: var(--cat);
  }
  .filter-row + .filter-row { margin-top: -12px; }
  .spacer { flex: 1; }
  .showing {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
  }

  .masonry {
    column-count: 3;
    column-gap: 16px;
  }
  @media (max-width: 900px) { .masonry { column-count: 2; } }
  @media (max-width: 600px) { .masonry { column-count: 1; } }
  .tile {
    position: relative;
    display: block;
    overflow: hidden;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, rgba(15, 30, 60, 0.85), rgba(5, 15, 35, 0.95));
    color: inherit;
    text-decoration: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 16px;
    break-inside: avoid;
    contain: layout paint;
    isolation: isolate;
  }
  .tile:hover {
    border-color: var(--blue-bright);
    box-shadow: 0 10px 32px rgba(37, 99, 235, 0.28), 0 0 0 1px rgba(37, 99, 235, 0.32);
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
  .tile-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: var(--tag, #FFF);
    background: color-mix(in srgb, var(--tag, #FFF) 22%, rgba(5, 10, 25, 0.72));
    border: 1px solid color-mix(in srgb, var(--tag, #FFF) 55%, transparent);
    border-radius: 2px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  }
  .tile-date {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.72);
    letter-spacing: 0.15em;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
    flex-shrink: 0;
    align-self: flex-end;
  }
  .tile-foot {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
  }
  .tile-foot-left { min-width: 0; }
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
