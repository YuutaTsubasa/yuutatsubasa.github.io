const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// 該週的週一 00:00（依照使用者本地時區）
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  return d;
}

export function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

// 回傳 7 個 Date 物件，週一 ~ 週日
export function weekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// 取出當週的場次
export function currentWeekStreams(streams, now = new Date()) {
  const start = startOfWeek(now);
  const end = endOfWeek(now);
  return streams
    .filter((s) => {
      const t = new Date(s.startsAt);
      return t >= start && t < end;
    })
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
}

export function streamEnd(stream) {
  const start = new Date(stream.startsAt);
  return new Date(start.getTime() + (stream.durationMinutes ?? 180) * 60000);
}

export function streamStatus(stream, now = new Date()) {
  const start = new Date(stream.startsAt);
  const end = streamEnd(stream);
  if (now >= start && now <= end) return 'live';
  if (now < start) return 'upcoming';
  return 'past';
}

export function currentLive(streams, now = new Date()) {
  return streams.find((s) => streamStatus(s, now) === 'live');
}

export function nextUpcoming(streams, now = new Date()) {
  return streams
    .filter((s) => streamStatus(s, now) === 'upcoming')
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];
}

// 撈某一天的場次（單筆，多筆只取第一筆）
export function streamForDay(streams, dayDate) {
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return streams.find((s) => {
    const t = new Date(s.startsAt);
    return t >= dayStart && t < dayEnd;
  });
}

export function dayName(date) {
  return DAY_NAMES[date.getDay()];
}

export function formatDate(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}.${d}`;
}

export function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ISO 週數
export function isoWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
