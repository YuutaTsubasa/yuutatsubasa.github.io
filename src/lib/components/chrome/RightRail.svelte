<script>
  import { PRIMARY_SOCIALS } from '$lib/data/socials.js';
</script>

<aside class="rail">
  {#each PRIMARY_SOCIALS as s}
    <a class="ic" href={s.url} target="_blank" rel="noopener" title={s.label} aria-label={s.label}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={s.iconPath} /></svg>
    </a>
  {/each}
  <div class="divider"></div>
  <span class="mono scroll-label">SCROLL ↓</span>
</aside>

<style>
  .rail {
    position: fixed;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
  }
  .ic {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
    color: var(--silver-2);
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(4px);
  }
  .ic:hover {
    color: var(--blue-bright);
    border-color: var(--blue-bright);
  }
  .divider {
    width: 1px;
    height: 24px;
    background: var(--line);
  }
  .scroll-label {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.25em;
  }
  @media (max-width: 900px) {
    .rail { display: none; }
  }
</style>
