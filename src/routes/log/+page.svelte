<script>
  import { LOG_ENTRIES, LOG_CATEGORIES, findLogCategory, allTagsFor } from '$lib/data/log.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import LogRow from '$lib/components/atoms/LogRow.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { logFilter } from '$lib/stores/filters.js';

  let search = '';
  let sort = 'desc'; // desc = newest first
  let activeTag = null;

  $: presentCategories = LOG_CATEGORIES.filter((c) =>
    LOG_ENTRIES.some((e) => e.category === c.id)
  );

  // tag cloud: tags + stack（從 allTagsFor 統一取出）
  $: tagCounts = (() => {
    const m = new Map();
    LOG_ENTRIES.forEach((e) => allTagsFor(e).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  })();

  $: filtered = LOG_ENTRIES.filter((e) => {
    if ($logFilter !== 'all' && e.category !== $logFilter) return false;
    const allTags = allTagsFor(e);
    if (activeTag && !allTags.includes(activeTag)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = [e.title, e.excerpt, ...allTags].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  $: sorted = sort === 'desc'
    ? [...filtered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    : [...filtered].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // group by YYYY.MM
  $: grouped = (() => {
    const map = new Map();
    sorted.forEach((e) => {
      const key = (e.date || '').slice(0, 7) || '????.??';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return [...map.entries()];
  })();

  function clearAll() {
    search = '';
    activeTag = null;
    logFilter.set('all');
  }
</script>

<Seo
  title="LOG · 悠太翼 YUUTA TSUBASA"
  description="悠太翼的遊戲心得、遊戲作品、LeetCode 解題筆記、Workshop 講義與雜記。"
/>

<section id="main" class="log-list">
  <div class="wrap">
    <!-- Breadcrumb -->
    <div class="mono crumbs">
      <a href="/">▸ HOME</a>
      <span class="crumb-sep">/</span>
      <span class="crumb-now">LOG ARCHIVE</span>
    </div>

    <SectionHead
      id="log"
      suffix="LOGBOOK"
      en="LOG ARCHIVE"
      zh="日誌・全部札記"
      level={1}
      deco={`ENTRIES :: ${String(LOG_ENTRIES.length).padStart(3, '0')}\nFILTER :: ${($logFilter || 'all').toUpperCase()}\nSORT :: ${sort === 'desc' ? 'NEWEST' : 'OLDEST'}`}
    />

    <div class="layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <!-- Type filter -->
        <div class="panel">
          <Corners color="var(--line-strong)" size={9} />
          <div class="mono panel-cap">// TYPE</div>
          <button
            type="button"
            class="type-row"
            class:on={$logFilter === 'all'}
            on:click={() => logFilter.set('all')}
          >
            <span class="type-dot" style:background="var(--silver-3)"></span>
            <span class="type-name">ALL</span>
            <span class="mono type-count">{LOG_ENTRIES.length}</span>
          </button>
          {#each presentCategories as c}
            {@const n = LOG_ENTRIES.filter((e) => e.category === c.id).length}
            <button
              type="button"
              class="type-row"
              class:on={$logFilter === c.id}
              on:click={() => logFilter.set(c.id)}
              style:--accent={c.color}
            >
              <span class="type-dot" style:background={c.color}></span>
              <span class="type-name">{c.enLabel}</span>
              <span class="mono type-count">{n}</span>
            </button>
          {/each}
        </div>

        <!-- Tag cloud -->
        {#if tagCounts.length}
          <div class="panel">
            <Corners color="var(--line-strong)" size={9} />
            <div class="mono panel-cap">// TAGS</div>
            <div class="tag-cloud">
              {#each tagCounts as [t, n]}
                <button
                  type="button"
                  class="tag-chip mono"
                  class:on={activeTag === t}
                  on:click={() => (activeTag = activeTag === t ? null : t)}
                >#{t} <span class="tag-n">{n}</span></button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Sync info -->
        <div class="panel sync-panel">
          <Corners color="var(--line-strong)" size={9} />
          <div class="mono panel-cap">// SYNC</div>
          <div class="sync-row">
            <Dot color="var(--blue-bright)" />
            <span class="mono">LIVE · {LOG_ENTRIES[0]?.date ?? '—'}</span>
          </div>
          <a class="mono rss-link" href="/rss.xml">▸ rss.xml</a>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main">
        <!-- Toolbar: search + sort -->
        <div class="toolbar">
          <div class="search-wrap">
            <span class="mono search-icon">⌕</span>
            <input
              type="text"
              class="search"
              placeholder="search title, excerpt, tag…"
              bind:value={search}
            />
            {#if search}
              <button type="button" class="search-clear mono" on:click={() => (search = '')}>×</button>
            {/if}
          </div>

          <button
            type="button"
            class="sort-btn tech"
            on:click={() => (sort = sort === 'desc' ? 'asc' : 'desc')}
          >
            {sort === 'desc' ? '↓ NEW' : '↑ OLD'}
          </button>

          <span class="mono showing">
            {sorted.length} / {LOG_ENTRIES.length}
          </span>
        </div>

        <!-- Active filters strip -->
        {#if activeTag || $logFilter !== 'all' || search}
          <div class="active-strip mono">
            <span class="active-cap">ACTIVE ▸</span>
            {#if $logFilter !== 'all'}
              {@const cat = findLogCategory($logFilter)}
              <span class="chip-filter" style:--accent={cat?.color ?? 'var(--silver-2)'}>
                {cat?.enLabel ?? $logFilter}
                <button type="button" class="chip-x" on:click={() => logFilter.set('all')}>×</button>
              </span>
            {/if}
            {#if activeTag}
              <span class="chip-filter">
                #{activeTag}
                <button type="button" class="chip-x" on:click={() => (activeTag = null)}>×</button>
              </span>
            {/if}
            {#if search}
              <span class="chip-filter">
                "{search}"
                <button type="button" class="chip-x" on:click={() => (search = '')}>×</button>
              </span>
            {/if}
            <button type="button" class="clear-all mono" on:click={clearAll}>CLEAR ×</button>
          </div>
        {/if}

        <!-- Results -->
        {#if grouped.length === 0}
          <div class="no-results">
            <div class="display nr-title">404 · NO ENTRIES FOUND</div>
            <p class="mono nr-sub">沒有符合條件的條目，試試清除篩選。</p>
            <button type="button" class="btn" on:click={clearAll}>▸ CLEAR FILTERS</button>
          </div>
        {:else}
          {#each grouped as [month, entries]}
            <div class="month-group">
              <div class="month-cap mono">
                <span class="month-bar"></span>
                <span>{month.replace('.', ' / ')}</span>
                <span class="month-n">· {entries.length} ENTRIES</span>
              </div>
              <div class="rows">
                {#each entries as e (e.id)}
                  <LogRow entry={e} />
                {/each}
              </div>
            </div>
          {/each}

          <div class="end-strip">
            <Dot color="var(--blue-bright)" />
            <span class="mono">END OF ARCHIVE · MORE COMING SOON ////</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .log-list {
    position: relative;
    padding: 130px 0 100px;
    min-height: 100vh;
  }

  .crumbs {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
    margin-bottom: 18px;
  }
  .crumbs a {
    color: var(--silver-3);
    text-decoration: none;
  }
  .crumbs a:hover { color: var(--blue-bright); }
  .crumb-sep {
    margin: 0 12px;
    color: var(--silver-4);
  }
  .crumb-now { color: var(--blue-bright); }

  .layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 36px;
    align-items: start;
  }
  @media (max-width: 880px) {
    .layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  .sidebar {
    position: sticky;
    top: 110px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  @media (max-width: 880px) {
    .sidebar {
      position: static;
    }
  }

  .panel {
    position: relative;
    padding: 16px 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.7));
    border: 1px solid var(--line);
  }
  .panel-cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
    margin-bottom: 12px;
  }

  .type-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 6px;
    background: transparent;
    border: none;
    border-bottom: 1px dashed transparent;
    color: var(--silver-1);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
  }
  .type-row:hover {
    background: rgba(37, 99, 235, 0.05);
    color: var(--blue-bright);
  }
  .type-row.on {
    color: var(--accent, var(--blue-bright));
  }
  .type-row.on .type-name { font-weight: 700; }
  .type-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .type-name {
    flex: 1;
    font-size: 12px;
    letter-spacing: 0.16em;
    font-weight: 600;
  }
  .type-count {
    font-size: 11px;
    color: var(--silver-3);
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .tag-chip {
    padding: 3px 8px;
    font-size: 10px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid var(--line);
    color: var(--silver-2);
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tag-chip:hover {
    color: var(--blue-bright);
    border-color: var(--blue-bright);
  }
  .tag-chip.on {
    background: var(--blue-bright);
    color: #FFFFFF;
    border-color: var(--blue-bright);
  }
  .tag-n {
    opacity: 0.55;
    margin-left: 4px;
  }

  .sync-panel { font-size: 11px; }
  .sync-row {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--silver-2);
    letter-spacing: 0.12em;
    margin-bottom: 8px;
  }
  .rss-link {
    display: inline-block;
    color: var(--silver-3);
    text-decoration: none;
    font-size: 11px;
    letter-spacing: 0.15em;
  }
  .rss-link:hover { color: var(--blue-bright); }

  .main { min-width: 0; }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }
  .search-wrap {
    flex: 1;
    position: relative;
    min-width: 200px;
  }
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--silver-3);
  }
  .search {
    width: 100%;
    padding: 10px 38px 10px 36px;
    font-family: var(--font-mono, monospace);
    font-size: 12px;
    color: var(--silver-0);
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid var(--line);
    outline: none;
    transition: border-color 0.15s;
  }
  .search:focus { border-color: var(--blue-bright); }
  .search-clear {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    font-size: 18px;
    line-height: 1;
    color: var(--silver-3);
    cursor: pointer;
  }
  .search-clear:hover { color: var(--blue-bright); }

  .sort-btn {
    padding: 9px 14px;
    font-size: 11px;
    letter-spacing: 0.18em;
    font-weight: 600;
    color: var(--silver-1);
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid var(--line);
    cursor: pointer;
    white-space: nowrap;
  }
  .sort-btn:hover {
    color: var(--blue-bright);
    border-color: var(--blue-bright);
  }
  .showing {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
  }

  .active-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 10px 12px;
    margin-bottom: 16px;
    background: rgba(255, 255, 255, 0.45);
    border: 1px dashed var(--line);
    font-size: 11px;
  }
  .active-cap {
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .chip-filter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px 2px 8px;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: var(--accent, var(--silver-1));
    background: color-mix(in srgb, var(--accent, var(--blue-bright)) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent, var(--blue-bright)) 33%, transparent);
  }
  .chip-x {
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0 4px;
  }
  .clear-all {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--silver-3);
    font-size: 10px;
    letter-spacing: 0.2em;
    cursor: pointer;
    padding: 0;
  }
  .clear-all:hover { color: var(--blue-bright); }

  .month-group {
    margin-bottom: 22px;
  }
  .month-cap {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 11px;
    color: var(--silver-2);
    letter-spacing: 0.22em;
    margin: 0 0 8px;
    padding: 8px 16px;
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0));
    border-left: 2px solid var(--blue-bright);
  }
  .month-bar {
    width: 18px;
    height: 2px;
    background: var(--blue-bright);
  }
  .month-n {
    color: var(--silver-3);
    font-size: 10px;
  }

  .rows {
    border-left: 1px solid var(--line);
    border-right: 1px solid var(--line);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.45), rgba(241, 244, 251, 0.25));
  }

  .end-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px 0 4px;
    color: var(--silver-3);
    font-size: 11px;
    letter-spacing: 0.18em;
  }

  .no-results {
    text-align: center;
    padding: 80px 20px;
    border: 1px dashed var(--line);
    background: rgba(255, 255, 255, 0.4);
  }
  .nr-title {
    font-size: 28px;
    font-weight: 900;
    color: var(--silver-1);
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }
  .nr-sub {
    font-size: 12px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
    margin: 0 0 20px;
  }
</style>
