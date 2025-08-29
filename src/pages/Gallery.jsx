import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addImage, listGallery, removeImage, updateImage } from "../lib/storage";
import "../styles/gallery.css";

export default function Gallery() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState(listGallery());
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      addImage({ dataUrl, caption, uploadedBy: user.id });
      setCaption("");
      setItems(listGallery());
      e.target.value = "";
    } finally {
      setBusy(false);
    }
  }

  function handleRemove(id, uploadedBy) {
    if (!user) return;
    if (isAdmin || user.id === uploadedBy) {
      removeImage(id);
      setItems(listGallery());
    } else {
      alert("Tu ne peux supprimer que tes images (ou être admin).");
    }
  }

  async function handleEditCaption(img) {
    if (!user) return;
    if (!(isAdmin || user.id === img.uploadedBy)) return;
    const next = prompt("Nouvelle légende :", img.caption || "");
    if (next === null) return;
    updateImage(img.id, { caption: next.trim() });
    setItems(listGallery());
  }

  return (
    <section className="page">
      <h2>Galerie</h2>

      {!user && <p className="muted">Connecte-toi pour ajouter des images.</p>}

      {user && (
        <div className="gallery__uploader">
          <label className="upload">
            <input type="file" accept="image/*" onChange={handleFile} hidden disabled={busy}/>
            <span>+ Ajouter une image</span>
          </label>
          <input
            className="caption"
            placeholder="Légende (prise au moment de l’upload)"
            value={caption}
            onChange={(e)=>setCaption(e.target.value)}
            disabled={busy}
          />
        </div>
      )}

      {!items.length ? (
        <p>Aucune image pour l’instant.</p>
      ) : (
        <div className="gallery">
          {items.map(img => {
            const canEdit = isAdmin || (user && user.id === img.uploadedBy);
            const text = img.caption || (canEdit ? "Ajouter une légende…" : "");
            return (
              <figure key={img.id} className="gallery__item">
                <img src={img.dataUrl} alt={img.caption || "Image de la galerie"} />
                <figcaption className="gallery__caption">
                  <span>{text}</span>
                  <span className="gallery__actions">
                    {canEdit && (
                      <button onClick={()=>handleEditCaption(img)} aria-label="Éditer" title="Éditer la légende">✎</button>
                    )}
                    {canEdit && (
                      <button onClick={()=>handleRemove(img.id, img.uploadedBy)} aria-label="Supprimer" title="Supprimer">✕</button>
                    )}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}