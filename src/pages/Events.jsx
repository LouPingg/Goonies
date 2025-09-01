import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api";
import CatButton from "../components/CatButton";
import EventCard from "../components/EventCard";
import "../styles/events.css";

export default function Events() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [durationHours, setDurationHours] = useState(24);
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/events");
        if (!alive) return;
        setItems(data || []);
      } catch (e) {
        if (!alive) return;
        setErr(msg(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) return;

    if (!title.trim())            return setErr("Title is required.");
    if (!startAt.trim())          return setErr("Start date/time is required.");
    if (!file && !imageUrl.trim()) return setErr("Image required (URL or file).");

    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", (description || "").trim());
      fd.append("startAt", new Date(startAt).toISOString());
      fd.append("durationHours", String(durationHours || 24));
      if (imageUrl.trim()) fd.append("imageUrl", imageUrl.trim());
      if (file) fd.append("file", file);

      const { data } = await api.post("/events", fd);
      setItems((cur) => [data, ...cur]);

      setTitle(""); setDescription(""); setStartAt("");
      setDurationHours(24); setImageUrl(""); setFile(null);
      setOpen(false);
    } catch (e) {
      setErr(msg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(ev) {
    const isOwner = user && (ev.createdBy === user._id || ev.createdBy === user.id);
    if (!isOwner && !isAdmin) return alert("You can only delete your own events (or be admin).");
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${ev._id || ev.id}`);
      setItems((cur) => cur.filter((x) => (x._id || x.id) !== (ev._id || ev.id)));
    } catch (e) {
      setErr(msg(e));
    }
  }

  return (
    <section className="page page--events">
      <div className="page-header">
        <h2>Events</h2>
        {user && <CatButton variant="add" label="Add" onClick={() => setOpen(true)} size={80} showLabel />}
      </div>

      {err && <p className="error">{err}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul className="events-list">
          {items.map((ev) => {
            const isOwner = user && (ev.createdBy === user._id || ev.createdBy === user.id);
            const canDelete = isAdmin || isOwner;
            return (
              <li key={ev._id || ev.id} className="events-list__item">
                <EventCard ev={ev} canDelete={canDelete} onDelete={remove} />
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Create an event">
          <div className="modal__backdrop" onClick={() => !busy && setOpen(false)} />
          <div className="modal__panel">
            <div className="modal__tools">
              <CatButton
                variant="cancel"
                label="Cancel"
                onClick={() => !busy && setOpen(false)}
                size={64}
                showLabel
              />
              <div style={{ flex: 1 }} />
              <CatButton
                variant="confirm"
                label="Create"
                type="submit"
                size={64}
                showLabel
                className="modal__submit-proxy"
                onClick={() => {
                  const form = document.getElementById("eventForm");
                  if (form && !busy) form.requestSubmit();
                }}
              />
            </div>

            <form
              id="eventForm"
              className="form modal__form form--grid"
              onSubmit={onSubmit}
              encType="multipart/form-data"
              noValidate
            >
              <label>
                <span>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} required placeholder="Event title" />
              </label>

              <label>
                <span>Description (optional)</span>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} placeholder="A short description…" />
              </label>

              <label>
                <span>Start date/time</span>
                <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} disabled={busy} required />
              </label>

              <label>
                <span>Duration (hours)</span>
                <input type="number" min={1} max={48} value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value || 24))} disabled={busy} />
              </label>

              <label>
                <span>Image (URL)</span>
                <input placeholder="https://…" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={busy} />
              </label>

              <label>
                <span>Or file</span>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={busy} />
              </label>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function msg(e) {
  return e?.response?.data?.error || e.message || "Network error";
}