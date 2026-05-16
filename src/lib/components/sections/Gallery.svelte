<script>
  import { GALLERY } from '$lib/data/gallery.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  // 6-tile bento layout，跨 3 行 12-col grid 完整 tessellate（不留洞）：
  //   row1: [tile0(5x2)] [tile1(7x1)]
  //   row2: [tile0 cont] [tile2(4x1)] [tile3(3x1)]
  //   row3: [tile4(6x1)] [tile5(6x1)]
  const sizes = [
    { col: 'span 5', row: 'span 2' },
    { col: 'span 7', row: 'span 1' },
    { col: 'span 4', row: 'span 1' },
    { col: 'span 3', row: 'span 1' },
    { col: 'span 6', row: 'span 1' },
    { col: 'span 6', row: 'span 1' }
  ];

  let hover = null;

  // 首頁只顯示最新 6 件（剛好走完一輪 bento 大小循環），全部清單去 /gallery
  const PREVIEW_LIMIT = 6;
  $: preview = GALLERY.slice(0, PREVIEW_LIMIT);
  $: lastUpdate = GALLERY[0]?.date ?? '—';
</script>

<section id="gallery" class="gallery" data-screen-label="06 Gallery">
  <div class="wrap">
    <SectionHead
      id="gallery"
      en="GALLERY"
      zh="繪圖收藏"
      deco={`ARTWORKS :: ${GALLERY.length}\nLAST UPDATE :: ${lastUpdate}\nALL CREDITS RESERVED`}
    />

    <div class="bento">
      {#each preview as g, i}
        {@const sz = sizes[i % sizes.length]}
        {@const isHover = hover === g.id}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <a
          class="tile"
          class:hover={isHover}
          style="grid-column: {sz.col}; grid-row: {sz.row};"
          href={`/gallery/${g.slug}`}
          use:reveal={{ delay: 80 + i * 70 }}
          on:mouseenter={() => (hover = g.id)}
          on:mouseleave={() => (hover = null)}
        >
          <Corners color={isHover ? 'var(--blue-bright)' : 'var(--line-strong)'} size={10} />

          <img class="tile-img" src={g.thumbnail} alt={g.title} loading="lazy" />
          <div class="bottom-fade" aria-hidden></div>

          <div class="display idx">
            {String(g.num ?? i + 1).padStart(2, '0')}
            <span class="tech idx-total">/{String(GALLERY.length).padStart(2, '0')}</span>
          </div>

          <div class="info-bar">
            <div>
              <div class="mono by">BY</div>
              <div class="tech artist">{g.artist}</div>
            </div>
            <div class="mono date">{g.date}</div>
          </div>

          <div class="overlay" class:show={isHover}>
            <span class="btn btn-primary">▸ OPEN CASE</span>
          </div>
        </a>
      {/each}
    </div>

    <div class="foot">
      <p class="mono note">▸ 感謝所有繪師的創作。所有作品著作權皆屬原作者所有。</p>
      <a class="btn btn-primary" href="/gallery">▸ VIEW FULL GALLERY</a>
    </div>
  </div>
</section>

<style>
  .gallery {
    position: relative;
    padding: 140px 0 120px;
  }
  .bento {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
    grid-auto-rows: 180px;
  }
  .tile {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    cursor: pointer;
    transition: transform 0.3s, border-color 0.3s;
    color: inherit;
    text-decoration: none;
    background: linear-gradient(135deg, rgba(15, 30, 60, 0.85), rgba(5, 15, 35, 0.95));
  }
  .tile.hover {
    transform: translateY(-4px) scale(1.015);
    border-color: var(--blue-bright);
    box-shadow: 0 14px 40px rgba(37, 99, 235, 0.22), 0 0 0 1px rgba(37, 99, 235, 0.28);
  }
  .tile-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
  }
  .bottom-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 50%;
    background: linear-gradient(180deg, transparent 0%, rgba(5, 10, 25, 0.75) 75%, rgba(5, 10, 25, 0.92) 100%);
    pointer-events: none;
  }
  .idx {
    position: absolute;
    top: 14px;
    left: 14px;
    font-size: 28px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
  .idx-total {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    margin-left: 6px;
  }
  .info-bar {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
  }
  .by {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.15em;
  }
  .artist {
    font-size: 14px;
    color: white;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-top: 2px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }
  .date {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 8, 15, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s, backdrop-filter 0.25s;
  }
  .overlay.show {
    opacity: 1;
    backdrop-filter: blur(2px);
  }

  .foot {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .note {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.1em;
    margin: 0;
  }

  @media (max-width: 1100px) {
    .bento { grid-template-columns: repeat(6, 1fr); grid-auto-rows: 160px; }
    .tile { grid-column: span 3 !important; grid-row: span 1 !important; }
  }
  @media (max-width: 600px) {
    .bento { grid-template-columns: 1fr; }
    .tile { grid-column: span 1 !important; }
  }
</style>
