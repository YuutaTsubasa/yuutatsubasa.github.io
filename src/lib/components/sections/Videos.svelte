<script>
  import { VIDEOS, VIDEO_TYPES } from '$lib/data/videos.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Tag from '$lib/components/atoms/Tag.svelte';

  let filter = 'ALL';
  $: list = filter === 'ALL' ? VIDEOS : VIDEOS.filter(v => v.type === filter);
</script>

<section id="videos" class="videos" data-screen-label="04 Videos">
  <div class="wrap">
    <SectionHead
      num="03 / 06"
      en="ARCHIVE"
      zh="影片庫"
      deco={`COUNT :: ${VIDEOS.length} ENTRIES\nFILTER :: ${filter}\nUPDATED :: 2026.04.28`}
    />

    <div class="tabs">
      {#each VIDEO_TYPES as t}
        <button
          class="tab tech"
          class:active={filter === t}
          on:click={() => (filter = t)}
        >
          {t}
        </button>
      {/each}
    </div>

    <div class="grid">
      {#each list as v, i}
        <article class="card">
          <Corners color="var(--line-strong)" size={10} />
          <div
            class="thumb"
            style="background:
              linear-gradient(135deg, {v.color}40, rgba(8,16,32,.9)),
              radial-gradient(circle at 30% 40%, {v.color}60, transparent 60%);"
          >
            <svg viewBox="0 0 400 200" class="wave">
              {#each Array.from({ length: 40 }) as _, k}
                <rect
                  x={k * 10}
                  y={100 - Math.abs(Math.sin(k * 0.7 + i) * 60)}
                  width="3"
                  height={Math.abs(Math.sin(k * 0.7 + i) * 120)}
                  fill={v.color}
                />
              {/each}
            </svg>
            <div class="play-wrap">
              <div class="play">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF"><path d="M8 5v14l11-7L8 5z" /></svg>
              </div>
            </div>
            <div class="type-tag">
              <Tag color={v.color} solid>{v.type}</Tag>
            </div>
            <div class="mono duration">{v.duration}</div>
            <span class="mono idx">#{String(i + 1).padStart(2, '0')}</span>
          </div>

          <div class="body">
            <div class="title">{v.title}</div>
            <div class="meta mono">
              <span>▸ {v.views} VIEWS</span>
              <span>{v.date}</span>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <div class="more">
      <button class="btn">▸ LOAD MORE ARCHIVES</button>
    </div>
  </div>
</section>

<style>
  .videos {
    position: relative;
    padding: 140px 0 120px;
  }
  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 32px;
    border-bottom: 1px solid var(--line);
    overflow-x: auto;
  }
  .tab {
    padding: 12px 20px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--silver-2);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .tab:hover { color: var(--blue-bright); }
  .tab.active {
    color: var(--blue-bright);
    border-bottom-color: var(--blue-bright);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .card {
    position: relative;
    background: linear-gradient(180deg, #FFFFFF, #F4F6FB);
    border: 1px solid var(--line);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.25s, border-color 0.2s, box-shadow 0.25s;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
  }
  .card:hover {
    transform: translateY(-4px);
    border-color: var(--blue-bright);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 10px 30px rgba(15, 45, 120, 0.14);
  }
  .thumb {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }
  .wave {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.35;
  }
  .play-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .play {
    width: 54px;
    height: 54px;
    border: 1.5px solid #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
  .type-tag {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  .duration {
    position: absolute;
    bottom: 10px;
    right: 10px;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #FFFFFF;
    font-size: 11px;
  }
  .idx {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.7);
  }
  .body { padding: 16px 18px 18px; }
  .title {
    font-size: 14px;
    color: var(--silver-0);
    line-height: 1.5;
    font-weight: 500;
    min-height: 42px;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.1em;
  }
  .more {
    margin-top: 32px;
    text-align: center;
  }

  @media (max-width: 1100px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 700px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
