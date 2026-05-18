<script>
  import { PROFILE } from '$lib/data/profile.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Panel from '$lib/components/atoms/Panel.svelte';
  import Tag from '$lib/components/atoms/Tag.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  const stats = [
    { label: 'DEBUT',    value: PROFILE.debut },
    { label: 'ORIGIN',   value: PROFILE.origin },
    { label: 'BIRTHDAY', value: PROFILE.birth },
    { label: 'FAV GAME', value: 'SONIC', accent: true },
    { label: 'AGENCY',   value: PROFILE.agency },
    { label: 'FANBASE',  value: PROFILE.fanbase }
  ];

  const lastSync = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  const codeBlock = `var yuuta = new VTuber {
    Name   = "悠太翼",
    Agency = "終焉理想庭",
    Topics = new[] { "Sonic", "C#", "Svelte", "音樂遊戲", "唱歌" }
};

yuuta.Topics
    .Where(t => yuuta.LovesIt(t))
    .ToList()
    .ForEach(t => Stream(t));`;
</script>

<section id="about" class="about" data-screen-label="02 About">
  <div class="wrap">
    <SectionHead
      id="about"
      en="PROFILE"
      zh="騎士檔案"
      deco={`DOSSIER ID :: YUTAII-00\nCLEARANCE :: PUBLIC\nLAST SYNC :: ${lastSync}`}
    />

    <div class="grid">
      <!-- LEFT: three-view + likes/dislikes -->
      <div class="col-left" use:reveal={{ delay: 80 }}>
        <div class="num-mark display">
          <span class="num-fill">01</span><span class="tech num-total">/06</span>
        </div>

        <Panel padding={32} glow minHeight={520}>
          <div class="mono caption">// FIG.A — KEY VISUAL</div>
          <div class="figure">
            <img
              src="/images/yuuta-figure-1-1280.webp"
              srcset="/images/yuuta-figure-1-1280.webp 1280w, /images/yuuta-figure-1-1920.webp 1920w"
              sizes="(max-width: 1100px) calc(100vw - 40px), 600px"
              alt="悠太翼 V5.0 預先立繪"
              loading="lazy"
            />
            <div class="scan-overlay" aria-hidden></div>
          </div>
          <div class="meta mono">
            <span>3D MODEL · UPCOMING</span>
            <span class="accent">● V5.0 PREVIEW</span>
            <span>BY <a href="https://x.com/krain0406" target="_blank" rel="noopener noreferrer">魯魯 @krain0406</a></span>
          </div>
        </Panel>

        <div class="likes-grid">
          <Panel padding={18}>
            <div class="mono pos-cap">+ AFFINITIES</div>
            <ul class="tag-list">
              {#each PROFILE.likes as l}
                <li><Tag color="#60A5FA">{l}</Tag></li>
              {/each}
            </ul>
          </Panel>
          <Panel padding={18}>
            <div class="mono neg-cap">− HOSTILES</div>
            <ul class="tag-list">
              {#each PROFILE.dislikes as l}
                <li><Tag color="#EF4444">{l}</Tag></li>
              {/each}
            </ul>
          </Panel>
        </div>
      </div>

      <!-- RIGHT: bio + stats -->
      <div class="col-right" use:reveal={{ delay: 200 }}>
        <div class="display name-zh">悠太翼</div>
        <div class="tech name-en">YUUTA TSUBASA · {PROFILE.callsign}</div>

        <div class="divider"></div>

        <div class="stats-grid">
          {#each stats as s}
            <div class="stat-cell">
              <div class="mono stat-label">{s.label}</div>
              <div class="tech stat-value" class:accent={s.accent}>{s.value}</div>
            </div>
          {/each}
        </div>

        {#each PROFILE.bio as p}
          <p class="bio">{p}</p>
        {/each}

        <div class="actions">
          <a class="btn btn-primary" href="#connect">▸ OPEN COMMS ARRAY</a>
          <a class="btn" href="https://yutaii.run/youtube" target="_blank" rel="noopener">↗ LAUNCH CHANNEL</a>
        </div>

        <pre class="mono code-block">{codeBlock}</pre>
      </div>
    </div>
  </div>
</section>

<style>
  .about {
    position: relative;
    padding: 140px 0 120px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 32px;
    align-items: start;
  }
  .col-left { position: relative; }

  .num-mark {
    position: absolute;
    top: -20px;
    left: -20px;
    z-index: 3;
    font-size: 96px;
    font-weight: 900;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  .num-fill {
    color: var(--silver-0);
    -webkit-text-stroke: 0;
  }
  .num-total {
    font-size: 18px;
    color: var(--silver-3);
    margin-left: 8px;
  }

  .caption {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    margin-bottom: 6px;
  }
  .figure {
    position: relative;
    aspect-ratio: 16 / 10;
    background: radial-gradient(circle at center, rgba(96, 165, 250, 0.08), transparent 70%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .figure img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3));
  }
  .scan-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 48%, rgba(124, 196, 255, 0.4) 50%, transparent 52%);
    animation: scanline 4s linear infinite;
    pointer-events: none;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    margin-top: 14px;
    font-size: 10px;
    color: var(--silver-3);
  }
  .meta .accent { color: var(--blue-bright); }
  .meta a {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px dashed currentColor;
    transition: color 0.15s;
  }
  .meta a:hover { color: var(--blue-bright); }

  .likes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 18px;
  }
  .pos-cap {
    font-size: 10px;
    color: #2563EB;
    letter-spacing: 0.2em;
    margin-bottom: 10px;
  }
  .neg-cap {
    font-size: 10px;
    color: #B91C1C;
    letter-spacing: 0.2em;
    margin-bottom: 10px;
  }
  .tag-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .name-zh {
    font-size: 88px;
    line-height: 0.9;
    font-weight: 900;
    color: var(--silver-0);
    letter-spacing: 0.01em;
  }
  .name-en {
    font-size: 18px;
    color: var(--blue-bright);
    letter-spacing: 0.18em;
    margin-top: 6px;
  }
  .divider {
    height: 1px;
    background: linear-gradient(90deg, var(--blue-bright), transparent);
    margin: 24px 0;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  .stat-cell {
    position: relative;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid var(--line);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset;
  }
  .stat-label {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.18em;
    margin-bottom: 4px;
  }
  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--silver-0);
  }
  .stat-value.accent { color: var(--blue-bright); }

  .bio {
    font-size: 15px;
    line-height: 2;
    color: var(--silver-1);
    margin-bottom: 14px;
    text-wrap: pretty;
  }
  .actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .code-block {
    margin-top: 32px;
    padding: 20px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--silver-1);
    background: linear-gradient(135deg, #F4F6FB, #E5EBF6);
    border: 1px solid var(--line);
    white-space: pre-wrap;
  }

  @media (max-width: 1100px) {
    .grid { grid-template-columns: 1fr; }
    .name-zh { font-size: 64px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .col-left :global(.panel) { min-height: 0 !important; }
  }
</style>
