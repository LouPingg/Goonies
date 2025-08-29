import { useEffect, useState } from "react";

function formatHMS(ms) {
  if (!Number.isFinite(ms)) return "—";
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** Compte à rebours vers une date ISO UTC.
 *  mode = "until"  → temps restant
 *        = "since" → temps écoulé
 */
export function useCountdown(targetISO, mode = "until") {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!targetISO) return { label: "—", ms: NaN, done: true };

  const target = new Date(targetISO).getTime();
  if (!Number.isFinite(target)) return { label: "—", ms: NaN, done: true };

  const diff = mode === "until" ? target - now : now - target;
  return { label: formatHMS(diff), ms: diff, done: diff <= 0 };
}
