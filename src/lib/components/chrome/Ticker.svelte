<script>
  const messages = [
    '▸ YUUTA TSUBASA · KNIGHT OF CODE',
    '● LIVE NOW · 歌回・五月夜の星',
    '▸ NEXT STREAM · 05.05 22:00 JST',
    '▸ NEW COVER · 五月夜の星 · 32.4K VIEWS',
    '▸ COMMISSION OPEN',
    '▸ SITE V5.0 · BUILT WITH CODE & SWORD',
    '▸ THE BLADE RESTS · THE KEYS NEVER SLEEP'
  ];
</script>

<div class="ticker">
  <div class="track mono">
    {#each [0, 1] as _}
      <span class="group">
        {#each messages as msg, i}
          <span class:live={i === 1}>{msg}</span>
        {/each}
      </span>
    {/each}
  </div>
</div>

<style>
  .ticker {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 28px;
    z-index: 50;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 254, 0.9));
    border-bottom: 1px solid var(--line);
    overflow: hidden;
    display: flex;
    align-items: center;
    backdrop-filter: blur(8px);
  }
  .track {
    white-space: nowrap;
    animation: ticker 60s linear infinite;
    display: flex;
    font-size: 11px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
    padding-left: 24px;
  }
  .group {
    display: flex;
    gap: 48px;
    padding-right: 48px;
  }
  .live {
    color: var(--blue-bright);
  }
</style>
