// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { formatUTCForUser } from "../lib/time";
import "../styles/home.css";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [ev, setEv] = useState(null);
  const [err, setErr] = useState("");

  // Charge l'event "en cours" (backend renvoie une liste, on prend le 1er)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/events/active");
        setEv(data && data.length ? data[0] : null);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Erreur réseau");
      }
    })();
  }, []);

  const canRemove =
    !!ev &&
    !!user &&
    (isAdmin || ev.createdBy === user._id || ev.createdBy === user.id);

  async function del() {
    if (!ev) return;
    if (!confirm("Supprimer cet évènement ?")) return;
    try {
      await api.delete(`/events/${ev._id || ev.id}`);
      setEv(null);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Suppression impossible");
    }
  }

  return (
    <section className="home">
      {err && <p className="error" style={{ marginBottom: 8 }}>{err}</p>}

      {ev ? (
        <div className="featured">
          {ev.imageUrl ? (
            <img src={ev.imageUrl} alt={ev.title} className="featured__img" />
          ) : null}

          <div className="featured__body">
            <h3 className="featured__title">{ev.title}</h3>

            {(ev.description || ev.text) && (
              <p className="featured__text">{ev.description || ev.text}</p>
            )}

            <p className="featured__meta">
              Quand : {formatUTCForUser(ev.startAt)} •
              {" "}Expire : {formatUTCForUser(ev.endAt)}
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