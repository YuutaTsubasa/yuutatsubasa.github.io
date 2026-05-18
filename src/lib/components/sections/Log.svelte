<script>
  import { LOG_ENTRIES, LOG_CATEGORIES } from '$lib/data/log.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';
  import LogRow from '$lib/components/atoms/LogRow.svelte';
  import { logFilter } from '$lib/stores/filters.js';

  const PREVIEW = 7;

  $: presentCategories = LOG_CATEGORIES.filter((c) =>
    LOG_ENTRIES.some((e) => e.category === c.id)
  );
  $: filters = [{ id: 'all', enLabel: 'ALL' }, ...presentCategories];
  $: filtered = $logFilter === 'all'
    ? LOG_ENTRIES
    : LOG_ENTRIES.filter((e) => e.category === $logFilter);
  $: preview = filtered.slice(0, PREVIEW);

  $: total = LOG_ENTRIES.length;
  $: latest = LOG_ENTRIES[0];
  $: stats = [
    { label: 'TOTAL ENTRIES', value: total, accent: 'var(--blue-bright)' },
    ...LOG_CATEGORIES.map((c) => ({
      label: c.enLabel,
      value: LOG_ENTRIES.filter((e) => e.category === c.id).length,
      accent: c.color
    }))
  ];
</script>

<section id="log" class="log" data-screen-label="06 Log">
  <div class="wrap">
    <SectionHead
      id="log"
      en="LOG"
      zh="日誌・札記"
      deco={`ENTRIES :: ${String(total).padStart(3, '0')} LOGGED\nLATEST  :: ${latest?.date ?? '—'}\nFILTER  :: ${($logFilter || 'all').toUpperCase()}`}
    />

    {#if total === 0}
      <div class="empty mono">// LOG IS EMPTY · 還沒有條目</div>
    {:else}
      <!-- Stats strip -->
      <div class="stats">
        {#each stats as s}
          <div class="stat-cell">
            <Corners color="var(--line-strong)" size={9} />
            <div class="mono stat-label">// {s.label}</div>
            <div class="display stat-value" style:color={s.accent}>{String(s.value).padStart(3, '0')}</div>
          </div>
        {/each}
      </div>

      <!-- Filter tabs row -->
      <div class="tab-row">
        {#each filters as f}
          <button
            type="button"
            class="tab tech"
            class:on={$logFilter === f.id}
            on:click={() => logFilter.set(f.id)}
          >
            {f.enLabel}
            {#if f.id !== 'all'}
              <span class="mono tab-count">
                {LOG_ENTRIES.filter((e) => e.category === f.id).length}
              </span>
            {/if}
          </button>
        {/each}

        <a class="full-link tech" href="/log">
          <span class="mono full-count">[ {filtered.length} ]</span>
          view full log
          <span class="full-arrow">→</span>
        </a>
      </div>

      <!-- Rows -->
      <div class="rows">
        {#each preview as e (e.id)}
          <LogRow entry={e} />
        {/each}
        {#if preview.length === 0}
          <div class="no-match mono">▸ NO ENTRIES MATCH FILTER //</div>
        {/if}
      </div>

      <!-- Bottom CTA strip -->
      <div class="cta-strip">
        <div class="cta-left">
          <Dot color="var(--blue-bright)" />
          <span class="mono">SHOWING {preview.length} / {filtered.length} ENTRIES</span>
        </div>
        <a class="btn" href="/log">▸ OPEN FULL ARCHIVE</a>
      </div>
    {/if}
  </div>
</section>

<style>
  .log {
    position: relative;
    padding: 140px 0 120px;
  }
  .empty {
    text-align: center;
    color: var(--silver-3);
    font-size: 12px;
    padding: 48px 0;
    letter-spacing: 0.2em;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
  }
  .stat-cell {
    position: relative;
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.7));
    border: 1px solid var(--line);
  }
  .stat-label {
    font-size: 9px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
  }
  .stat-value {
    font-size: 32px;
    font-weight: 900;
    line-height: 1.1;
    margin-top: 6px;
  }
  @media (max-width: 700px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
  }

  .tab-row {
    display: flex;
    align-items: center;
    gap: 0;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
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
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab:hover { color: var(--blue-bright); }
  .tab.on {
    color: var(--blue-bright);
    border-bottom-color: var(--blue-bright);
  }
  .tab-count {
    margin-left: 8px;
    font-size: 9px;
    opacity: 0.6;
  }

  .full-link {
    margin-left: auto;
    padding: 12px 0;
    color: var(--silver-2);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.15s;
  }
  .full-link:hover { color: var(--blue-bright); }
  .full-count {
    font-size: 9px;
    color: var(--silver-3);
  }
  .full-arrow { font-size: 14px; }

  .rows {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.45), rgba(241, 244, 251, 0.25));
    border-left: 1px solid var(--line);
    border-right: 1px solid var(--line);
  }
  .no-match {
    padding: 40px 16px;
    text-align: center;
    color: var(--silver-3);
    font-size: 12px;
    letter-spacing: 0.2em;
  }

  .cta-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.7));
    border: 1px solid var(--line);
    border-top: none;
    gap: 16px;
    flex-wrap: wrap;
  }
  .cta-left {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-size: 11px;
    color: var(--silver-2);
    letter-spacing: 0.15em;
  }
</style>
