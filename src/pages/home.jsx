// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { formatUTCForUser } from "../lib/time";
import { useCountdown } from "../lib/countdown";
import CatButton from "../components/CatButton";
import "../styles/home.css";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [active, setActive] = useState([]);     // évènements en cours/actifs
  const [future, setFuture] = useState([]);     // évènements à venir (triés)
  const [err, setErr] = useState("");

  // Charger actifs + tous, puis dériver “future”
  useEffect(() => {
    (async () => {
      try {
        setErr("");
        // actifs
        const act = await api.get("/events/active");
        const actList = Array.isArray(act.data) ? act.data : [];
        setActive(actList);

        // tous (pour “future”)
        const all = await api.get("/events");
        const now = Date.now();
        const fut = (all.data || [])
          .filter(e => new Date(e.startAt).getTime() > now)
          .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        setFuture(fut);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Network error");
      }
    })();
  }, []);

  // Évènement “featured” = le 1er actif, sinon le prochain à venir
  const featured = useMemo(() => {
    if (active.length > 0) return active[0];
    return future[0] || null;
  }, [active, future]);

  // “upcoming extra” = 2 suivants (excluant le featured)
  const upcomingExtras = useMemo(() => {
    const list = [...future];
    if (!featured) return list.slice(0, 2);
    return list
      .filter(e => (e._id || e.id) !== (featured._id || featured.id))
      .slice(0, 2);
  }, [future, featured]);

  // droits
  const canRemove = (ev) =>
    !!ev && !!user && (isAdmin || ev.createdBy === user._id || ev.createdBy === user.id);

  // compte à rebours pour le bloc “featured” uniquement
  const startCd = useCountdown(featured?.startAt, "until");
  const endCd   = useCountdown(featured?.endAt,   "until");

  async function del(ev) {
    if (!ev) return;
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${ev._id || ev.id}`);
      const id = ev._id || ev.id;
      setActive((cur) => cur.filter(x => (x._id||x.id) !== id));
      setFuture((cur) => cur.filter(x => (x._id||x.id) !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Delete failed");
    }
  }

  return (
    <section className="home">
      {err && <p className="error mb-8">{err}</p>}

      {/* === Featured (actif ou prochain) === */}
      {featured ? (
        <div className="featured">
          {featured.imageUrl ? (
            <img src={featured.imageUrl} alt={featured.title} className="featured__img" />
          ) : null}

          <div className="featured__body">
            <h3 className="featured__title">
              {active.length === 0 ? "Upcoming: " : ""}{featured.title}
            </h3>

            {(featured.description || featured.text) && (
              <p className="featured__text">{featured.description || featured.text}</p>
            )}

            <p className="featured__meta">
              {active.length === 0 ? (
                <>Starts: {formatUTCForUser(featured.startAt)} • In: {startCd.label}</>
              ) : (
                <>When: {formatUTCForUser(featured.startAt)} • Ends in: {endCd.label}</>
              )}
            </p>

            {canRemove(featured) && (
              <CatButton
                variant="delete"
                size={72}
                label="Delete"
                onClick={() => del(featured)}
                showLabel
              />
            )}
          </div>
        </div>
      ) : (
        <p className="muted text-center">No featured event right now.</p>
      )}

      {/* === (Option) afficher aussi 2 prochains évènements === */}
      {upcomingExtras.length > 0 && (
        <div className="featured-list">
          {upcomingExtras.map(ev => (
            <div key={ev._id || ev.id} className="featured">
              {ev.imageUrl ? (
                <img src={ev.imageUrl} alt={ev.title} className="featured__img" />
              ) : null}

              <div className="featured__body">
                <h3 className="featured__title">Upcoming: {ev.title}</h3>
                {(ev.description || ev.text) && (
                  <p className="featured__text">{ev.description || ev.text}</p>
                )}
                <p className="featured__meta">Starts: {formatUTCForUser(ev.startAt)}</p>

                {canRemove(ev) && (
                  <CatButton
                    variant="delete"
                    size={72}
                    label="Delete"
                    onClick={() => del(ev)}
                    showLabel
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}