<script>
  import { GALLERY } from '$lib/data/gallery.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Tag from '$lib/components/atoms/Tag.svelte';

  const sizes = [
    { col: 'span 5', row: 'span 2' },
    { col: 'span 4', row: 'span 1' },
    { col: 'span 3', row: 'span 1' },
    { col: 'span 3', row: 'span 1' },
    { col: 'span 4', row: 'span 1' },
    { col: 'span 5', row: 'span 2' }
  ];

  let hover = null;
</script>

<section id="gallery" class="gallery" data-screen-label="06 Gallery">
  <div class="wrap">
    <SectionHead
      num="05 / 06"
      en="GALLERY"
      zh="繪圖收藏"
      deco={`ARTWORKS :: ${GALLERY.length}+\nLAST UPDATE :: 2024.12.07\nALL CREDITS RESERVED`}
    />

    <div class="bento">
      {#each GALLERY as g, i}
        {@const sz = sizes[i % sizes.length]}
        {@const isHover = hover === g.id}
        <div
          class="tile"
          class:hover={isHover}
          style="
            grid-column: {sz.col};
            grid-row: {sz.row};
            border-color: {isHover ? g.accent : 'var(--line)'};
            background:
              linear-gradient(135deg, hsl({g.hue} 60% 25%) 0%, hsl({g.hue} 70% 12%) 100%),
              radial-gradient(circle at 30% 30%, hsl({g.hue} 80% 40%), transparent 60%);
          "
          on:mouseenter={() => (hover = g.id)}
          on:mouseleave={() => (hover = null)}
          role="button"
          tabindex="0"
        >
          <Corners color={isHover ? g.accent : 'var(--line-strong)'} size={10} />

          <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" class="pattern">
            <defs>
              <radialGradient id={`g-${g.id}`} cx="0.5" cy="0.4">
                <stop offset="0%" stop-color={g.accent} stop-opacity="0.6" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>
            <rect width="300" height="200" fill={`url(#g-${g.id})`} />
            <path
              d={`M150 ${30 + i * 5} L170 ${60 + i * 4} L165 110 L175 160 L150 175 L125 160 L135 110 L130 ${60 + i * 4}Z`}
              fill="rgba(255,255,255,.15)"
              stroke="rgba(255,255,255,.4)"
              stroke-width="1"
            />
            <circle cx="150" cy={50 + i * 4} r="14" fill="rgba(255,255,255,.2)" />
          </svg>

          <div class="display idx">
            {String(i + 1).padStart(2, '0')}
            <span class="tech idx-total">/{String(GALLERY.length).padStart(2, '0')}</span>
          </div>

          <div class="tag-slot">
            <Tag color={g.accent} solid>{g.tag}</Tag>
          </div>

          <div class="info-bar">
            <div>
              <div class="mono by">BY</div>
              <div class="tech artist">{g.artist}</div>
            </div>
            <div class="mono date">{g.date}</div>
          </div>

          <div class="overlay" class:show={isHover}>
            <button class="btn btn-primary">▸ VIEW FULL</button>
          </div>
        </div>
      {/each}
    </div>

    <div class="foot">
      <p class="mono note">▸ 感謝所有繪師的創作。所有作品著作權皆屬原作者所有。</p>
      <button class="btn">▸ SUBMIT YOUR ART</button>
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
  }
  .tile.hover { transform: scale(1.01); }
  .pattern {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }
  .idx {
    position: absolute;
    top: 14px;
    left: 14px;
    font-size: 32px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    mix-blend-mode: plus-lighter;
  }
  .idx-total {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-left: 6px;
  }
  .tag-slot {
    position: absolute;
    top: 14px;
    right: 14px;
  }
  .info-bar {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .by {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.15em;
  }
  .artist {
    font-size: 16px;
    color: white;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }
  .date {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 8, 15, 0.7);
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
