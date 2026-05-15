<script>
  import { VIDEOS, VIDEO_TAGS } from '$lib/data/videos.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  let filter = 'all';

  function tagsOf(ids) {
    return (ids ?? []).map((id) => VIDEO_TAGS.find((t) => t.id === id)).filter(Boolean);
  }

  function padCase(vol) {
    return Number.isFinite(vol) ? String(vol).padStart(3, '0') : '???';
  }

  function padDur(s) {
    if (!s) return '—';
    return /^\d:/.test(s) ? `0${s}` : s;
  }

  $: filters = [
    { id: 'all', label: 'ALL', count: VIDEOS.length },
    ...VIDEO_TAGS.map((t) => ({
      id: t.id,
      label: t.enLabel,
      count: VIDEOS.filter((v) => v.tags?.includes(t.id)).length
    })).filter((f) => f.count > 0)
  ];
  $: list = filter === 'all' ? VIDEOS : VIDEOS.filter((v) => v.tags?.includes(filter));
  $: filterLabel = filters.find((f) => f.id === filter)?.label ?? 'ALL';
</script>

<Seo
  title="ARCHIVE · 悠太翼 YUUTA TSUBASA"
  description="悠太翼歷年直播回顧 — 遊戲、程式、歌回、雜談、3D、繪圖、音樂等內容。"
/>

<section class="archive">
  <div class="wrap">
    <SectionHead
      num="04 / 06 — STREAM ARCHIVE"
      en="ARCHIVE"
      zh="直播檔案・任務日誌"
      deco={`ENTRIES :: ${String(VIDEOS.length).padStart(3, '0')} LOGGED\nFILTER :: ${filterLabel}\nSORT :: NEWEST\nENC :: TLS 1.3`}
    />

    <div class="filter-row">
      <span class="mono filter-label">FILTER ▸</span>
      {#each filters as f}
        <button
          class="chip tech"
          class:on={filter === f.id}
          on:click={() => (filter = f.id)}
        >{f.label} · {String(f.count).padStart(2, '0')}</button>
      {/each}
      <span class="spacer"></span>
      <span class="mono showing">
        SHOWING {list.length === 0 ? '00' : '01'}–{String(list.length).padStart(2, '0')} / {String(VIDEOS.length).padStart(2, '0')}
      </span>
    </div>

    <div class="table">
      <div class="row head mono">
        <span>CASE</span>
        <span>DATE</span>
        <span>DUR</span>
        <span>CAT</span>
        <span>TITLE</span>
        <span class="right">ST</span>
      </div>
      {#each list as v, i (v.id)}
        {@const tags = tagsOf(v.tags)}
        <a
          class="row data"
          class:first={i === 0}
          href={`/archive/${v.slug}`}
          use:reveal={{ delay: Math.min(40 + i * 40, 500), distance: 14 }}
        >
          {#if i === 0}<span class="row-marker" aria-hidden></span>{/if}
          <span class="mono case">#{padCase(v.vol)}</span>
          <span class="mono date">{v.date}</span>
          <span class="mono dur">{padDur(v.duration)}</span>
          <span class="cat">
            {#each tags as t, ti}
              {#if ti > 0}<span class="cat-sep">·</span>{/if}
              <span class="cat-pip" style:background={t.color}></span>
              <span class="tech cat-name">{t.enLabel}</span>
            {/each}
          </span>
          <span class="title">{v.title}</span>
          <span class="mono st right">ARCH</span>
        </a>
      {:else}
        <div class="empty mono">// NO ENTRIES MATCH FILTER</div>
      {/each}
    </div>

    <div class="bottom">
      <a class="mono back" href="/#videos">◀ BACK TO HOME</a>
      <span class="mono pager">· 01 ·</span>
      <span class="mono next">— END OF ARCHIVE —</span>
    </div>
  </div>
</section>

<style>
  .archive {
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
    margin-bottom: 4px;
  }
  .filter-label {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    margin-right: 4px;
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

  .table {
    margin-top: 8px;
  }
  .row {
    display: grid;
    grid-template-columns: 64px 110px 100px 200px 1fr 70px;
    gap: 16px;
    padding: 14px 8px;
    align-items: center;
    border-bottom: 1px dashed var(--line);
    position: relative;
    color: inherit;
    text-decoration: none;
  }
  .row.head {
    padding: 10px 8px;
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.18em;
    border-bottom: 1px solid var(--line);
  }
  .row.data {
    transition: background 0.18s, border-color 0.18s;
  }
  .row.data:hover {
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.06), transparent 80%);
  }
  .row.data.first {
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.08), transparent 60%);
  }
  .row-marker {
    position: absolute;
    left: -12px;
    top: 50%;
    width: 8px;
    height: 8px;
    background: var(--blue-bright);
    transform: translateY(-50%) rotate(45deg);
  }

  .case {
    font-size: 13px;
    color: var(--blue-bright);
    font-weight: 600;
  }
  .date { font-size: 12px; color: var(--silver-1); }
  .dur  { font-size: 12px; color: var(--silver-2); }
  .cat {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  .cat-pip {
    display: inline-block;
    width: 8px;
    height: 8px;
    flex-shrink: 0;
  }
  .cat-name {
    font-size: 11px;
    color: var(--silver-1);
    letter-spacing: 0.1em;
  }
  .cat-sep {
    color: var(--silver-3);
    font-size: 10px;
  }
  .title {
    font-size: 14px;
    color: var(--silver-0);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row.data:hover .title { color: var(--blue-bright); }
  .right { text-align: right; }
  .st {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
  }

  .empty {
    padding: 40px 8px;
    text-align: center;
    color: var(--silver-3);
    font-size: 12px;
    letter-spacing: 0.18em;
  }

  .bottom {
    margin-top: 32px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--silver-3);
  }
  .back {
    color: var(--silver-2);
    text-decoration: none;
    transition: color 0.15s;
  }
  .back:hover { color: var(--blue-bright); }
  .pager { color: var(--blue-bright); }

  @media (max-width: 900px) {
    .row {
      grid-template-columns: 56px 90px 80px 120px 1fr 56px;
      gap: 10px;
      font-size: 12px;
    }
    .title { font-size: 13px; }
  }
  @media (max-width: 700px) {
    .row {
      grid-template-columns: 50px 90px 1fr 56px;
    }
    .row .dur, .row .cat { display: none; }
  }
</style>
