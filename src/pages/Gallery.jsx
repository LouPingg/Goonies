import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api";
import CatButton from "../components/CatButton";
import "../styles/gallery.css";

export default function Gallery() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const [zoom, setZoom] = useState(null); // { url, caption, _id/id }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/gallery");
        if (!alive) return;
        setItems(data || []);
      } catch (e) {
        if (!alive) return;
        setErr(msg(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) { setErr("Sign in to post an image."); return; }
    if (!file && !url.trim()) { setErr("Pick a file or enter a URL."); return; }

    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (url.trim()) fd.append("url", url.trim());
      if (caption.trim()) fd.append("caption", caption.trim());

      const { data } = await api.post("/gallery", fd);
      setItems((cur) => [data, ...cur]);
      setUrl(""); setFile(null); setCaption("");
      setOpen(false);
    } catch (e) {
      setErr(msg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!user) return;
    const isOwner = item.uploadedBy === user._id || item.uploadedBy === user.id;
    if (!isOwner && !isAdmin) return alert("You can only delete your images (or be admin).");
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/gallery/${item._id || item.id}`);
      setItems((cur) => cur.filter((x) => (x._id || x.id) !== (item._id || item.id)));
      if (zoom && (zoom._id === item._id || zoom.id === item.id)) setZoom(null);
    } catch (e) {
      setErr(msg(e));
    }
  }

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => { if (e.key === "Escape") setZoom(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  return (
    <section className="page">
      <div className="page-header">
        <h2>Gallery</h2>
        {user && <CatButton variant="add" label="Add" onClick={() => setOpen(true)} size={80} showLabel />}
      </div>

      {err && <p className="error">{err}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No images yet.</p>
      ) : (
        <ul className="gallery-grid gallery-grid--fixed4">
          {items.map((it) => {
            const isOwner = user && (it.uploadedBy === user._id || it.uploadedBy === user.id);
            const canDelete = isAdmin || isOwner;

            return (
              <li key={it._id || it.id} className="card gallery-card">
                {canDelete && (
                  <div className="card__action card__action--delete" title="Delete">
                    <CatButton variant="delete" size={60} onClick={() => remove(it)} />
                  </div>
                )}

                <div
                  className="card__frame"
                  role="button"
                  tabIndex={0}
                  onClick={() => setZoom(it)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setZoom(it)}
                  aria-label="Open image"
                >
                  <img
                    src={it.url}
                    alt={it.caption || ""}
                    className="card__img"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const box = document.createElement("div");
                      box.className = "card__placeholder";
                      box.textContent = "Image unavailable";
                      el.parentElement.appendChild(box);
                    }}
                  />
                </div>

                <div className="card__body">
                  <p className="card__subtitle">{it.caption}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ADD MODAL */}
      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Add an image">
          <div className="modal__backdrop" onClick={() => !busy && setOpen(false)} />
          <div className="modal__panel">
            <div className="modal__tools">
              <CatButton variant="cancel" label="Cancel" onClick={() => !busy && setOpen(false)} size={64} showLabel />
              <div style={{ flex: 1 }} />
              <CatButton
                variant="confirm"
                label="Publish"
                type="submit"
                size={64}
                showLabel
                className="modal__submit-proxy"
                onClick={() => {
                  const form = document.getElementById("galleryForm");
                  if (form && !busy) form.requestSubmit();
                }}
              />
            </div>

            <form
              id="galleryForm"
              className="form modal__form form--grid"
              onSubmit={onSubmit}
              encType="multipart/form-data"
              noValidate
            >
              <label>Image URL (optional)
                <input
                  className="event-url"
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={busy}
                />
              </label>

              <label>File (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={busy}
                />
              </label>

              <label>Caption (optional)
                <input value={caption} onChange={(e) => setCaption(e.target.value)} disabled={busy} />
              </label>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {zoom && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={() => setZoom(null)}
        >
          <button className="lightbox__close" aria-label="Close" onClick={() => setZoom(null)}>✕</button>
          <figure className="lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoom.url}
              alt={zoom.caption || "Image"}
              className="lightbox__img"
              loading="eager"
              decoding="sync"
            />
            {zoom.caption ? (
              <figcaption className="lightbox__caption">{zoom.caption}</figcaption>
            ) : null}
          </figure>
        </div>
      )}
    </section>
  );
}

function msg(e) {
  return e?.response?.data?.error || e.message || "Network error";
}