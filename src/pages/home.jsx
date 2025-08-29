// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { formatUTCForUser } from "../lib/time";
import { useCountdown } from "../lib/countdown";
import "../styles/home.css";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [ev, setEv] = useState(null);
  const [upcoming, setUpcoming] = useState(false);
  const [err, setErr] = useState("");

  // Charger l'évènement à la une (actif sinon prochain)
  useEffect(() => {
    (async () => {
      try {
        const act = await api.get("/events/active");
        if (Array.isArray(act.data) && act.data.length > 0) {
          setEv(act.data[0]);
          setUpcoming(false);
          return;
        }
        const all = await api.get("/events");
        const now = Date.now();
        const future = (all.data || [])
          .filter(e => new Date(e.startAt).getTime() > now)
          .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        if (future.length > 0) {
          setEv(future[0]);
          setUpcoming(true);
        } else {
          setEv(null);
          setUpcoming(false);
        }
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Erreur réseau");
      }
    })();
  }, []);

  const canRemove =
    !!ev &&
    !!user &&
    (isAdmin || ev.createdBy === user._id || ev.createdBy === user.id);

  // ✅ Hooks appelés SANS condition
  const startCd = useCountdown(ev?.startAt, "until");
  const endCd   = useCountdown(ev?.endAt,   "until");

  // Si l'event en cours se termine pendant qu'on est sur la page
  useEffect(() => {
    if (ev && !upcoming && endCd && endCd.done) setEv(null);
  }, [ev, upcoming, endCd?.done]);

  async function del() {
    if (!ev) return;
    if (!confirm("Supprimer cet évènement ?")) return;
    try {
      await api.delete(`/events/${ev._id || ev.id}`);
      setEv(null);
      setUpcoming(false);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Suppression impossible");
    }
  }

  return (
    <section className="home">
      {err && <p className="error" style={{ marginBottom: 8 }}>{err}</p>}

      {ev ? (
        <div className="featured" style={{ maxWidth: 720, margin: "-140px auto 24px" }}>
          {ev.imageUrl ? (
            <img src={ev.imageUrl} alt={ev.title} className="featured__img" />
          ) : null}

          <div className="featured__body" style={{ textAlign: "center" }}>
            <h3 className="featured__title">
              {upcoming ? "À venir : " : ""}{ev.title}
            </h3>

            {(ev.description || ev.text) && (
              <p className="featured__text">{ev.description || ev.text}</p>
            )}

            <p className="featured__meta">
              {upcoming ? (
                <>Débute : {formatUTCForUser(ev.startAt)} • Dans : {startCd.label}</>
              ) : (
                <>Quand : {formatUTCForUser(ev.startAt)} • Se termine dans : {endCd.label}</>
              )}
            </p>

            {canRemove && (
              <button className="featured__remove" onClick={del}>
                Supprimer
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="muted" style={{ textAlign: "center" }}>
          Aucun event à la une pour le moment.
        </p>
      )}
    </section>
  );
}