<script>
  import { findLogCategory, logMetaBits } from '$lib/data/log.js';

  export let entry;
  export let showDate = true;
  export let compact = false;

  $: cat = findLogCategory(entry.category);
  $: bits = logMetaBits(entry);
</script>

<a class="row" class:compact href={`/log/${entry.slug}`} style:--accent={cat?.color ?? 'var(--silver-2)'}>
  <span class="mono carat">&gt;</span>

  {#if showDate}
    <span class="mono date">
      <span class="date-part">{entry.date}</span>{#if entry.time}<span class="sep">·</span><span class="time-part">{entry.time}</span>{/if}
    </span>
  {/if}

  {#if cat}
    <span class="tech chip">
      <span class="chip-glyph">{cat.glyph}</span>{cat.enLabel}
    </span>
  {:else}
    <span></span>
  {/if}

  <span class="title-row">
    <span class="title">{entry.title}</span>
    <span class="leader"></span>
  </span>

  <span class="mono meta">
    {#each bits as b, k}
      {#if k > 0}<span class="meta-sep">·</span>{/if}
      <span>{b}</span>
    {/each}
  </span>

  <span class="mono arrow">→</span>
</a>

<style>
  .row {
    display: grid;
    /* chip 欄改成固定 110px（從 auto），讓所有 row 的 LABEL 等寬對齊；
       搭配 .chip 內部 justify-content: center 達成文字置中。 */
    grid-template-columns: 14px 138px 110px minmax(0, 2.2fr) minmax(0, 1fr) 18px;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    text-decoration: none;
    color: inherit;
    border-bottom: 1px solid var(--line);
    background: transparent;
    transition: background 0.15s;
    position: relative;
  }
  .row:hover {
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0) 80%);
  }
  .row:hover .carat,
  .row:hover .arrow { color: var(--accent); }
  .row:hover .arrow { transform: translateX(2px); }
  .row:hover .title { color: var(--silver-0); }

  .carat {
    color: var(--silver-3);
    font-size: 12px;
    font-weight: 700;
    transition: color 0.15s;
  }
  .row:hover .carat::before { content: '▸'; }
  .row:hover .carat { font-size: 11px; }

  .date {
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .date .sep {
    color: var(--silver-4);
    margin: 0 6px;
  }

  .chip {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 33%, transparent);
    color: var(--accent);
  }
  .chip-glyph { font-size: 10px; }

  .title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .title {
    color: var(--silver-1);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }
  .leader {
    flex: 1;
    border-top: 1px dotted var(--line-strong);
    opacity: 0.55;
    min-width: 24px;
  }

  .meta {
    font-size: 11px;
    color: var(--silver-2);
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    gap: 0;
    align-items: center;
    justify-content: flex-end;
  }
  .meta-sep {
    color: var(--silver-4);
    margin: 0 7px;
  }

  .arrow {
    color: var(--silver-3);
    font-size: 14px;
    text-align: right;
    transition: color 0.15s, transform 0.15s;
  }

  /* Compact: hide meta col on narrow screens / inside grouped views */
  @media (max-width: 880px) {
    .row {
      grid-template-columns: 14px 130px 110px minmax(0, 1fr) 18px;
      gap: 14px;
    }
    .meta { display: none; }
  }
  @media (max-width: 600px) {
    .row {
      grid-template-columns: 14px 90px 10px minmax(0, 1fr) 18px;
      gap: 8px;
      padding: 12px 12px;
    }
    .title-row .leader { display: none; }
    /* 縮短日期：只留日期，時間隱藏 */
    .date .sep, .date .time-part { display: none; }
    .date { font-size: 10px; }
    /* chip 縮成圓形燈號 */
    .chip {
      width: 10px; height: 10px;
      padding: 0;
      margin: 0;
      border: none;
      border-radius: 50%;
      background: var(--accent);
      overflow: hidden;
      font-size: 0;
      letter-spacing: 0;
      justify-self: center;
    }
    .chip-glyph { display: none; }
  }
</style>
