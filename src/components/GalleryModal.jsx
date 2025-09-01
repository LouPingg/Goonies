import { useEffect, useRef, useState } from "react";
import api from "../lib/api";

export default function GalleryModal({ open, onClose, onCreated }) {
  const dialogRef = useRef(null);
  const [tab, setTab] = useState("file"); // "file" | "url"
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) d.showModal(); else d.close();
  }, [open]);

  function reset() {
    setTab("file"); setFile(null); setUrl(""); setCaption(""); setErr("");
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (tab === "file") {
        if (!file) { setErr("Choose a file"); return; }
        const fd = new FormData();
        fd.append("file", file);
        if (caption.trim()) fd.append("caption", caption.trim());
        const { data } = await api.post("/gallery", fd);
        onCreated?.(data);
      } else {
        if (!url.trim()) { setErr("Enter an image URL"); return; }
        const { data } = await api.post("/gallery", { url: url.trim(), caption });
        onCreated?.(data);
      }
      reset();
      onClose?.();
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="modal">
      <form method="dialog" style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={onClose} aria-label="Close">✕</button>
      </form>

      <form onSubmit={submit} style={{ display:"grid", gap:12, minWidth:320 }}>
        <h3>Add an image</h3>

        <div style={{ display:"flex", gap:6 }}>
          <button type="button" onClick={()=>setTab("file")} aria-pressed={tab==="file"}>File</button>
          <button type="button" onClick={()=>setTab("url")}  aria-pressed={tab==="url"}>URL</button>
        </div>

        {tab === "file" ? (
          <label>File
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
          </label>
        ) : (
          <label>URL
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…" />
          </label>
        )}

        <label>Caption (optional)
          <input value={caption} onChange={e=>setCaption(e.target.value)} maxLength={140} />
        </label>

        {err && <p className="error">{err}</p>}

        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" disabled={busy}>{busy ? "Uploading…" : "Add"}</button>
        </div>
      </form>
    </dialog>
  );
}