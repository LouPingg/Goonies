import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { localDateTimeToUTCISO, formatLocal } from "../lib/time.js";

export default function Events() {
  const { user, isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(24);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/events");
        setList(data || []);
      } catch (e) { setErr(msg(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim()) return setErr("Titre requis");
    if (!date || !time) return setErr("Date et heure requises");
    if (!imageUrl.trim() && !file) return setErr("Image requise (URL ou fichier)");

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    fd.append("startAt", localDateTimeToUTCISO(date, time)); // UTC
    fd.append("durationHours", String(duration));
    if (imageUrl.trim()) fd.append("imageUrl", imageUrl.trim());
    if (file) fd.append("file", file);

    try {
      setBusy(true);
      const { data } = await api.post("/events", fd);
      setList((cur) => [data, ...cur]);
      setTitle(""); setDescription(""); setImageUrl(""); setFile(null); setDate(""); setTime(""); setDuration(24);
      e.target.reset();
    } catch (e) { setErr(msg(e)); }
    finally { setBusy(false); }
  }

  async function remove(ev) {
    const owner = user && (ev.createdBy === user._id || ev.createdBy === user.id);
    if (!owner && !isAdmin) return;
    if (!confirm("Supprimer cet évènement ?")) return;
    try {
      await api.delete(`/events/${ev._id || ev.id}`);
      setList((cur) => cur.filter((x) => (x._id || x.id) !== (ev._id || ev.id)));
    } catch (e) { setErr(msg(e)); }
  }

  return (
    <section className="page">
      <h2>Évènements</h2>
      {err && <p className="error">{err}</p>}

      {user && (
        <form className="form" onSubmit={onSubmit} noValidate encType="multipart/form-data">
          <label>Titre<input value={title} onChange={(e)=>setTitle(e.target.value)} /></label>
          <label>Description<textarea rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <label>Date<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></label>
            <label>Heure<input type="time" value={time} onChange={(e)=>setTime(e.target.value)} /></label>
            <label>Durée (1–48h)<input type="number" min={1} max={48} value={duration} onChange={(e)=>setDuration(Number(e.target.value))} /></label>
          </div>
          <label>Image (URL)
            <input placeholder="https://…" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
          </label>
          <label>Ou fichier
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </label>
          <button disabled={busy}>Publier</button>
        </form>
      )}

      {loading ? <p>Chargement…</p> : list.length === 0 ? <p>Aucun évènement.</p> : (
        <ul className="grid" style={{ marginTop: 16 }}>
          {list.map((ev) => (
            <li key={ev._id || ev.id} className="card">
              <div className="card__frame">
                {ev.imageUrl
                  ? <img src={ev.imageUrl} alt={ev.title} className="card__img" loading="lazy" />
                  : <div className="card__placeholder">Pas d’image</div>}
              </div>
              <div className="card__body">
                <h3 className="card__title" style={{ marginBottom: 6 }}>{ev.title}</h3>
                <p className="card__subtitle" style={{ marginBottom: 6 }}>
                  {formatLocal(ev.startAt)} → {formatLocal(ev.endAt)}
                </p>
                {ev.description && <p style={{ opacity: .9 }}>{ev.description}</p>}
                {(isAdmin || (user && (ev.createdBy === user._id || ev.createdBy === user.id))) && (
                  <button style={{ marginTop: 8 }} onClick={() => remove(ev)}>Supprimer</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function msg(e) { return e?.response?.data?.error || e.message || "Erreur réseau"; }