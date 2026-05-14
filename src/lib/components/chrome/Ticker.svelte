<script>
  import { SCHEDULE } from '$lib/data/schedule.js';
  import { VIDEOS } from '$lib/data/videos.js';
  import { GALLERY } from '$lib/data/gallery.js';
  import { currentLive, nextUpcoming, dayName, formatTime } from '$lib/utils/schedule.js';
  import { now } from '$lib/stores/now.js';

  $: liveStream = currentLive(SCHEDULE, $now);
  $: nextStream = liveStream ? null : nextUpcoming(SCHEDULE, $now);
  $: latestVideo = VIDEOS[0];
  $: latestArt = GALLERY[0];

  // 動態訊息（依當下狀態組合）
  $: dynamic = [
    liveStream
      ? { text: `● LIVE NOW · ${liveStream.title}`, live: true }
      : nextStream
        ? { text: `▸ NEXT STREAM · ${dayName(new Date(nextStream.startsAt))} ${formatTime(new Date(nextStream.startsAt))}${nextStream.tbd ? ' TBD' : ` · ${nextStream.title}`}`, live: false }
        : null,
    latestVideo
      ? { text: `▸ LATEST ARCHIVE · Vol. ${latestVideo.vol} · ${latestVideo.title}`, live: false }
      : null,
    latestArt
      ? { text: `▸ NEW FAN ART · BY ${latestArt.artist} · ${latestArt.date}`, live: false }
      : null
  ].filter(Boolean);

  // 固定訊息（標識身份 / 站點資訊）
  const staticMsgs = [
    { text: '▸ YUUTA TSUBASA · 悠太翼 · TAIWAN VTUBER', live: false },
    { text: '▸ AGENCY :: ULTIMATE-UTOPIA · 終焉理想庭', live: false },
    { text: '▸ HASHTAGS :: #翼直播 · #悠然翼繪 · #翼聞翼事', live: false },
    { text: '▸ SITE V5.0 · BUILT WITH SVELTE', live: false }
  ];

  $: messages = [...staticMsgs.slice(0, 1), ...dynamic, ...staticMsgs.slice(1)];
</script>

<div class="ticker">
  <div class="track mono">
    {#each [0, 1] as _}
      <span class="group">
        {#each messages as msg}
          <span class:live={msg.live}>{msg.text}</span>
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
    color: #B91C1C;
    font-weight: 700;
  }
</style>
