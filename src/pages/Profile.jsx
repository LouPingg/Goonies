// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TagInput from "../components/TagInput";
import CatButton from "../components/CatButton";
import api from "../lib/api";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  // Server snapshot
  const [serverUser, setServerUser] = useState(user || null);

  // Editable state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl,   setAvatarUrl]   = useState(user?.avatarUrl   || "");
  const [titles,      setTitles]      = useState(Array.isArray(user?.titles) ? user.titles : []);
  const [bio,         setBio]         = useState(user?.bio || "");
  const [cardTheme,   setCardTheme]   = useState(user?.cardTheme || "yellow");

  // File + local preview + temporary Cloudinary URL
  const [file, setFile]               = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [tempAvatar, setTempAvatar]   = useState("");

  // UI
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const [ok,   setOk]   = useState("");

  // sync user -> local state
  useEffect(() => {
    if (!user) return;
    setServerUser(user);
    setDisplayName(user.displayName || "");
    setAvatarUrl(user.avatarUrl || "");
    setTitles(Array.isArray(user.titles) ? user.titles : []);
    setBio(user.bio || "");
    setCardTheme(user.cardTheme || "yellow");
    setFile(null);
    setFilePreview("");
    setTempAvatar("");
  }, [user]);

  // local blob preview
  useEffect(() => {
    if (!file) { setFilePreview(""); return; }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function normTitles(a = []) { return a.filter(Boolean).map(s => s.trim()).join("|"); }
  const isDirty =
    (displayName !== (serverUser?.displayName || "")) ||
    (avatarUrl   !== (serverUser?.avatarUrl   || "")) ||
    (normTitles(titles) !== normTitles(serverUser?.titles || [])) ||
    (bio        !== (serverUser?.bio        || "")) ||
    (cardTheme  !== (serverUser?.cardTheme  || "yellow")) ||
    !!file;

  if (!user) return <section className="page"><p>Please sign in to view your profile.</p></section>;

  async function onSubmit(e) {
    e.preventDefault();
    if (!isDirty) return;
    setErr(""); setOk(""); setBusy(true);
    try {
      let me;
      if (file || avatarUrl.trim()) {
        const fd = new FormData();
        if (displayName.trim()) fd.append("displayName", displayName.trim());
        if (avatarUrl.trim())   fd.append("avatarUrl",   avatarUrl.trim());
        if (file)               fd.append("file",        file);
        if (titles?.length)     fd.append("titles", JSON.stringify(titles));
        fd.append("bio",        bio || "");
        fd.append("cardTheme",  cardTheme || "yellow");
        const { data } = await api.patch("/users/me", fd);
        me = data;
      } else {
        me = await updateProfile({
          displayName: displayName.trim() || undefined,
          titles, bio, cardTheme,
        });
      }
      setServerUser(me);
      setDisplayName(me.displayName || "");
      setAvatarUrl(me.avatarUrl || "");
      setTitles(Array.isArray(me.titles) ? me.titles : []);
      setBio(me.bio || "");
      setCardTheme(me.cardTheme || "yellow");
      setFile(null); setFilePreview(""); setTempAvatar("");
      setOk("Profile updated.");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  function onCancel() {
    if (!serverUser) return;
    setDisplayName(serverUser.displayName || "");
    setAvatarUrl(serverUser.avatarUrl || "");
    setTitles(Array.isArray(serverUser.titles) ? serverUser.titles : []);
    setBio(serverUser.bio || "");
    setCardTheme(serverUser.cardTheme || "yellow");
    setFile(null); setFilePreview(""); setTempAvatar("");
    setErr(""); setOk("");
  }

  // Live preview
  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("theme", cardTheme || "yellow");
    if ((displayName || "").trim()) params.set("name", displayName.trim());
    if ((bio || "").trim())         params.set("bio", bio.trim());
    (titles || []).filter(Boolean).forEach(t => params.append("tag", t));
    const art =
      (tempAvatar && tempAvatar.trim()) ||
      (filePreview && filePreview.trim()) ||
      (avatarUrl && avatarUrl.trim());
    if (art) params.set("avatar", art);
    params.set("w", "600");
    params.set("v", String(Date.now()).slice(-8));
    return `${API}/cards/preview.png?${params.toString()}`;
  }, [displayName, bio, titles, cardTheme, avatarUrl, filePreview, tempAvatar]);

  return (
    <section className="page page--profile">
      <h2 className="profile__title">My profile</h2>
      {err && <p className="error">{err}</p>}
      {ok && <p className="profile__ok">{ok}</p>}

      <div className="profile-grid">
        {/* Formulaire 2 colonnes */}
        <form className="form form--grid" onSubmit={onSubmit} encType="multipart/form-data" noValidate>
          <label>Display name
            <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} disabled={busy} />
          </label>

          <label>Avatar URL (optional)
            <input
              placeholder="https://…"
              value={avatarUrl}
              onChange={(e)=>setAvatarUrl(e.target.value)}
              disabled={busy}
            />
          </label>

          <label>Or file (optional)
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setOk(""); setErr("");
                setTempAvatar("");
                if (!f) return;
                try {
                  const fd = new FormData();
                  fd.append("file", f);
                  const { data } = await api.post("/cards/preview-upload", fd);
                  setTempAvatar(data?.url || "");
                } catch (err) {
                  setTempAvatar("");
                  setErr(err?.response?.data?.error || err.message || "Preview upload failed");
                }
              }}
              disabled={busy}
            />
          </label>

          <label>Bio
            <textarea
              rows={4}
              value={bio}
              onChange={(e)=>setBio(e.target.value)}
              placeholder="A few words about you…"
              disabled={busy}
            />
          </label>

          <div className="field">
            <label>My titles (tags)</label>
            <div className="field__control">
              <TagInput value={titles} onChange={setTitles} />
            </div>
          </div>

          <div className="field">
            <label>Card theme</label>
            <div className="field__control profile__themes">
              {["yellow","blue","green","red"].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={()=>setCardTheme(k)}
                  className={`theme-btn theme--${k}`}
                  aria-pressed={cardTheme === k}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="field profile-actions">
            <label aria-hidden="true" />
            <div className="field__control">
              <CatButton
                variant="save"
                label="Save"
                type="submit"
                className="catbtn--s-84"
                showLabel
                disabled={busy || !isDirty}
              />
              <CatButton
                variant="cancel"
                label="Cancel"
                className="catbtn--s-84"
                onClick={onCancel}
                showLabel
                disabled={busy || !isDirty}
              />
            </div>
          </div>
        </form>

        {/* Aperçu live */}
        <div className="profile-preview">
          <h3 className="profile-preview__title">Preview</h3>
          <div className="profile-preview__card">
            <img
              src={previewUrl}
              alt="Card preview"
              className="profile-preview__img"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}