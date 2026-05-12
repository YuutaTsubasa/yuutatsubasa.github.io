<script>
  import { NAV } from '$lib/data/nav.js';
  import { activeSection, gotoSection } from '$lib/stores/active.js';
</script>

<aside class="rail">
  {#each NAV as n}
    {@const on = $activeSection === n.id}
    <button class="rung" on:click={() => gotoSection(n.id)} title={n.zh} aria-label={n.zh}>
      <span class="bar" class:on></span>
      <span class="mono num" class:on>{n.num}</span>
    </button>
  {/each}
</aside>

<style>
  .rail {
    position: fixed;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  .rung {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .bar {
    width: 18px;
    height: 1px;
    background: var(--silver-4);
    transition: all 0.25s;
  }
  .bar.on {
    width: 28px;
    background: var(--blue-bright);
  }
  .num {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.15em;
    font-weight: 600;
    transition: color 0.25s;
  }
  .num.on {
    color: var(--blue-bright);
  }
  @media (max-width: 900px) {
    .rail { display: none; }
  }
</style>
