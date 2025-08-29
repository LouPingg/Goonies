// Fuseau du visiteur (ex: "Europe/Paris", "America/New_York")
export function getUserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Convertit une saisie <input type="datetime-local"> (locale) -> timestamp UTC (ms)
export function localDatetimeToUTCms(localStr) {
  // "YYYY-MM-DDTHH:mm" interprété en local par JS => Date stocke en ms UTC
  const d = new Date(localStr);
  return d.getTime();
}

// Formate un timestamp UTC pour le visiteur (dans SON fuseau)
export function formatUTCForUser(ts, opts = {}) {
  const tz = getUserTimeZone();
  const fmt = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
  return fmt.format(new Date(ts));
}
