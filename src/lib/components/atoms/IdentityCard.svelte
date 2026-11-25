<script>
  // 原本首頁 Hero 的 // IDENTITY CARD（名字的日文標音、注音、拼音＋基本資料），開站畫面也放一份
  import { onMount, onDestroy } from 'svelte';
  import { PROFILE } from '$lib/data/profile.js';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Tele from '$lib/components/atoms/Tele.svelte';
  import ScanBar from '$lib/components/atoms/ScanBar.svelte';

  let signal = 92;
  let signalInterval;
  onMount(() => {
    signalInterval = setInterval(() => {
      signal = Math.round(90 + Math.sin(Date.now() / 700) * 9);
    }, 140);
  });
  onDestroy(() => clearInterval(signalInterval));
</script>

<div class="card">
  <Corners />
  <div class="mono caption">// IDENTITY CARD</div>
  <div class="display name-block">
    {#each PROFILE.name_breakdown as ch}
      <div class="name-char">
        <span class="kana-top">{ch.kana}</span>
        <span class="cjk">{ch.cjk}</span>
        <span class="bopo">
          <span class="bopo-syl">{ch.bopo}</span>
          {#if ch.tone}<span class={`bopo-tone tone-${ch.tone}`} aria-label={`第${ch.tone}聲`}></span>{/if}
        </span>
        <span class="pinyin">{ch.pinyin}</span>
      </div>
    {/each}
  </div>
  <div class="tech name-en-sub">
    {#each PROFILE.name_en.split('') as c}
      <span class="en-c">{c === ' ' ? ' ' : c}</span>
    {/each}
  </div>
  <div class="hr"></div>
  <div class="tele-list">
    <Tele label="ROLE" value={PROFILE.callsign} accent="var(--blue-bright)" />
    <Tele label="DEBUT" value={PROFILE.debut} />
    <Tele label="BIRTH" value={PROFILE.birth} />
    <Tele label="ORIGIN" value={PROFILE.origin} />
    <Tele label="LANGUAGE" value={PROFILE.language} />
    <Tele label="CONTENT" value={PROFILE.content} />
    <Tele label="AGENCY" value={PROFILE.agency} accent="var(--accent-cyan)" />
    <Tele label="PLATFORM" value={PROFILE.platform} />
    <Tele label="FANBASE" value={PROFILE.fanbase} />
  </div>
  <div class="hr"></div>
  <ScanBar progress={signal} label="SIGNAL" />
</div>

<style>
  .card {
    position: relative;
    padding: 22px 22px 28px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(241, 244, 251, 0.7));
    border: 1px solid var(--line);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 4px 18px rgba(15, 45, 120, 0.06);
  }

  .caption {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
    margin-bottom: 10px;
  }
  .name-block {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 32px;
    width: 100%;
  }
  .name-char {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
  }
  .kana-top {
    font-size: 10px;
    color: var(--blue-bright);
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .cjk {
    font-size: 38px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 1;
  }
  .bopo {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 3px;
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .bopo-syl {
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-size: 10px;
    color: var(--silver-3);
    line-height: 1.1;
    letter-spacing: 0.04em;
  }
  /* 用 CSS 畫聲調符號，避免 modifier letter 在不同瀏覽器渲染太小看不到 */
  .bopo-tone {
    display: inline-block;
    width: 6px;
    height: 14px;
    position: relative;
    margin-top: 1px;
    flex-shrink: 0;
  }
  .bopo-tone.tone-2::before {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 5px;
    height: 1px;
    background: var(--silver-2);
    transform: rotate(-40deg);
    transform-origin: left center;
  }
  .bopo-tone.tone-3::before {
    content: 'ˇ';
    position: absolute;
    top: -3px;
    left: 0;
    font-size: 10px;
    color: var(--silver-2);
    font-weight: 700;
    line-height: 1;
  }
  .bopo-tone.tone-4::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 0;
    width: 5px;
    height: 1px;
    background: var(--silver-2);
    transform: rotate(40deg);
    transform-origin: left center;
  }
  .bopo-tone.tone-5::before {
    content: '·';
    position: absolute;
    top: -2px;
    left: 1px;
    font-size: 12px;
    color: var(--silver-2);
    font-weight: 700;
    line-height: 1;
  }
  .pinyin {
    font-size: 10px;
    color: var(--silver-2);
    margin-top: 4px;
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }
  .name-en-sub {
    display: flex;
    justify-content: center;
    width: 100%;
    font-size: 14px;
    color: var(--blue-bright);
    margin-top: 8px;
    letter-spacing: 0.22em;
  }
  .en-c {
    display: inline-block;
    min-width: 0.4em;
    text-align: center;
  }
  .hr {
    height: 1px;
    background: var(--line);
    margin: 18px 0;
  }
  .tele-list { display: grid; gap: 8px; }
</style>
