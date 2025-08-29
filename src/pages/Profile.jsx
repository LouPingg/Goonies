import { useAuth } from "../contexts/AuthContext";
import TagInput from "../components/TagInput";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  if (!user) return <p className="page">Non connecté.</p>;

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAndResizeImage(file, 512); // redimensionne à ~512px
    updateProfile({ avatarUrl: dataUrl });
  }

  return (
    <section className="page">
      <h2>Mon profil</h2>
      <form className="form" onSubmit={(e)=>{e.preventDefault(); alert("Profil mis à jour !");}}>
        <label> Pseudo affiché
          <input value={user.displayName} onChange={e=>updateProfile({ displayName: e.target.value })}/>
        </label>

        <div>
          <div style={{ marginBottom: 6 }}>Avatar (URL ou fichier)</div>

          {/* Ligne URL + Fichier + Preview */}
          <div className="avatar-row">
            <input
              className="avatar-url"
              placeholder="https://exemple.com/mon-avatar.jpg"
              value={user.avatarUrl?.startsWith("data:") ? "" : (user.avatarUrl || "")}
              onChange={(e)=>updateProfile({ avatarUrl: e.target.value })}
            />

            <label className="avatar-file">
              <input type="file" accept="image/*" hidden onChange={handleAvatarFile} />
              <span>Choisir un fichier</span>
            </label>

            <div className="avatar-preview" aria-label="Prévisualisation avatar">
              <img src={user.avatarUrl || "/logo.png"} alt="" />
            </div>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 6 }}>Titres (tags)</div>
          <TagInput value={user.titles} onChange={(titles)=>updateProfile({ titles })}/>
        </div>

        <button type="submit">Enregistrer</button>
        <button type="button" onClick={logout}>Se déconnecter</button>
      </form>
    </section>
  );
}

/* --- Helpers image --- */
function readAndResizeImage(file, max = 512) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        // calcule une taille max tout en gardant le ratio
        let { width: w, height: h } = img;
        if (w > h) {
          if (w > max) { h = Math.round(h * (max / w)); w = max; }
        } else {
          if (h > max) { w = Math.round(w * (max / h)); h = max; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        // JPEG compresse bien; tu peux changer en "image/png" si tu préfères
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
