<script>
  export let num = '';
  export let en = '';
  export let zh = '';
  export let sub = '';
  export let deco = '';
</script>

<div class="sec-head">
  <div>
    <div class="num-row">
      <span class="rule"></span>
      <span class="mono num">SECTION / {num}</span>
    </div>
    <h2 class="display title">{en}</h2>
    <div class="tech sub">／／ {zh}{sub ? ` · ${sub}` : ''}</div>
  </div>
  {#if deco}
    <pre class="mono deco">{deco}</pre>
  {/if}
</div>

<style>
  .sec-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 48px;
    flex-wrap: wrap;
  }
  .num-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .rule {
    width: 36px;
    height: 1px;
    background: var(--blue-bright);
  }
  .num {
    color: var(--blue-bright);
    font-size: 11px;
    letter-spacing: 0.22em;
  }
  .title {
    font-size: 72px;
    font-weight: 900;
    line-height: 0.95;
    margin: 14px 0 0;
    color: var(--silver-0);
    text-shadow: 0 0 40px rgba(96, 165, 250, 0.25);
  }
  .sub {
    margin-top: 10px;
    color: var(--silver-2);
    font-size: 14px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }
  .deco {
    margin: 0;
    color: var(--silver-3);
    font-size: 11px;
    line-height: 1.7;
    text-align: right;
    white-space: pre;
  }
  @media (max-width: 720px) {
    .title { font-size: 48px; }
  }
</style>
