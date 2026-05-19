<script>
  import { page } from '$app/stores';
  import { marked } from 'marked';
  import { LOG_ENTRIES, findLog, findLogCategory } from '$lib/data/log.js';
  import { VIDEOS } from '$lib/data/videos.js';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  $: entry = findLog($page.params.slug);
  $: idx = entry ? LOG_ENTRIES.indexOf(entry) : -1;
  // LOG_ENTRIES 由新到舊：陣列下一筆是更舊 = PREV，上一筆是更新 = NEXT
  $: prev = idx >= 0 ? LOG_ENTRIES[idx + 1] : null;
  $: next = idx > 0 ? LOG_ENTRIES[idx - 1] : null;
  $: cat = entry ? findLogCategory(entry.category) : null;
  $: caseNum = entry?.caseNum ?? 0;

  // Parse markdown once + extract h2 for TOC
  $: tokens = entry?.bodyRaw ? marked.lexer(entry.bodyRaw) : [];
  $: toc = tokens
    .filter((t) => t.type === 'heading' && t.depth === 2)
    .map((t, i) => ({ text: t.text, id: `h-${i + 1}` }));
  $: bodyHtml = entry?.bodyRaw ? markedWithTocIds(entry.bodyRaw) : '';

  function markedWithTocIds(raw) {
    let html = marked.parse(raw);
    let i = 0;
    return html.replace(/<h2(\s[^>]*)?>/g, (_m, attrs) => {
      i += 1;
      return `<h2 id="h-${i}"${attrs || ''}>`;
    });
  }

  // Meta grid cells
  $: metaCells = (() => {
    if (!entry) return [];
    const m = entry.meta || {};
    const cells = [
      { label: 'TYPE', value: `${cat?.glyph ?? ''}  ${cat?.enLabel ?? ''} / ${cat?.label ?? ''}`, accent: cat?.color },
      { label: 'DATE', value: entry.date }
    ];
    if (entry.time) cells.push({ label: 'TIME', value: entry.time });
    if (m.difficulty) cells.push({ label: 'DIFFICULTY', value: m.difficulty, accent: m.difficulty === 'HARD' ? '#EF4444' : m.difficulty === 'MED' ? '#F59E0B' : '#22C55E' });
    if (m.lang) cells.push({ label: 'LANGUAGE', value: m.lang });
    if (m.runtime) cells.push({ label: 'RUNTIME', value: m.runtime });
    if (m.rating) cells.push({ label: 'RATING', value: m.rating, accent: 'var(--blue-bright)' });
    if (m.platform) cells.push({ label: 'PLATFORM', value: m.platform });
    if (m.hours) cells.push({ label: 'HOURS', value: m.hours });
    if (m.status) cells.push({ label: 'STATUS', value: m.status });
    if (m.phase) cells.push({ label: 'PHASE', value: m.phase });
    if (entry.stack?.length && entry.category === 'project') cells.push({ label: 'STACK', value: entry.stack.join(' / ') });
    return cells;
  })();

  // Related: same category, not self, up to 3
  $: related = entry
    ? LOG_ENTRIES.filter((e) => e.category === entry.category && e.id !== entry.id).slice(0, 3)
    : [];

  // Linked streams: resolve vol numbers in entry.streams to VIDEOS（保留陣列順序）
  $: linkedStreams = entry?.streams?.length
    ? entry.streams.map((vol) => VIDEOS.find((v) => v.vol === Number(vol))).filter(Boolean)
    : [];

  // Lightbox state for body images
  let lightboxSrc = '';
  let lightboxAlt = '';
  function handleBodyClick(e) {
    const t = e.target;
    if (t && t.tagName === 'IMG') {
      lightboxSrc = t.getAttribute('src') || '';
      lightboxAlt = t.getAttribute('alt') || '';
    }
  }
  function closeLightbox() { lightboxSrc = ''; }
  function handleKey(e) { if (e.key === 'Escape') closeLightbox(); }

  const SITE_URL = 'https://yuuta-tsubasa.studio';
  $: jsonLd = entry
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Log',  item: `${SITE_URL}/log` },
          { '@type': 'ListItem', position: 3, name: entry.title, item: `${SITE_URL}/log/${entry.slug}` }
        ]
      }
    : null;
</script>

{#if entry}
  <Seo
    title={`${entry.title} · LOG · 悠太翼 YUUTA TSUBASA`}
    description={entry.excerpt || `${entry.title} · ${cat?.label ?? ''}`}
    image={entry.thumbnail || '/images/og-card.png'}
    imageAlt={entry.title}
    type="article"
    {jsonLd}
  />
{:else}
  <Seo title="LOG · 悠太翼 YUUTA TSUBASA" />
{/if}

<svelte:window on:keydown={handleKey} />

<section id="main" class="detail">
  <div class="wrap">
    {#if !entry}
      <div class="not-found">
        <Corners />
        <div class="mono nf-cap">// FILE NOT FOUND</div>
        <div class="display nf-title">{$page.params.slug} ／ NO MATCHING RECORD</div>
        <a class="mono nf-back" href="/log">◀ BACK TO LOG</a>
      </div>
    {:else}
      <!-- Background decoration -->
      <div class="deco-rail" aria-hidden="true">
        <div class="deco-inner">
          <span class="display deco-watermark">{cat?.enLabel ?? 'LOG'}</span>
          <span class="display deco-num">#{String(caseNum).padStart(3, '0')}</span>
          <div class="deco-line">
            <span class="tick"></span>
            <span class="tick"></span>
            <span class="tick"></span>
          </div>
          <span class="mono deco-eof">// EOF ////</span>
        </div>
      </div>

      <!-- Breadcrumb -->
      <div class="mono crumbs" use:reveal={{ delay: 0, distance: 10 }}>
        <a href="/">▸ HOME</a>
        <span class="crumb-sep">/</span>
        <a href="/log">LOG ARCHIVE</a>
        <span class="crumb-sep">/</span>
        <span class="crumb-now">ENTRY #{String(caseNum).padStart(3, '0')}</span>
      </div>

      <!-- HEADER CARD -->
      <div class="header-card" use:reveal={{ delay: 60 }} style:--accent={cat?.color ?? 'var(--blue-bright)'}>
        <Corners size={14} />

        <div class="hc-top">
          <div class="hc-top-left">
            {#if cat}
              <span class="tech type-chip">
                <span class="chip-glyph">{cat.glyph}</span>
                {cat.enLabel} / {cat.label}
              </span>
            {/if}
            <span class="mono hc-id">ENTRY #{String(caseNum).padStart(3, '0')}</span>
          </div>
          <span class="mono hc-when">
            ▸ {entry.date}{#if entry.time} · {entry.time}{/if}
          </span>
        </div>

        <h1 class="display hc-title">{entry.title}</h1>

        {#if entry.excerpt}
          <p class="hc-summary">{entry.excerpt}</p>
        {/if}

        {#if metaCells.length}
          <div class="meta-grid">
            {#each metaCells as c}
              <div class="meta-cell">
                <div class="mono meta-label">{c.label}</div>
                <div class="tech meta-value" style:color={c.accent || 'var(--silver-0)'}>{c.value}</div>
              </div>
            {/each}
          </div>
        {/if}

        {#if entry.tags?.length}
          <div class="hc-tags">
            {#each entry.tags as t}
              <a class="mono tag-link" href="/log">#{t}</a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- TWO-COLUMN: ARTICLE + SIDEBAR -->
      <div class="grid">
        <div class="article">
          {#if entry.thumbnail}
            <div class="hero" use:reveal={{ delay: 120 }}>
              <Corners />
              <img src={entry.thumbnail} alt={entry.title} />
            </div>
          {/if}

          {#if entry.excerpt}
            <aside class="excerpt-box" use:reveal={{ delay: 160 }}>
              <span class="mono ex-cap">// EXCERPT</span>
              <p class="ex-body">{entry.excerpt}</p>
            </aside>
          {/if}

          {#if entry.bodyRaw}
            <div class="body" use:reveal={{ delay: 200, threshold: 0 }} on:click={handleBodyClick} on:keydown role="presentation">
              {@html bodyHtml}
            </div>
          {/if}

          <div class="end-marker">
            <Dot color="var(--blue-bright)" />
            <span class="mono">END OF LOG #{String(caseNum).padStart(3, '0')} ////</span>
          </div>

          <!-- PREV / NEXT -->
          {#if prev || next}
            <div class="adj-row">
              {#if prev}
                <a class="adj-card" href={`/log/${prev.slug}`}>
                  <span class="mono adj-cap">← PREV / #{String(prev.caseNum).padStart(3, '0')}</span>
                  <span class="adj-title">{prev.title}</span>
                </a>
              {:else}
                <div></div>
              {/if}
              {#if next}
                <a class="adj-card right" href={`/log/${next.slug}`}>
                  <span class="mono adj-cap">NEXT / #{String(next.caseNum).padStart(3, '0')} →</span>
                  <span class="adj-title">{next.title}</span>
                </a>
              {:else}
                <div></div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- SIDEBAR (TOP): pinned in right column on desktop, above article on mobile -->
        <aside class="side side-top">
          {#if toc.length > 0}
            <div class="panel" use:reveal={{ delay: 180 }}>
              <Corners color="var(--line-strong)" size={9} />
              <div class="mono panel-cap">// CONTENTS</div>
              <ol class="toc">
                {#each toc as h, i}
                  <li>
                    <a href={`#${h.id}`}>
                      <span class="mono toc-n">{String(i + 1).padStart(2, '0')}</span>
                      <span class="toc-text">{h.text}</span>
                    </a>
                  </li>
                {/each}
              </ol>
            </div>
          {/if}

          {#if linkedStreams.length}
            <div class="panel streams-panel" use:reveal={{ delay: 200 }}>
              <Corners color="var(--line-strong)" size={9} />
              <div class="mono panel-cap">// LINKED STREAMS</div>
              <div class="streams-list">
                {#each linkedStreams as v}
                  <a class="stream-card" href={`/archive/${v.slug}`}>
                    <span class="mono stream-id">📺 #{String(v.vol).padStart(3, '0')} · {v.date}</span>
                    <span class="stream-title">{v.title}</span>
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          {#if (entry.category === 'project' || entry.category === 'workshop') && entry.links?.length}
            <div class="panel" use:reveal={{ delay: 220 }}>
              <Corners color="var(--line-strong)" size={9} />
              <div class="mono panel-cap">// ACCESS</div>
              <div class="links">
                {#each entry.links as l, li}
                  <a
                    class="btn btn-primary"
                    class:secondary={li > 0}
                    href={l.url}
                    target="_blank"
                    rel="noopener"
                  >↗ {l.label}</a>
                {/each}
              </div>
            </div>
          {/if}
        </aside>

        <!-- SIDEBAR (BOTTOM): under top sidebar on desktop, below article on mobile -->
        <aside class="side side-bottom">
          {#if related.length > 0}
            <div class="panel" use:reveal={{ delay: 260 }} style:--accent={cat?.color ?? 'var(--blue-bright)'}>
              <Corners color="var(--line-strong)" size={9} />
              <div class="mono panel-cap">// RELATED · {cat?.enLabel ?? ''}</div>
              <div class="related">
                {#each related as r}
                  <a class="rel-card" href={`/log/${r.slug}`}>
                    <div class="mono rel-id">#{String(r.caseNum).padStart(3, '0')} · {r.date}</div>
                    <div class="rel-title">{r.title}</div>
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <a class="back-link mono" href="/log">
            <span>← ALL ENTRIES</span>
            <span class="bl-n">{LOG_ENTRIES.length}</span>
          </a>
        </aside>
      </div>
    {/if}
  </div>
</section>

{#if lightboxSrc}
  <div class="lightbox" role="dialog" aria-modal="true" aria-label="圖片放大檢視">
    <button type="button" class="lb-backdrop" on:click={closeLightbox} aria-label="關閉放大檢視"></button>
    <img class="lb-img" src={lightboxSrc} alt={lightboxAlt} />
    <button type="button" class="lb-close mono" on:click={closeLightbox} aria-label="關閉">CLOSE  ✕</button>
  </div>
{/if}

<style>
  .detail {
    position: relative;
    padding: 130px 0 100px;
    min-height: 100vh;
  }

  .not-found {
    position: relative;
    margin: 60px auto;
    padding: 60px 32px;
    max-width: 560px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.7);
    text-align: center;
  }
  .nf-cap { font-size: 11px; color: #DC2626; letter-spacing: 0.25em; }
  .nf-title { margin-top: 14px; font-size: 22px; color: var(--silver-0); font-weight: 900; }
  .nf-back {
    display: inline-block;
    margin-top: 18px;
    color: var(--blue-bright);
    text-decoration: none;
    font-size: 11px;
    letter-spacing: 0.18em;
  }

  .crumbs {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
    margin-bottom: 20px;
  }
  .crumbs a { color: var(--silver-3); text-decoration: none; }
  .crumbs a:hover { color: var(--blue-bright); }
  .crumb-sep { margin: 0 12px; color: var(--silver-4); }
  .crumb-now { color: var(--blue-bright); }

  .header-card {
    position: relative;
    padding: 32px 36px 28px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(234, 238, 246, 0.8));
    border: 1px solid var(--line);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
    margin-bottom: 32px;
  }
  .hc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .hc-top-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .type-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    color: var(--accent);
  }
  .chip-glyph { font-size: 11px; }
  .hc-id {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.1em;
  }
  .hc-when {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
  }

  .hc-title {
    font-size: 44px;
    font-weight: 900;
    line-height: 1.05;
    color: var(--silver-0);
    margin: 0 0 16px;
    letter-spacing: 0.005em;
    text-wrap: balance;
  }
  @media (max-width: 700px) {
    .hc-title { font-size: 30px; }
    .header-card { padding: 22px 22px 18px; }
  }

  .hc-summary {
    margin: 0 0 22px;
    font-size: 15px;
    line-height: 1.65;
    color: var(--silver-2);
    max-width: 780px;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    border-top: 1px solid var(--line);
  }
  .meta-cell {
    padding: 12px 14px;
    border-right: 1px solid var(--line);
  }
  .meta-cell:last-child { border-right: none; }
  .meta-label {
    font-size: 9px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
    margin-bottom: 4px;
  }
  .meta-value {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .hc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 18px;
  }
  .tag-link {
    padding: 3px 8px;
    font-size: 10px;
    color: var(--silver-2);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid var(--line);
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.15s, border-color 0.15s;
  }
  .tag-link:hover {
    color: var(--blue-bright);
    border-color: var(--blue-bright);
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 760px) 280px;
    grid-template-areas:
      "article side-top"
      "article side-bottom";
    grid-template-rows: auto 1fr;
    gap: 36px;
    justify-content: start;
    align-items: start;
    position: relative;
    z-index: 1;
  }
  .article { grid-area: article; }
  .side-top { grid-area: side-top; }
  .side-bottom { grid-area: side-bottom; }
  @media (max-width: 1000px) {
    .grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "side-top"
        "article"
        "side-bottom";
      grid-template-rows: auto auto auto;
      gap: 24px;
    }
  }

  /* main content sits above the background deco */
  .crumbs, .header-card { position: relative; z-index: 1; }

  .article {
    display: flex;
    flex-direction: column;
    gap: 28px;
    min-width: 0;
  }
  .hero {
    position: relative;
    border: 1px solid var(--line);
    overflow: hidden;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.75));
    padding: 6px;
  }
  .hero img {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--line);
  }

  .excerpt-box {
    position: relative;
    padding: 18px 22px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.75));
    border-left: 3px solid var(--blue-bright);
    border-top: 1px solid var(--line);
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .ex-cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
  }
  .ex-body {
    margin: 8px 0 0;
    font-size: 16px;
    line-height: 1.7;
    color: var(--silver-1);
    letter-spacing: 0.01em;
  }

  .body {
    font-size: 15px;
    line-height: 1.85;
    color: var(--silver-1);
    overflow-wrap: anywhere;
  }
  .body :global(h2) {
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--font-display, inherit);
    font-size: 22px;
    font-weight: 900;
    color: var(--silver-0);
    margin: 32px 0 12px;
    letter-spacing: 0.02em;
    scroll-margin-top: 100px;
  }
  .body :global(h2::before) {
    content: '';
    width: 18px;
    height: 2px;
    background: var(--blue-bright);
  }
  .body :global(h3) {
    font-size: 17px;
    font-weight: 700;
    color: var(--silver-0);
    margin: 22px 0 8px;
    letter-spacing: 0.01em;
  }
  .body :global(p) { margin: 0 0 16px; text-wrap: pretty; }
  .body :global(a) {
    color: var(--blue-bright);
    text-decoration: none;
    border-bottom: 1px dashed currentColor;
  }
  .body :global(a:hover) { color: var(--blue-deep); }
  .body :global(ul),
  .body :global(ol) {
    margin: 0 0 18px;
    padding-left: 24px;
  }
  .body :global(ul) { list-style: disc outside; }
  .body :global(ol) { list-style: decimal outside; }
  .body :global(li) { margin-bottom: 6px; }
  .body :global(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16px auto;
    border: 1px solid var(--line);
    border-radius: 6px;
    cursor: zoom-in;
    transition: filter 0.15s ease, transform 0.15s ease;
  }
  .body :global(img:hover) {
    filter: brightness(1.04);
    transform: translateY(-1px);
  }
  .body :global(code) {
    font-family: var(--font-mono);
    font-size: 0.9em;
    padding: 2px 6px;
    background: rgba(37, 99, 235, 0.08);
    border-radius: 3px;
  }
  .body :global(pre) {
    background: linear-gradient(135deg, #F4F6FB, #E5EBF6);
    color: var(--silver-0);
    padding: 14px 16px;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.65;
    margin: 0 0 18px;
    border: 1px solid var(--line);
  }
  .body :global(pre code) {
    background: transparent;
    padding: 0;
  }
  .body :global(blockquote) {
    margin: 0 0 16px;
    padding: 10px 16px;
    border-left: 3px solid var(--silver-3);
    background: rgba(255, 255, 255, 0.5);
    color: var(--silver-2);
  }

  .end-marker {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 16px;
    border-top: 1px dashed var(--line-strong);
    font-size: 11px;
    color: var(--silver-2);
    letter-spacing: 0.15em;
  }

  .adj-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) {
    .adj-row { grid-template-columns: 1fr; }
  }
  .adj-card {
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.7));
    border: 1px solid var(--line);
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: border-color 0.15s;
  }
  .adj-card.right { text-align: right; }
  .adj-card:hover { border-color: var(--blue-bright); }
  .adj-cap {
    font-size: 9px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
  }
  .adj-title {
    font-size: 13px;
    color: var(--silver-0);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .side-top {
    position: sticky;
    top: 110px;
  }
  @media (max-width: 1000px) {
    .side-top { position: static; }
  }
  .panel {
    position: relative;
    padding: 16px 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.75));
    border: 1px solid var(--line);
  }
  .panel-cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
    margin-bottom: 12px;
  }

  .toc {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .toc a {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 4px 6px;
    color: var(--silver-1);
    text-decoration: none;
    transition: color 0.15s, background 0.15s;
  }
  .toc a:hover {
    color: var(--blue-bright);
    background: rgba(37, 99, 235, 0.05);
  }
  .toc-n {
    font-size: 10px;
    color: var(--silver-3);
    min-width: 18px;
  }
  .toc-text { font-size: 13px; }

  .links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .links .btn-primary.secondary {
    background: transparent;
    color: var(--blue-bright);
    border-color: var(--blue-bright);
  }

  .streams-panel {
    border-color: rgba(37, 99, 235, 0.32);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(255, 255, 255, 0.75));
  }
  .streams-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stream-card {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(37, 99, 235, 0.18);
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s, background 0.15s, transform 0.15s;
  }
  .stream-card:hover {
    border-color: var(--blue-bright);
    background: rgba(37, 99, 235, 0.06);
    transform: translateX(2px);
  }
  .stream-card:hover .stream-title { color: var(--blue-bright); }
  .stream-id {
    font-size: 10px;
    color: var(--blue-bright);
    letter-spacing: 0.12em;
  }
  .stream-title {
    font-size: 12px;
    color: var(--silver-0);
    font-weight: 500;
    line-height: 1.4;
    transition: color 0.15s;
  }

  .related {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .rel-card {
    display: block;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid var(--line);
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s;
  }
  .rel-card:hover { border-color: var(--accent, var(--blue-bright)); }
  .rel-id {
    font-size: 9px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
    margin-bottom: 2px;
  }
  .rel-title {
    font-size: 12px;
    color: var(--silver-0);
    font-weight: 500;
    line-height: 1.4;
  }

  .back-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    color: var(--silver-2);
    border: 1px solid var(--line);
    text-decoration: none;
    font-size: 11px;
    letter-spacing: 0.18em;
    transition: color 0.15s, border-color 0.15s;
  }
  .back-link:hover {
    color: var(--blue-bright);
    border-color: var(--blue-bright);
  }
  .bl-n {
    color: var(--silver-3);
  }

  /* Background watermark rail — always visible, behind content */
  .detail :global(.wrap) { position: relative; }
  .deco-rail {
    position: absolute;
    top: 130px;
    right: clamp(20px, 4vw, 72px);
    bottom: 80px;
    width: clamp(80px, 12vw, 160px);
    pointer-events: none;
    user-select: none;
    z-index: 0;
  }
  .deco-inner {
    position: sticky;
    top: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding-top: 0;
  }
  .deco-watermark {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: 900;
    font-size: clamp(64px, 8.5vw, 128px);
    line-height: 0.9;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--silver-0);
    text-stroke: 1.5px var(--silver-0);
    opacity: 0.22;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .deco-num {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: 900;
    font-size: clamp(26px, 2.8vw, 42px);
    line-height: 1;
    color: transparent;
    -webkit-text-stroke: 1px var(--blue-bright);
    text-stroke: 1px var(--blue-bright);
    opacity: 0.45;
    letter-spacing: 0.04em;
  }
  .deco-line {
    position: relative;
    width: 1px;
    height: 180px;
    background: repeating-linear-gradient(
      to bottom,
      var(--line-strong) 0 6px,
      transparent 6px 12px
    );
    opacity: 0.55;
  }
  .deco-line .tick {
    position: absolute;
    left: -5px;
    width: 11px;
    height: 1px;
    background: var(--silver-3);
  }
  .deco-line .tick:nth-child(1) { top: 18%; }
  .deco-line .tick:nth-child(2) { top: 50%; }
  .deco-line .tick:nth-child(3) { top: 82%; }
  .deco-eof {
    font-size: 9px;
    color: var(--silver-4);
    letter-spacing: 0.22em;
    opacity: 0.55;
  }
  @media (max-width: 700px) {
    .deco-rail {
      width: 64px;
      opacity: 0.7;
    }
    .deco-watermark { font-size: 56px; -webkit-text-stroke-width: 1px; text-stroke-width: 1px; }
    .deco-num { font-size: 22px; }
  }

  /* ===== Lightbox ===== */
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    animation: lb-fade 0.18s ease;
  }
  .lb-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(8, 12, 24, 0.88);
    backdrop-filter: blur(6px);
    border: 0;
    padding: 0;
    cursor: zoom-out;
  }
  .lb-img {
    position: relative;
    max-width: min(100%, 1600px);
    max-height: calc(100vh - 64px);
    width: auto;
    height: auto;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    border-radius: 4px;
  }
  .lb-close {
    position: absolute;
    top: 18px;
    right: 22px;
    background: rgba(255, 255, 255, 0.08);
    color: #E5EBF6;
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 6px 12px;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .lb-close:hover { background: rgba(255, 255, 255, 0.16); }
  @keyframes lb-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
