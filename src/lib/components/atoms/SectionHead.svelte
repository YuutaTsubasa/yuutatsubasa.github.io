<script>
  import { reveal } from '$lib/utils/reveal.js';
  export let num = '';
  export let en = '';
  export let zh = '';
  export let sub = '';
  export let deco = '';
</script>

<div class="sec-head" use:reveal>
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
    animation: glitch-fine 4.4s infinite;
    display: inline-block;
  }
  .title {
    animation: glitch-bold 4.4s infinite;
  }
  @keyframes glitch-fine {
    0%, 82%, 100% { transform: translateX(0); opacity: 1; filter: blur(0); }
    83% { transform: translateX(-1.5px); opacity: 0.6; }
    85% { transform: translateX(1.5px); opacity: 1; }
    87% { transform: translateX(-1px); opacity: 0.4; filter: blur(0.4px); }
    89% { transform: translateX(1.5px); opacity: 1; filter: blur(0); }
    91% { transform: translateX(0); opacity: 0.5; }
    93% { transform: translateX(0.5px); opacity: 1; filter: blur(0.3px); }
    95% { transform: translateX(-0.5px); opacity: 0.75; filter: blur(0); }
    97% { transform: translateX(0); opacity: 1; }
    99% { transform: translateX(0.5px); opacity: 0.8; }
  }
  @keyframes glitch-bold {
    0%, 82%, 100% { transform: translate(0, 0); opacity: 1; filter: blur(0); }
    83% { transform: translate(-3px, 1px); opacity: 0.88; }
    85% { transform: translate(2px, -1px); opacity: 1; filter: blur(0); }
    87% { transform: translate(-2px, 1px); opacity: 0.6; filter: blur(0.6px); }
    89% { transform: translate(3px, 0); opacity: 1; filter: blur(0); }
    91% { transform: translate(-2px, -1px); opacity: 0.5; }
    93% { transform: translate(1px, 0); opacity: 1; filter: blur(0.4px); }
    95% { transform: translate(0, 1px); opacity: 0.78; filter: blur(0); }
    97% { transform: translate(0, 0); opacity: 1; }
    99% { transform: translate(-1px, 0); opacity: 0.9; }
  }
  @media (prefers-reduced-motion: reduce) {
    .num, .title { animation: none; }
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
