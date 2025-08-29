export function localDateTimeToUTCISO(dateStr, timeStr) {
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return local.toISOString();
}

export function formatLocal(isoUtc) {
  if (!isoUtc) return "—";
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

// compat avec ton ancien import
export const formatUTCForUser = formatLocal;
