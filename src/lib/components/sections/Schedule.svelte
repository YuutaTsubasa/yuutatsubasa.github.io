<script>
  import { SCHEDULE } from '$lib/data/schedule.js';
  import { STREAM_TAGS } from '$lib/data/streamTags.js';
  import {
    weekDays,
    streamForDay,
    streamStatus,
    dayName,
    formatDate,
    formatTime,
    isoWeek,
    isSameDay
  } from '$lib/utils/schedule.js';
  import { now } from '$lib/stores/now.js';
  import SectionHead from '$lib/components/atoms/SectionHead.svelte';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Dot from '$lib/components/atoms/Dot.svelte';

  $: days = weekDays($now);
  $: weekStreams = days.map((d) => streamForDay(SCHEDULE, d));
  $: liveIdx = weekStreams.findIndex((s) => s && streamStatus(s, $now) === 'live');
  $: todayIdx = days.findIndex((d) => isSameDay(d, $now));
  $: weekLabel = `WEEK ${isoWeek($now)} / ${$now.getFullYear()}`;
  $: weekRange = `${formatDate(days[0])} - ${formatDate(days[6])}`;
  $: streamCount = weekStreams.filter((s) => s).length;

  let manualIdx = null;
  function pick(i) {
    manualIdx = i;
  }
  $: defaultIdx =
    liveIdx >= 0
      ? liveIdx
      : todayIdx >= 0
      ? todayIdx
      : weekStreams.findIndex((s) => s) >= 0
      ? weekStreams.findIndex((s) => s)
      : 0;
  $: selectedIdx = manualIdx ?? defaultIdx;

  $: selected = weekStreams[selectedIdx];
  $: selectedDay = days[selectedIdx];
  $: selectedStatus = selected ? streamStatus(selected, $now) : null;

  function tagOf(id) {
    return STREAM_TAGS.find((t) => t.id === id);
  }

  function buttonLabel(status) {
    if (status === 'live') return 'GO TO STREAM ▸';
    if (status === 'upcoming') return 'SET REMINDER ▸';
    if (status === 'past') return 'WATCH ARCHIVE ▸';
    return '';
  }
</script>

<section id="schedule" class="schedule" data-screen-label="03 Schedule">
  <div class="wrap">
    <SectionHead
      num="02 / 06"
      en="SCHEDULE"
      zh="直播時程"
      deco={`${weekLabel}\n${weekRange}\n計 ${String(streamCount).padStart(2, '0')} STREAMS`}
    />

    <div class="legend">
      {#each STREAM_TAGS as t}
        <span class="legend-item mono">
          <Dot color={t.color} pulse={false} size={6} />
          {t.label}
        </span>
      {/each}
    </div>

    <div class="week-grid">
      {#each days as date, i}
        {@const stream = weekStreams[i]}
        {@const status = stream ? streamStatus(stream, $now) : 'off'}
        {@const tag = stream ? tagOf(stream.tag) : null}
        {@const isActive = i === selectedIdx}
        {@const isToday = i === todayIdx}
        <button
          class="day"
          class:active={isActive}
          class:off={status === 'off'}
          class:past={status === 'past'}
          class:today={isToday}
          on:click={() => pick(i)}
        >
          <Corners color={isActive ? 'var(--blue-bright)' : 'var(--line-strong)'} size={10} />
          <div class="mono day-date">{formatDate(date)}</div>
          <div class="display day-name" class:active-day={isActive}>{dayName(date)}</div>
          {#if isToday}
            <div class="today-tag mono">TODAY</div>
          {/if}
          <div class="day-rule"></div>
          <div class="tech day-time">
            {stream ? formatTime(new Date(stream.startsAt)) : '—'}
          </div>
          {#if status === 'live'}
            <div class="live-chip"><Dot color="#EF4444" size={5} /> LIVE</div>
          {:else if status === 'past'}
            <div class="past-chip mono">ENDED</div>
          {/if}
          <div class="day-title">{stream?.title ?? '休息日'}</div>
          {#if stream}
            <div class="day-foot">
              <span class="mono">{stream.platform}</span>
              <span class="day-dot" style:background={tag?.color}></span>
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <div class="detail">
      <Corners />
      <div class="display detail-day">
        {dayName(selectedDay)}
        <span class="tech detail-date">/{formatDate(selectedDay)}</span>
      </div>
      <div class="detail-info">
        <div class="mono caption">// SELECTED STREAM</div>
        {#if selected}
          <div class="detail-title">{selected.title}</div>
          <div class="tech detail-meta">
            ▸ {formatTime(new Date(selected.startsAt))} · {selected.platform} · {tagOf(selected.tag)?.label}
            {#if selectedStatus === 'live'}
              <span class="status-live"> · LIVE NOW</span>
            {:else if selectedStatus === 'past'}
              <span class="status-past"> · ENDED</span>
            {/if}
          </div>
        {:else}
          <div class="detail-title">本日休息</div>
          <div class="tech detail-meta">▸ —</div>
        {/if}
      </div>
      {#if selected && selected.url}
        <a class="btn btn-primary" href={selected.url} target="_blank" rel="noopener">
          {buttonLabel(selectedStatus)}
        </a>
      {/if}
    </div>
  </div>
</section>

<style>
  .schedule {
    position: relative;
    padding: 140px 0 120px;
  }
  .legend {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--silver-2);
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
  }
  .day {
    position: relative;
    text-align: left;
    padding: 18px 14px 16px;
    background: linear-gradient(180deg, #FFFFFF, #EEF2FA);
    border: 1px solid var(--line);
    cursor: pointer;
    color: inherit;
    transition: all 0.2s;
    min-height: 200px;
    font-family: inherit;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 4px 18px rgba(15, 45, 120, 0.06);
  }
  .day.active {
    background: linear-gradient(180deg, #DCE7FB, #FFFFFF);
    border-color: var(--blue-bright);
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3), 0 6px 22px rgba(37, 99, 235, 0.18);
  }
  .day.off { opacity: 0.55; }
  .day.past { opacity: 0.65; }
  .day.past.active { opacity: 1; }
  .day-date {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .day-name {
    font-size: 24px;
    font-weight: 900;
    color: var(--silver-0);
    letter-spacing: 0.05em;
    margin-top: 4px;
  }
  .day-name.active-day { color: var(--blue-bright); }
  .today-tag {
    display: inline-block;
    font-size: 9px;
    color: var(--accent-cyan);
    letter-spacing: 0.2em;
    margin-top: 4px;
    padding: 1px 6px;
    border: 1px solid var(--accent-cyan);
    background: rgba(8, 145, 178, 0.08);
  }
  .day-rule {
    height: 1px;
    background: var(--line);
    margin: 12px 0;
  }
  .day-time {
    font-size: 11px;
    color: var(--silver-2);
    letter-spacing: 0.1em;
  }
  .live-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 2px 8px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #B91C1C;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.15em;
    font-weight: 700;
  }
  .past-chip {
    display: inline-block;
    margin-top: 8px;
    padding: 2px 8px;
    background: rgba(107, 119, 148, 0.12);
    border: 1px solid var(--silver-4);
    color: var(--silver-3);
    font-size: 9px;
    letter-spacing: 0.18em;
    font-weight: 700;
  }
  .day-title {
    font-size: 12px;
    color: var(--silver-1);
    margin-top: 10px;
    line-height: 1.45;
    font-weight: 500;
  }
  .day-foot {
    position: absolute;
    bottom: 10px;
    left: 14px;
    right: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: var(--silver-3);
  }
  .day-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .detail {
    position: relative;
    margin-top: 24px;
    padding: 22px 26px;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, #FFFFFF, #EEF2FA);
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 24px;
    align-items: center;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
  }
  .detail-day {
    font-size: 54px;
    font-weight: 900;
    color: var(--blue-bright);
    line-height: 1;
  }
  .detail-date {
    font-size: 14px;
    color: var(--silver-3);
    margin-left: 10px;
  }
  .caption {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .detail-title {
    font-size: 22px;
    color: var(--silver-0);
    font-weight: 600;
    margin-top: 4px;
  }
  .detail-meta {
    font-size: 12px;
    color: var(--silver-2);
    margin-top: 6px;
    letter-spacing: 0.12em;
  }
  .status-live {
    color: #B91C1C;
    font-weight: 700;
  }
  .status-past {
    color: var(--silver-3);
  }

  @media (max-width: 1100px) {
    .week-grid { grid-template-columns: repeat(3, 1fr); }
    .detail { grid-template-columns: 1fr; text-align: center; }
  }
  @media (max-width: 600px) {
    .week-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
