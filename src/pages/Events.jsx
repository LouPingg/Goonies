import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addEvent, listEvents, removeEvent } from "../lib/storage";
import { localDatetimeToUTCms, formatUTCForUser } from "../lib/time";
import "../styles/events.css";

export default function Events() {
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState({
    title: "",
    text: "",
    imageUrl: "",            // peut être une URL http(s) OU un dataURL (base64)
    when: defaultLocalDatetime(),
    hours: 24,
  });
  const [items, setItems] = useState(listEvents());
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      // on réutilise imageUrl pour stocker un dataURL (img src accepte les deux)
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("Titre requis.");
    if (!form.text.trim()) return setErr("Texte requis.");
    if (!form.when) return setErr("Date/heure requise.");

    const h = Number(form.hours);
    if (!Number.isFinite(h) || h < 1 || h > 48) return setErr("Durée: 1 à 48 h.");
    if (!user) return setErr("Connecte-toi pour créer un event.");

    const startAtUtc = localDatetimeToUTCms(form.when);

    addEvent({
      title: form.title,
      text: form.text,
      imageUrl: form.imageUrl, // dataURL OU URL distante
      hours: h,
      createdBy: user.id,
      startAtUtc,
    });

    setItems(listEvents());
    setForm({
      title: "",
      text: "",
      imageUrl: "",
      when: defaultLocalDatetime(),
      hours: 24,
    });
  }

  function del(ev) {
    if (!user) return;
    if (isAdmin || ev.createdBy === user.id) {
      removeEvent(ev.id);
      setItems(listEvents());
    } else {
      setErr("Tu ne peux supprimer que tes événements (ou être admin).");
    }
  }

  return (
    <section className="page">
      <h2>Créer un event</h2>

      {!user && <p className="muted">Connecte-toi pour créer un événement.</p>}
      {err && <p className="error" style={{ marginBottom: 8 }}>{err}</p>}

      {user && (
        <form className="form" onSubmit={submit} noValidate>
          <label> Titre
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>

          <label> Image — au choix
            <div className="event-upload">
              <input
                className="event-url"
                placeholder="URL (optionnel) — ou choisis un fichier"
                value={form.imageUrl?.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                disabled={busy}
              />
              <label className="event-file">
                <input type="file" accept="image/*" onChange={handleFile} hidden disabled={busy}/>
                <span>{busy ? "Import..." : "Choisir un fichier"}</span>
              </label>
            </div>
          </label>

          {form.imageUrl && (
            <div className="event-preview">
              <img src={form.imageUrl} alt="Prévisualisation" />
            </div>
          )}

          <label> Texte
            <textarea
              rows={4}
              value={form.text}
              onChange={(e) => handleChange("text", e.target.value)}
              required
            />
          </label>

          <label> Date & heure (ton fuseau)
            <input
              type="datetime-local"
              value={form.when}
              onChange={(e) => handleChange("when", e.target.value)}
              required
            />
          </label>

          <label> Durée de mise en avant (heures, max 48)
            <input
              type="number" min={1} max={48}
              value={form.hours}
              onChange={(e) => handleChange("hours", e.target.value)}
              required
            />
          </label>

          <button type="submit">Publier l’event</button>
        </form>
      )}

      <h3 style={{ marginTop: 16 }}>Événements en cours</h3>
      {!items.length ? (
        <p>Aucun événement actif.</p>
      ) : (
        <ul className="events__list">
          {items.map((ev) => (
            <li key={ev.id} className="events__item">
              {ev.imageUrl && <img src={ev.imageUrl} alt="" />}
              <div className="events__body">
                <h4>{ev.title}</h4>
                <p>{ev.text}</p>
                <small>Quand : {formatUTCForUser(ev.startAtUtc)} (ton heure locale)</small><br />
                <small>Expire le {formatUTCForUser(ev.expiresAt)}</small>
              </div>
              {(isAdmin || (user && user.id === ev.createdBy)) && (
                <button className="events__remove" onClick={() => del(ev)} title="Supprimer">✕</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function defaultLocalDatetime() {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}