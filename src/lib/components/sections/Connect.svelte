<script>
  import { SOCIALS } from '$lib/data/socials.js';
  import { RESOURCES } from '$lib/data/resources.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';
</script>

<section id="connect" class="connect" data-screen-label="07 Connect">
  <div class="wrap">
    <SectionHead
      num="06 / 06"
      en="CONNECT"
      zh="聯絡通道"
      deco={`CHANNELS :: ${SOCIALS.length} OPEN\nSIGNAL :: STRONG\nENC :: TLS 1.3`}
    />

    <div class="grid">
      {#each SOCIALS as s, i}
        <a class="card" href={s.url} target="_blank" rel="noopener">
          <Corners />
          <div class="mono ch">CHANNEL #{String(i + 1).padStart(2, '0')}</div>
          <div class="head">
            <div class="ic">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d={s.iconPath} /></svg>
            </div>
            <div class="head-text">
              <div class="display label">{s.label}</div>
              <div class="tech handle">{s.handle}</div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="foot">
            <span class="mono open">▸ OPEN CHANNEL</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--blue-bright)" stroke-width="1.5">
              <path d="M5 12 H19 M13 6 L19 12 L13 18" />
            </svg>
          </div>
        </a>
      {/each}
    </div>

    <!-- Resources / Acknowledgements -->
    <div class="resources">
      <Corners />
      <div class="res-head">
        <div class="mono caption">// ACKNOWLEDGEMENTS</div>
        <div class="tech res-sub">資源來源 — 影片與素材製作協力</div>
      </div>
      <div class="res-list">
        {#each RESOURCES as r}
          <a class="res-item" href={r.url} target="_blank" rel="noopener">
            <span class="mono res-arr">▸</span>
            <span class="res-label">{r.label}</span>
            <span class="mono res-link">↗</span>
          </a>
        {/each}
      </div>
    </div>

    <!-- END strip -->
    <div class="end">
      <Corners />
      <div class="end-grid">
        <div class="display end-label">
          END<span class="end-dot">.</span>
          <div class="tech end-sub">OF TRANSMISSION</div>
        </div>
        <div>
          <p class="mono end-text">
            ▸ Thank you for visiting the dossier of YUUTA TSUBASA.<br />
            ▸ The blade rests, but the keys never sleep. See you on stream.<br />
            ▸ © 2026 YUUTA TSUBASA · ALL RIGHTS RESERVED · SITE V5.0
          </p>
        </div>
        <div class="signal">
          <Dot color="#22D3EE" />
          <div class="mono signal-label">SIGNAL OK</div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .connect {
    position: relative;
    padding: 140px 0 160px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .card {
    position: relative;
    text-decoration: none;
    color: inherit;
    padding: 36px 28px;
    background: linear-gradient(135deg, #FFFFFF, #ECF0F8);
    border: 1px solid var(--line);
    transition: all 0.3s;
    display: block;
    overflow: hidden;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
  }
  .card:hover {
    border-color: var(--blue-bright);
    transform: translateY(-4px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 12px 40px rgba(59, 130, 246, 0.25);
  }
  .ch {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.25em;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 24px;
  }
  .ic {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--blue-electric), var(--blue-deep));
    border: 1px solid var(--blue-bright);
    color: #FFFFFF;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    flex-shrink: 0;
  }
  .head-text {
    min-width: 0;
    flex: 1;
  }
  .label {
    font-size: 24px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 1.1;
  }
  .handle {
    font-size: 13px;
    color: var(--blue-bright);
    margin-top: 4px;
    letter-spacing: 0.08em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hr {
    height: 1px;
    background: var(--line);
    margin: 24px 0 16px;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .open {
    font-size: 11px;
    color: var(--silver-2);
    letter-spacing: 0.18em;
  }

  /* Resources block */
  .resources {
    position: relative;
    margin-top: 56px;
    padding: 28px 32px;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(241, 244, 251, 0.7));
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
  }
  .res-head {
    margin-bottom: 18px;
  }
  .caption {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.22em;
  }
  .res-sub {
    font-size: 13px;
    color: var(--silver-2);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .res-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 24px;
  }
  .res-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 8px 10px;
    text-decoration: none;
    color: var(--silver-1);
    font-size: 13px;
    line-height: 1.5;
    border-bottom: 1px dashed transparent;
    transition: all 0.2s;
  }
  .res-item:hover {
    color: var(--blue-bright);
    border-bottom-color: var(--line);
    background: rgba(37, 99, 235, 0.04);
  }
  .res-arr {
    color: var(--blue-bright);
    font-size: 11px;
    flex-shrink: 0;
  }
  .res-label {
    flex: 1;
  }
  .res-link {
    color: var(--silver-3);
    font-size: 11px;
    flex-shrink: 0;
  }

  /* END strip */
  .end {
    position: relative;
    margin-top: 56px;
    padding: 32px 40px;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, #FFFFFF, #EEF2FA);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
  }
  .end-grid {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 32px;
    align-items: center;
  }
  .end-label {
    font-size: 54px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 0.9;
  }
  .end-dot { color: var(--blue-bright); }
  .end-sub {
    font-size: 14px;
    color: var(--silver-3);
    letter-spacing: 0.18em;
    margin-top: 4px;
  }
  .end-text {
    font-size: 11px;
    color: var(--silver-3);
    line-height: 1.8;
    letter-spacing: 0.05em;
    margin: 0;
  }
  .signal {
    text-align: right;
  }
  .signal-label {
    font-size: 10px;
    color: var(--silver-3);
    margin-top: 8px;
    letter-spacing: 0.15em;
  }

  @media (max-width: 1100px) {
    .grid { grid-template-columns: 1fr; }
    .res-list { grid-template-columns: 1fr; }
    .end-grid { grid-template-columns: 1fr; text-align: center; }
    .signal { text-align: center; }
  }
</style>
