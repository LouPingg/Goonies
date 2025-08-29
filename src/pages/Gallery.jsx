import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api";
import "../styles/gallery.css"; // optionnel

export default function Gallery() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Form
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/gallery");
        setItems(data || []);
      } catch (e) {
        setErr(msg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) { setErr("Connecte-toi pour publier une image."); return; }
    if (!file && !url.trim()) { setErr("Choisis un fichier ou entre une URL."); return; }

    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (url.trim()) fd.append("url", url.trim());
      if (caption.trim()) fd.append("caption", caption.trim());

      const { data } = await api.post("/gallery", fd);
      setItems((cur) => [data, ...cur]);
      // reset
      setUrl(""); setFile(null); setCaption("");
      e.target.reset();
    } catch (e) {
      setErr(msg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!user) return;
    const isOwner = item.uploadedBy === user._id || item.uploadedBy === user.id;
    if (!isOwner && !isAdmin) return alert("Tu ne peux supprimer que tes images (ou être admin).");
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await api.delete(`/gallery/${item._id || item.id}`);
      setItems((cur) => cur.filter((x) => (x._id || x.id) !== (item._id || item.id)));
    } catch (e) {
      setErr(msg(e));
    }
  }

  return (
    <section className="page">
      <h2>Galerie</h2>
      {err && <p className="error" style={{ marginBottom: 8 }}>{err}</p>}

      {user && (
        <form className="form" onSubmit={onSubmit} encType="multipart/form-data" noValidate>
          <label>URL (optionnel)
            <input
              className="event-url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
            />
          </label>

          <label>Fichier (optionnel)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
            />
          </label>

          <label>Légende (optionnel)
            <input value={caption} onChange={(e) => setCaption(e.target.value)} disabled={busy} />
          </label>

          <button disabled={busy}>Publier</button>
        </form>
      )}

      {loading ? (
        <p>Chargement…</p>
      ) : items.length === 0 ? (
        <p>Aucune image pour le moment.</p>
      ) : (
        <ul className="grid" style={{ marginTop: 16 }}>
          {items.map((it) => (
            <li key={it._id || it.id} className="card">
              <div className="card__frame">
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
    box.textContent = "Image indisponible";
    box.style.cssText = `
      width:100%;height:100%;display:grid;place-items:center;
      font-size:12px;color:#6d7a8a;background:#0b1016;border:1px dashed #2a303a;
    `;
    el.parentElement.appendChild(box);
    console.warn("Image failed to load:", it.url);
  }}
/>
</div>
              <div className="card__body">
                <p className="card__subtitle" style={{ margin: 0 }}>{it.caption}</p>
                {(isAdmin || (user && (it.uploadedBy === user._id || it.uploadedBy === user.id))) && (
                  <button style={{ marginTop: 8 }} onClick={() => remove(it)}>Supprimer</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function msg(e) {
  return e?.response?.data?.error || e.message || "Erreur réseau";
}