// Live Jakarta clock. Formats in Indonesian locale.

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric"
});

const TIME_FMT = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export function startClock({ dateEl, timeEl }) {
  const tick = () => {
    const now = new Date();
    if (dateEl) dateEl.textContent = DATE_FMT.format(now).toUpperCase();
    if (timeEl) timeEl.textContent = TIME_FMT.format(now).replace(".", ":");
  };
  tick();
  const id = setInterval(tick, 1000 * 15);
  return () => clearInterval(id);
}

export function formatRelative(iso) {
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return DATE_FMT.format(then);
}

export function formatTime(iso) {
  return TIME_FMT.format(new Date(iso)).replace(".", ":");
}
