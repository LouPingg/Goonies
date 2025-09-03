import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import "../styles/members.css";

const PAGE_SIZE = 9; 

export default function Members() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/users", { params: { q, page, limit: PAGE_SIZE } });
        if (!alive) return;
        setData({
          items: data.items || [],
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.error || e.message || "Network error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [q, page]);

  const pageItems = useMemo(() => {
    const arr = data.items || [];
    const pad = Math.max(0, PAGE_SIZE - arr.length);
    return [...arr, ...Array(pad).fill(null)];
  }, [data.items]);

  const totalPages = Math.max(1, data.pages || 1);
  const prev = () => setPage(p => (p - 1 < 1 ? totalPages : p - 1));
  const next = () => setPage(p => (p + 1 > totalPages ? 1 : p + 1));
  const goto = (i) => setPage(i);

  const API = import.meta.env.VITE_API_URL;

  return (
    <section className="page">
      <div className="members_header">
        <h2>Members</h2>

        <div className="form" style={{ maxWidth: 520, marginBottom: 12 }}>
          <label>Search a member
            <input
              placeholder="Display name or @username…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <p className="muted">
            {loading ? "Loading…" :
              data.total === 0 ? "No results" :
              `${data.total} result${data.total > 1 ? "s" : ""} • Page ${data.page}/${totalPages}`}
          </p>
          {err && <p className="error">{err}</p>}
        </div>
      </div>

      {!loading && (
        <div className="binder">
          <div className="binder__ring" />
          <div className="binder__sheet">
            <div className="pockets">
              {pageItems.map((m, idx) =>
                m ? (
                  <div className="pocket" key={m._id || m.id}>
                    <div className="pocket__shine" />
                    <div
                      className="card"
                      style={{ cursor: "zoom-in" }}
                      onClick={() => setZoom(m)}
                    >
                      <img
                        src={`${API}/cards/${m._id || m.id}.png?w=600`}
                        alt={m.displayName || m.username}
                        className="card__img"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pocket pocket--empty" key={`empty-${idx}`}>
                    <div className="pocket__shine" />
                  </div>
                )
              )}
            </div>

            <div className="pager">
              <button className="pager__arrow" onClick={prev} aria-label="Previous page">◀</button>
              <ul className="pager__dots" role="tablist" aria-label="Pages">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <li
                    key={i}
                    role="tab"
                    aria-selected={i + 1 === data.page}
                    className={`pager__dot ${i + 1 === data.page ? "is-active" : ""}`}
                    onClick={() => goto(i + 1)}
                    title={`Page ${i + 1}`}
                  />
                ))}
              </ul>
              <button className="pager__arrow" onClick={next} aria-label="Next page">▶</button>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Loading…</p>}
      {!loading && data.total === 0 && (
        <p className="muted">No members yet.</p>
      )}

      {zoom && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
        >
          <button className="lightbox__close" aria-label="Close" onClick={() => setZoom(null)}>✕</button>
          <figure className="lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${API}/cards/${zoom._id || zoom.id}.png?w=900`}
              alt={zoom.displayName || zoom.username}
              className="lightbox__img"
              loading="eager"
              decoding="sync"
            />
          </figure>
        </div>
      )}
    </section>
  );
}