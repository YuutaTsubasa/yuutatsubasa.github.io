<script>
  import { onMount, onDestroy } from 'svelte';
  import { NAV } from '$lib/data/nav.js';
  import { activeSection, gotoSection } from '$lib/stores/active.js';
  import Dot from '$lib/components/atoms/Dot.svelte';

  let timeStr = '';
  let interval;

  function updateTime() {
    const t = new Date();
    timeStr = t.toTimeString().slice(0, 8);
  }

  onMount(() => {
    updateTime();
    interval = setInterval(updateTime, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<header class="nav">
  <a class="brand" href="#hero" on:click|preventDefault={() => gotoSection('hero')}>
    <img src="/images/logo-knight.png" alt="悠太翼 / YUUTA TSUBASA" />
    <div class="brand-tag">
      <div class="mono tag">VTUBER // V5.0</div>
    </div>
  </a>

  <nav class="links">
    {#each NAV as n}
      <button
        class="nav-btn tech"
        class:active={$activeSection === n.id}
        on:click={() => gotoSection(n.id)}
      >
        <span class="mono num">{n.num}</span>
        {n.label}
      </button>
    {/each}
  </nav>

  <div class="status">
    <span class="mono time">{timeStr}</span>
    <Dot color="#22D3EE" />
  </div>
</header>

<style>
  .nav {
    position: fixed;
    top: 28px;
    left: 0;
    right: 0;
    height: 60px;
    z-index: 50;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 254, 0.78));
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    padding: 0 32px;
    gap: 32px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
  }
  .brand img {
    height: 34px;
    width: auto;
    display: block;
  }
  .brand-tag {
    padding-left: 12px;
    border-left: 1px solid var(--line);
  }
  .tag {
    font-size: 9px;
    color: var(--blue-bright);
    letter-spacing: 0.25em;
  }
  .links {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }
  .nav-btn {
    position: relative;
    padding: 6px 14px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--silver-2);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
  }
  .nav-btn:hover {
    color: var(--blue-bright);
  }
  .nav-btn.active {
    color: var(--blue-bright);
    border-color: var(--line-strong);
    background: rgba(59, 130, 246, 0.1);
  }
  .num {
    font-size: 9px;
    color: var(--silver-3);
    margin-right: 6px;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-left: 14px;
    border-left: 1px solid var(--line);
  }
  .time {
    font-size: 11px;
    color: var(--silver-2);
  }
  @media (max-width: 1100px) {
    .nav { padding: 0 16px; gap: 16px; }
    .links { display: none; }
  }
</style>
