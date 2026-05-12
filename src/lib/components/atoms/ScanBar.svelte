<script>
  export let progress = 75;
  export let label = 'SCANNING';
</script>

<div class="scan">
  <div class="hdr">
    <span>{label}</span>
    <span class="pct">{progress}%</span>
  </div>
  <div class="track">
    <div class="fill" style="width:{progress}%">
      <span class="shine"></span>
    </div>
  </div>
</div>

<style>
  .scan {
    width: 100%;
  }
  .hdr {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--silver-3);
    margin-bottom: 6px;
    letter-spacing: 0.1em;
  }
  .pct {
    color: var(--blue-bright);
  }
  .track {
    height: 4px;
    background: rgba(30, 58, 138, 0.10);
    position: relative;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--blue-electric), var(--accent-cyan));
    box-shadow: 0 0 12px var(--blue-bright);
    position: relative;
  }
  .shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: ticker 1.4s linear infinite;
  }
</style>
