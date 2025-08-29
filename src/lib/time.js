export function localDateTimeToUTCISO(dateStr, timeStr) {
  // "YYYY-MM-DD", "HH:MM" -> ISO UTC
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return local.toISOString();
}

export function formatLocal(isoUtc) {
  const d = new Date(isoUtc);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
