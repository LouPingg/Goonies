// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TagInput from "../components/TagInput";
import MemberCard from "../components/MemberCard";
import api from "../lib/api";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  // Snapshot des valeurs serveur pour pouvoir annuler
  const [serverUser, setServerUser] = useState(user || null);

  // États éditables
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [titles, setTitles] = useState(Array.isArray(user?.titles) ? user.titles : []);

  // Fichier local + preview
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  // UI
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Quand le contexte user change (ex: après reload), resynchroniser le snapshot serveur
  useEffect(() => {
    if (!user) return;
    setServerUser(user);
    setDisplayName(user.displayName || "");
    setAvatarUrl(user.avatarUrl || "");
    setTitles(Array.isArray(user.titles) ? user.titles : []);
    setFile(null);
    setFilePreview("");
  }, [user]);

  // Gérer l'URL de preview du fichier
  useEffect(() => {
    if (!file) { setFilePreview(""); return; }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Données “live” pour l’aperçu de la carte
  const previewMember = useMemo(() => ({
    ...(serverUser || {}),
    displayName: displayName || serverUser?.displayName || serverUser?.username,
    avatarUrl: filePreview || avatarUrl || "",
    titles: titles || [],
  }), [serverUser, displayName, avatarUrl, filePreview, titles]);

  // Détection de modifications
  function normTitles(a = []) { return a.filter(Boolean).map(s => s.trim()).join("|"); }
  const isDirty =
    (displayName !== (serverUser?.displayName || "")) ||
    (avatarUrl !== (serverUser?.avatarUrl || "")) ||
    (normTitles(titles) !== normTitles(serverUser?.titles || [])) ||
    !!file;

  if (!user) {
    return <section className="page"><p>Connecte-toi pour voir ton profil.</p></section>;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!isDirty) return;
    setErr(""); setOk(""); setBusy(true);
    try {
      let me;
      if (file || avatarUrl.trim()) {
        // PATCH multipart (fichier et/ou URL)
        const fd = new FormData();
        if (displayName.trim()) fd.append("displayName", displayName.trim());
        if (avatarUrl.trim())  fd.append("avatarUrl", avatarUrl.trim());
        if (file)              fd.append("file", file);
        if (titles?.length)    fd.append("titles", JSON.stringify(titles));
        const { data } = await api.patch("/users/me", fd);
        me = data;
      } else {
        // PATCH JSON “léger”
        me = await updateProfile({
          displayName: displayName.trim() || undefined,
          titles,
        });
      }

      // Resynchroniser le snapshot serveur + états
      setServerUser(me);
      setDisplayName(me.displayName || "");
      setAvatarUrl(me.avatarUrl || "");
      setTitles(Array.isArray(me.titles) ? me.titles : []);
      setFile(null);
      setFilePreview("");
      setOk("Profil mis à jour.");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Erreur");
    } finally {
      setBusy(false);
    }
  }

  function onCancel() {
    if (!serverUser) return;
    setDisplayName(serverUser.displayName || "");
    setAvatarUrl(serverUser.avatarUrl || "");
    setTitles(Array.isArray(serverUser.titles) ? serverUser.titles : []);
    setFile(null);
    setFilePreview("");
    setErr(""); setOk("");
  }

  return (
    <section className="page">
      <h2>Mon profil</h2>
      {err && <p className="error">{err}</p>}
      {ok && <p style={{ color: "#8fda8f" }}>{ok}</p>}

      {/* 2 colonnes : formulaire / aperçu */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(260px, 340px)", gap: 16, alignItems: "start" }}>
        {/* Form */}
        <form className="form" onSubmit={onSubmit} encType="multipart/form-data" noValidate>
          <label>Nom affiché
            <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} disabled={busy} />
          </label>

          <div style={{ display: "grid", gap: 8 }}>
            <label>URL avatar (optionnel)
              <input
                placeholder="https://…"
                value={avatarUrl}
                onChange={(e)=>setAvatarUrl(e.target.value)}
                disabled={busy}
              />
            </label>

            <label>Ou fichier (optionnel)
              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setFile(e.target.files?.[0] || null)}
                disabled={busy}
              />
            </label>
          </div>

          <div>
            <label>Mes titres (tags)</label>
            <TagInput value={titles} onChange={setTitles} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={busy || !isDirty}>Enregistrer</button>
            <button type="button" onClick={onCancel} disabled={busy || !isDirty} className="btn-secondary">
              Annuler les changements
            </button>
          </div>

          <p className="muted" style={{ margin: 0, opacity: .75 }}>
            L’aperçu à droite se met à jour en direct. “Annuler” rétablit les valeurs actuelles du serveur.
          </p>
        </form>

        {/* Aperçu live */}
        <div>
          <h3 style={{ margin: "0 0 8px" }}>Aperçu</h3>
          <div className="pocket">
            <div className="pocket__shine" />
            <MemberCard member={previewMember} />
          </div>
        </div>
      </div>
    </section>
  );
}