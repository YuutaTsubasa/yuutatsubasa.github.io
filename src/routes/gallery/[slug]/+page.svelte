<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { GALLERY, findGallery } from '$lib/data/gallery.js';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Seo from '$lib/components/Seo.svelte';

  $: piece = findGallery($page.params.slug);
  $: idx = piece ? GALLERY.indexOf(piece) : -1;
  // GALLERY 是新到舊：陣列下一個是更舊的 = PREV，上一個是更新的 = NEXT
  $: prev = idx >= 0 ? GALLERY[idx + 1] : null;
  $: next = idx > 0 ? GALLERY[idx - 1] : null;

  function padCase(num, total) {
    const n = Number.isFinite(num) ? num : 0;
    return `${String(n).padStart(3, '0')} / ${String(total).padStart(3, '0')}`;
  }

  function handleKey(e) {
    if (e.key === 'Escape') goto('/gallery');
    else if (e.key === 'ArrowLeft' && prev) goto(`/gallery/${prev.slug}`);
    else if (e.key === 'ArrowRight' && next) goto(`/gallery/${next.slug}`);
  }

  onMount(() => {
    if (typeof window !== 'undefined') window.addEventListener('keydown', handleKey);
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKey);
  });
</script>

{#if piece}
  <Seo
    title={`${piece.title} · GALLERY · 悠太翼 YUUTA TSUBASA`}
    description={piece.author ? `翼友作品 · 繪師：${piece.author}` : '悠太翼翼友作品'}
    image={piece.thumbnail || '/images/og-card.png'}
    imageAlt={piece.title}
    type="article"
  />
{:else}
  <Seo title="GALLERY · 悠太翼 YUUTA TSUBASA" />
{/if}

<div class="lightbox">
  {#if !piece}
    <div class="topbar">
      <span class="mono bc">GALLERY ▸ #??? / {String(GALLERY.length).padStart(3, '0')}</span>
      <span class="spacer"></span>
      <a class="mono close" href="/gallery">ESC · CLOSE</a>
    </div>
    <div class="not-found">
      <Corners />
      <div class="mono nf-cap">// PIECE NOT FOUND</div>
      <div class="display nf-title">NO MATCHING RECORD</div>
      <a class="mono nf-back" href="/gallery">◀ BACK TO GALLERY</a>
    </div>
  {:else}
    <!-- mini topbar -->
    <div class="topbar">
      <a class="mono bc" href="/gallery">GALLERY ▸ #{padCase(piece.num, GALLERY.length)}</a>
      <span class="spacer"></span>
      <a class="mono close" href="/gallery">ESC · CLOSE</a>
    </div>

    <div class="grid">
      <!-- left prev rail -->
      <a class="rail prev" class:disabled={!prev} href={prev ? `/gallery/${prev.slug}` : '#'}>
        <div class="rail-inner">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4 L6 10 L12 16"/></svg>
          {#if prev}
            <div class="mono rail-label">#{String(prev.num ?? 0).padStart(3, '0')} BY {prev.artist}</div>
          {/if}
        </div>
      </a>

      <!-- center hero image -->
      <div class="hero">
        <div class="hero-inner">
          <Corners />
          <img class="hero-img" src={piece.thumbnail} alt={piece.title} />
          <span class="mono hero-tag">#{String(piece.num ?? 0).padStart(3, '0')} ／ FULL SCAN</span>
        </div>
      </div>

      <!-- right meta sidebar -->
      <aside class="meta">
        <div class="meta-head">
          <div class="mono meta-id">PIECE #{String(piece.num ?? 0).padStart(3, '0')}</div>
          <div class="display meta-title">BY {piece.artist}</div>
          <div class="tech meta-sub">FAN ART · 翼友作品</div>
        </div>

        <div class="meta-rule"></div>

        <div class="meta-rows">
          <span class="mono mr-label">DATE</span>
          <span class="mr-val">{piece.date}</span>
          <span class="mono mr-label">ARTIST</span>
          <span class="mr-val">{piece.artist}</span>
          <span class="mono mr-label">MEDIUM</span>
          <span class="mr-val">FAN ART</span>
          <span class="mono mr-label">FILE</span>
          <span class="mr-val mono small">{piece.id}</span>
        </div>

        {#if piece.excerpt}
          <div class="meta-rule"></div>
          <div>
            <div class="mono mn-cap">// NOTE</div>
            <p class="mn-text">{piece.excerpt}</p>
          </div>
        {/if}

        {#if piece.bodyHtml}
          <div class="meta-rule"></div>
          <div class="body">
            {@html piece.bodyHtml}
          </div>
        {/if}

        <span class="spacer"></span>

        <div class="meta-actions">
          {#if piece.sourceUrl}
            <a class="action primary" href={piece.sourceUrl} target="_blank" rel="noopener">↗ VIEW SOURCE</a>
          {/if}
          <a class="action" href={piece.thumbnail} target="_blank" rel="noopener">↗ FULL IMAGE</a>
        </div>

        <div class="meta-foot">
          <span class="mono">◀ →  KEYBOARD NAVIGATION  ← ▶</span>
        </div>
      </aside>
    </div>
  {/if}
</div>

<style>
  .lightbox {
    position: fixed;
    inset: 0;
    background: #08101F;
    color: #D8E0EE;
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  /* topbar */
  .topbar {
    flex: 0 0 auto;
    height: 54px;
    display: flex;
    align-items: center;
    padding: 0 32px;
    border-bottom: 1px solid rgba(120, 180, 255, 0.15);
    gap: 14px;
  }
  .bc {
    font-size: 10px;
    color: #7CC4FF;
    letter-spacing: 0.2em;
    text-decoration: none;
    transition: color 0.15s;
  }
  .bc:hover { color: #BFD9FF; }
  .spacer { flex: 1; }
  .close {
    font-size: 10px;
    color: rgba(216, 224, 238, 0.7);
    letter-spacing: 0.18em;
    text-decoration: none;
    transition: color 0.15s;
  }
  .close:hover { color: #7CC4FF; }

  /* grid */
  .grid {
    flex: 1;
    display: grid;
    grid-template-columns: 60px 1fr 340px;
    min-height: 0;
  }

  /* prev rail */
  .rail {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid rgba(120, 180, 255, 0.1);
    color: #7CC4FF;
    text-decoration: none;
    transition: background 0.18s, color 0.18s;
  }
  .rail:hover { background: rgba(124, 196, 255, 0.06); }
  .rail.disabled { pointer-events: none; opacity: 0.25; }
  .rail-inner { text-align: center; }
  .rail-label {
    font-size: 9px;
    margin-top: 8px;
    letter-spacing: 0.2em;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    max-height: 240px;
    overflow: hidden;
  }

  /* hero */
  .hero {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    min-height: 0;
  }
  .hero-inner {
    position: relative;
    max-width: 100%;
    max-height: 100%;
    background:
      radial-gradient(circle at 30% 30%, rgba(124, 196, 255, 0.18), transparent 60%),
      linear-gradient(135deg, #1a3a6e 0%, #0d2451 60%, #07142e 100%);
    border: 1px solid rgba(120, 180, 255, 0.3);
    overflow: hidden;
  }
  .hero-img {
    display: block;
    max-width: 100%;
    max-height: calc(100vh - 180px);
    width: auto;
    height: auto;
    object-fit: contain;
  }
  .hero-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 10px;
    color: #7CC4FF;
    letter-spacing: 0.2em;
    padding: 3px 8px;
    background: rgba(8, 16, 31, 0.7);
    border: 1px solid rgba(124, 196, 255, 0.4);
  }

  /* meta sidebar */
  .meta {
    padding: 28px 28px 24px;
    border-left: 1px solid rgba(120, 180, 255, 0.12);
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }
  .meta-head .meta-id {
    font-size: 10px;
    color: #7CC4FF;
    letter-spacing: 0.22em;
  }
  .meta-title {
    font-size: 22px;
    font-weight: 900;
    color: #F2F5FB;
    margin-top: 6px;
    line-height: 1.15;
  }
  .meta-sub {
    font-size: 11px;
    color: #A8B3C7;
    margin-top: 6px;
    letter-spacing: 0.16em;
  }
  .meta-rule {
    height: 1px;
    background: rgba(120, 180, 255, 0.16);
  }
  .meta-rows {
    display: grid;
    grid-template-columns: 72px 1fr;
    row-gap: 9px;
    font-size: 12px;
  }
  .mr-label { color: #6B7794; }
  .mr-val { color: #D8E0EE; word-break: break-all; }
  .mr-val.small { font-size: 11px; color: #A8B3C7; }
  .mn-cap {
    font-size: 10px;
    color: #6B7794;
    letter-spacing: 0.2em;
    margin-bottom: 8px;
  }
  .mn-text {
    font-size: 12px;
    line-height: 1.7;
    color: #A8B3C7;
    margin: 0;
  }
  .body {
    font-size: 12px;
    line-height: 1.75;
    color: #A8B3C7;
  }
  .body :global(p) { margin: 0 0 10px; }
  .body :global(a) {
    color: #7CC4FF;
    text-decoration: none;
    border-bottom: 1px dashed rgba(124, 196, 255, 0.5);
  }
  .body :global(a:hover) { color: #BFD9FF; }
  .body :global(img) {
    max-width: 100%;
    height: auto;
    margin-top: 8px;
    border: 1px solid rgba(120, 180, 255, 0.18);
  }

  .meta-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .action {
    padding: 6px 12px;
    font-family: var(--font-tech);
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #A8B3C7;
    background: transparent;
    border: 1px solid rgba(120, 180, 255, 0.3);
    text-decoration: none;
    transition: all 0.15s;
  }
  .action:hover {
    color: #7CC4FF;
    border-color: #7CC4FF;
  }
  .action.primary {
    background: rgba(124, 196, 255, 0.1);
    color: #7CC4FF;
    border-color: rgba(124, 196, 255, 0.5);
  }
  .meta-foot {
    margin-top: 6px;
    font-size: 9px;
    color: rgba(216, 224, 238, 0.4);
    letter-spacing: 0.18em;
    text-align: center;
  }

  /* 404 */
  .not-found {
    position: relative;
    margin: 60px auto;
    padding: 60px 32px;
    max-width: 560px;
    border: 1px solid rgba(120, 180, 255, 0.18);
    background: rgba(8, 16, 31, 0.5);
    text-align: center;
  }
  .nf-cap {
    font-size: 11px;
    color: #FCA5A5;
    letter-spacing: 0.25em;
  }
  .nf-title {
    margin-top: 14px;
    font-size: 22px;
    color: #F2F5FB;
    font-weight: 900;
  }
  .nf-back {
    display: inline-block;
    margin-top: 18px;
    color: #7CC4FF;
    text-decoration: none;
    font-size: 11px;
    letter-spacing: 0.18em;
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
    .rail { display: none; }
    .meta { border-left: 0; border-top: 1px solid rgba(120, 180, 255, 0.12); }
    .hero-img { max-height: 70vh; }
  }
</style>
