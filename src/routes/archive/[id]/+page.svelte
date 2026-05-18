<script>
  import { page } from '$app/stores';
  import { marked } from 'marked';
  import { VIDEOS, VIDEO_TAGS, findVideo, timeToSeconds } from '$lib/data/videos.js';
  import { findLogsByStream, findLogCategory } from '$lib/data/log.js';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  $: video = findVideo($page.params.id);
  $: idx = video ? VIDEOS.indexOf(video) : -1;
  // VIDEOS 是新到舊，所以陣列下一個是更舊的 = PREV，上一個是更新的 = NEXT
  $: prev = idx >= 0 ? VIDEOS[idx + 1] : null;
  $: next = idx > 0 ? VIDEOS[idx - 1] : null;
  $: tagObjs = video ? video.tags.map((id) => VIDEO_TAGS.find((t) => t.id === id)).filter(Boolean) : [];
  $: relatedLogs = video ? findLogsByStream(video.vol) : [];

  function padCase(vol) {
    return Number.isFinite(vol) ? String(vol).padStart(3, '0') : '???';
  }
  function chapterUrl(sourceUrl, time) {
    if (!sourceUrl) return null;
    const sep = sourceUrl.includes('?') ? '&' : '?';
    return `${sourceUrl}${sep}t=${timeToSeconds(time)}s`;
  }

  let playerEl;
  function seekTo(time) {
    if (!playerEl?.contentWindow) return;
    const secs = timeToSeconds(time);
    playerEl.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [secs, true] }),
      '*'
    );
    playerEl.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
      '*'
    );
    // 將 player 滑入視口
    playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // HH:MM:SS → ISO 8601 PT#H#M#S
  function isoDuration(d) {
    if (!d) return undefined;
    const secs = timeToSeconds(d);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}${s ? s + 'S' : ''}` || 'PT0S';
  }

  // YYYY.MM.DD → YYYY-MM-DD
  function isoDate(d) {
    return d ? d.replace(/\./g, '-') : undefined;
  }

  $: jsonLd = video
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: video.title,
          description: video.excerpt || `Vol. ${video.vol} · ${video.title}`,
          uploadDate: isoDate(video.date),
          duration: isoDuration(video.duration),
          thumbnailUrl: video.youtubeId
            ? [`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`]
            : undefined,
          embedUrl: video.youtubeId
            ? `https://www.youtube.com/embed/${video.youtubeId}`
            : undefined,
          contentUrl: video.youtubeId
            ? `https://www.youtube.com/watch?v=${video.youtubeId}`
            : undefined,
          publisher: {
            '@type': 'Person',
            name: '悠太翼',
            url: 'https://yuuta-tsubasa.studio'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://yuuta-tsubasa.studio/' },
            { '@type': 'ListItem', position: 2, name: 'Archive', item: 'https://yuuta-tsubasa.studio/archive' },
            { '@type': 'ListItem', position: 3, name: video.title, item: `https://yuuta-tsubasa.studio/archive/${video.slug}` }
          ]
        }
      ]
    : null;
</script>

{#if video}
  <Seo
    title={`${video.title} · ARCHIVE · 悠太翼 YUUTA TSUBASA`}
    description={video.excerpt || `Vol. ${video.vol} · ${video.title}`}
    image={video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
      : '/images/og-card.png'}
    imageAlt={video.title}
    imageWidth={1280}
    imageHeight={720}
    type="video.other"
    {jsonLd}
  />
{:else}
  <Seo title="ARCHIVE · 悠太翼 YUUTA TSUBASA" />
{/if}

<section id="main" class="detail">
  <div class="wrap">
    {#if !video}
      <div class="not-found">
        <Corners />
        <div class="mono nf-cap">// FILE NOT FOUND</div>
        <div class="display nf-title">#{padCase(parseInt($page.params.id, 10))} ／ NO MATCHING RECORD</div>
        <a class="mono nf-back" href="/archive">◀ BACK TO ARCHIVE</a>
      </div>
    {:else}
      <!-- breadcrumb -->
      <div class="bc" use:reveal={{ delay: 0, distance: 10 }}>
        <span class="mono bc-id">ARCHIVE ▸ #{padCase(video.vol)}</span>
        <span class="mono bc-open">CASE FILE OPEN</span>
        <span class="spacer"></span>
        <a class="mono bc-back" href="/archive">◀ BACK TO ARCHIVE</a>
      </div>

      <!-- title -->
      <div class="title-row" use:reveal={{ delay: 80 }}>
        <h1 class="display dt-title">{video.title}</h1>
        <div class="tech dt-meta">
          STREAM #{padCase(video.vol)} ／ {video.date}{#if video.duration} ／ {video.duration}{/if}{#if tagObjs.length} ／ {tagObjs.map((t) => t.enLabel).join(' · ')}{/if}
        </div>
      </div>

      <!-- related LOG callout -->
      {#if relatedLogs.length}
        <div class="related-logs" use:reveal={{ delay: 100, distance: 10 }}>
          <Corners color="var(--blue-bright)" size={10} />
          <div class="rl-head">
            <span class="mono rl-cap">// LINKED LOG ENTRIES</span>
            <span class="tech rl-sub">📄 相關紀錄 · {relatedLogs.length}</span>
          </div>
          <div class="rl-list">
            {#each relatedLogs as l}
              {@const cat = findLogCategory(l.category)}
              <a class="rl-item" href={`/log/${l.slug}`} style:--accent={cat?.color ?? 'var(--blue-bright)'}>
                <span class="tech rl-chip">
                  <span class="rl-glyph">{cat?.glyph ?? '▸'}</span>{cat?.enLabel ?? 'LOG'}
                </span>
                <span class="rl-title">{l.title}</span>
                <span class="mono rl-arrow">↗</span>
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <!-- main grid -->
      <div class="grid">
        <div class="main">
          <!-- player -->
          <div class="player" use:reveal={{ delay: 140 }}>
            <Corners />
            {#if video.youtubeId}
              <iframe
                bind:this={playerEl}
                src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1`}
                title={video.title}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            {:else}
              <div class="no-video mono">// NO EMBED AVAILABLE</div>
            {/if}
            <span class="mono player-tag">● VOD</span>
            {#if video.duration}
              <span class="mono player-dur">{video.duration}</span>
            {/if}
          </div>

          <!-- chapters -->
          {#if video.chapters.length}
            <div class="chapters" use:reveal={{ delay: 220 }}>
              <Corners />
              <div class="mono ch-cap">// CHAPTERS · {String(video.chapters.length).padStart(2, '0')} TRACKS</div>
              {#each video.chapters as c, ci}
                <div class="ch-row" class:clickable={!!video.youtubeId}>
                  {#if video.youtubeId}
                    <button
                      class="ch-main"
                      on:click={() => seekTo(c.time)}
                      title="跳到此時間點"
                    >
                      <span class="mono ch-time">{c.time}</span>
                      <span class="ch-label">{c.label}</span>
                      <span class="mono ch-go">▶</span>
                    </button>
                    <a
                      class="ch-yt"
                      href={chapterUrl(video.sourceUrl, c.time)}
                      target="_blank"
                      rel="noopener"
                      title="在 YouTube 開啟此時間點"
                    >↗</a>
                  {:else}
                    <span class="mono ch-time">{c.time}</span>
                    <span class="ch-label">{c.label}</span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- sidebar -->
        <aside class="side">
          <div class="panel" use:reveal={{ delay: 180 }}>
            <Corners />
            <div class="mono panel-cap">// TAGS</div>
            <div class="tag-list">
              {#each tagObjs as t}
                <span
                  class="tag-chip tech"
                  style:color={t.color}
                  style:border-color={`${t.color}80`}
                  style:background={`${t.color}14`}
                >#{t.enLabel}</span>
              {/each}
            </div>
          </div>

          {#if prev || next}
            <div class="panel" use:reveal={{ delay: 260 }}>
              <Corners />
              <div class="mono panel-cap">// ADJACENT</div>
              {#if prev}
                <a class="adj" href={`/archive/${prev.slug}`}>
                  <div class="mono adj-cap">◀ PREV #{padCase(prev.vol)}</div>
                  <div class="adj-title">{prev.title}</div>
                </a>
              {/if}
              {#if next}
                <a class="adj" class:bordertop={!!prev} href={`/archive/${next.slug}`}>
                  <div class="mono adj-cap next">NEXT #{padCase(next.vol)} ▶</div>
                  <div class="adj-title">{next.title}</div>
                </a>
              {/if}
            </div>
          {/if}

          {#if video.sourceUrl}
            <a class="btn btn-primary watch" href={video.sourceUrl} target="_blank" rel="noopener">
              ↗ WATCH ON YT
            </a>
          {/if}
        </aside>
      </div>

      <!-- briefing -->
      {#if video.bodyRaw}
        <div class="briefing" use:reveal={{ delay: 80 }}>
          <Corners />
          <div class="brief-head">
            <span class="mono bh-cap">// BRIEFING</span>
            <span class="display bh-title">補充說明</span>
            <span class="tech bh-sub">DOSSIER NOTE ／ MARKDOWN</span>
          </div>
          <div class="brief-body">
            {@html marked.parse(video.bodyRaw)}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</section>

<style>
  .detail {
    position: relative;
    padding: 130px 0 100px;
    min-height: 100vh;
  }
  .wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
  }

  /* breadcrumb */
  .bc {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
  }
  .bc-id {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.18em;
  }
  .bc-open {
    font-size: 10px;
    color: var(--blue-bright);
    letter-spacing: 0.18em;
  }
  .spacer { flex: 1; }
  .bc-back {
    font-size: 10px;
    color: var(--silver-2);
    letter-spacing: 0.18em;
    text-decoration: none;
    transition: color 0.15s;
  }
  .bc-back:hover { color: var(--blue-bright); }

  /* title */
  .title-row {
    padding: 20px 0 24px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 24px;
  }
  .dt-title {
    font-size: 36px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 1.15;
    letter-spacing: 0.01em;
    margin: 0;
    text-wrap: balance;
  }
  .dt-meta {
    margin-top: 8px;
    font-size: 13px;
    color: var(--silver-2);
    letter-spacing: 0.14em;
  }

  /* related LOG callout */
  .related-logs {
    position: relative;
    padding: 14px 18px 16px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.7));
    border: 1px solid rgba(37, 99, 235, 0.32);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 4px 16px rgba(37, 99, 235, 0.08);
  }
  .rl-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px dashed rgba(37, 99, 235, 0.25);
    flex-wrap: wrap;
  }
  .rl-cap {
    font-size: 10px;
    color: var(--blue-bright);
    letter-spacing: 0.22em;
  }
  .rl-sub {
    font-size: 12px;
    color: var(--silver-1);
    letter-spacing: 0.1em;
    font-weight: 600;
  }
  .rl-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .rl-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    padding: 8px 10px;
    align-items: center;
    text-decoration: none;
    color: inherit;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(37, 99, 235, 0.12);
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
  }
  .rl-item:hover {
    background: rgba(37, 99, 235, 0.08);
    border-color: var(--accent);
    transform: translateX(2px);
  }
  .rl-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 9px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    color: var(--accent);
  }
  .rl-glyph { font-size: 11px; }
  .rl-title {
    font-size: 13px;
    color: var(--silver-0);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rl-arrow {
    font-size: 12px;
    color: var(--silver-3);
    transition: color 0.15s, transform 0.15s;
  }
  .rl-item:hover .rl-arrow {
    color: var(--accent);
    transform: translate(2px, -2px);
  }
  @media (max-width: 600px) {
    .rl-item {
      grid-template-columns: auto 1fr;
      gap: 8px;
    }
    .rl-arrow { display: none; }
    .rl-title { white-space: normal; }
  }

  /* main grid */
  .grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    align-items: start;
  }

  /* player */
  .player {
    position: relative;
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, #0F1B30, #050810);
    border: 1px solid var(--line-strong);
    overflow: hidden;
  }
  .player iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .no-video {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--silver-3);
    font-size: 12px;
    letter-spacing: 0.18em;
  }
  .player-tag {
    position: absolute;
    top: 14px;
    left: 14px;
    font-size: 10px;
    color: #FCA5A5;
    letter-spacing: 0.2em;
    padding: 3px 8px;
    border: 1px solid rgba(252, 165, 165, 0.5);
    background: rgba(5, 8, 16, 0.6);
    z-index: 2;
    pointer-events: none;
  }
  .player-dur {
    position: absolute;
    bottom: 14px;
    right: 14px;
    font-size: 11px;
    color: #fff;
    letter-spacing: 0.15em;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2;
    pointer-events: none;
  }

  /* chapters */
  .chapters {
    position: relative;
    margin-top: 18px;
    padding: 16px 18px 14px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.7);
  }
  .ch-cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    margin-bottom: 10px;
  }
  .ch-row {
    display: flex;
    align-items: stretch;
    border-bottom: 1px dashed var(--line);
    color: inherit;
    transition: background 0.15s;
  }
  .ch-row:last-child { border-bottom: 0; }
  .ch-row.clickable:hover { background: rgba(37, 99, 235, 0.06); }
  .ch-main {
    flex: 1;
    display: grid;
    grid-template-columns: 84px 1fr 32px;
    gap: 12px;
    padding: 8px 4px;
    align-items: center;
    background: transparent;
    border: 0;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .ch-yt {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    color: var(--silver-3);
    text-decoration: none;
    font-size: 13px;
    border-left: 1px dashed var(--line);
    transition: background 0.15s, color 0.15s;
  }
  .ch-yt:hover {
    background: rgba(37, 99, 235, 0.1);
    color: var(--blue-bright);
  }
  .ch-time {
    font-size: 11px;
    color: var(--blue-bright);
  }
  .ch-label {
    font-size: 13px;
    color: var(--silver-1);
  }
  .ch-go {
    font-size: 10px;
    color: var(--silver-3);
    text-align: right;
  }

  /* side panels */
  .side {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .panel {
    position: relative;
    padding: 14px 16px 16px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid var(--line);
  }
  .panel-cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .tag-chip {
    font-size: 10px;
    padding: 3px 9px;
    letter-spacing: 0.12em;
    border: 1px solid;
  }
  .adj {
    display: block;
    padding: 8px 0;
    text-decoration: none;
    color: inherit;
    margin-top: 8px;
  }
  .adj.bordertop {
    border-top: 1px dashed var(--line);
    padding-top: 10px;
  }
  .adj:hover .adj-title { color: var(--blue-bright); }
  .adj-cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
  }
  .adj-cap.next { color: var(--blue-bright); }
  .adj-title {
    font-size: 12px;
    color: var(--silver-1);
    margin-top: 4px;
    transition: color 0.15s;
  }
  .watch {
    justify-content: center;
    width: 100%;
  }

  /* briefing */
  .briefing {
    position: relative;
    margin-top: 36px;
    padding: 22px 28px 28px;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, #FFFFFF, #EEF2FA);
  }
  .brief-head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
  }
  .bh-cap {
    font-size: 10px;
    color: var(--blue-bright);
    letter-spacing: 0.25em;
  }
  .bh-title {
    font-size: 22px;
    font-weight: 900;
    color: var(--silver-0);
  }
  .bh-sub {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.18em;
  }
  .brief-body {
    font-size: 13px;
    line-height: 1.85;
    color: var(--silver-1);
  }
  .brief-body :global(h2) {
    font-size: 14px;
    font-weight: 700;
    color: var(--silver-0);
    margin: 22px 0 8px;
  }
  .brief-body :global(h2 + ul) { margin-top: 4px; }
  .brief-body :global(p) { margin: 0 0 12px; }
  .brief-body :global(ul),
  .brief-body :global(ol) {
    margin: 0 0 14px;
    padding-left: 22px;
  }
  .brief-body :global(li) { margin: 2px 0; }
  .brief-body :global(a) {
    color: var(--blue-bright);
    text-decoration: none;
    border-bottom: 1px dashed var(--blue-bright);
  }
  .brief-body :global(a:hover) { color: var(--blue-electric); }
  .brief-body :global(img) {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--line);
    margin: 8px 0;
  }
  .brief-body :global(code) {
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 1px 5px;
    background: rgba(37, 99, 235, 0.08);
    border-radius: 2px;
  }

  /* 404 */
  .not-found {
    position: relative;
    margin-top: 60px;
    padding: 60px 32px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.6);
    text-align: center;
  }
  .nf-cap {
    font-size: 11px;
    color: var(--accent-warn);
    letter-spacing: 0.25em;
  }
  .nf-title {
    margin-top: 14px;
    font-size: 28px;
    font-weight: 900;
    color: var(--silver-0);
  }
  .nf-back {
    display: inline-block;
    margin-top: 18px;
    color: var(--blue-bright);
    text-decoration: none;
    font-size: 11px;
    letter-spacing: 0.18em;
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
    .dt-title { font-size: 28px; }
  }
</style>
