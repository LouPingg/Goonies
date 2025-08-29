import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import MemberCard from "../components/MemberCard";
import "../styles/members.css"; // ton classeur (binder/pockets/pager)

const PAGE_SIZE = 9; // 3x3

export default function Members() {
  // champ de recherche tapé + requête "stabilisée" (debounce)
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1); // 1-based côté API
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Debounce 300ms sur la recherche
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(input.trim());
      setPage(1); // reset à la première page quand on change la recherche
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  // Chargement depuis l'API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/users", {
          params: { q, page, limit: PAGE_SIZE }
        });
        if (!alive) return;
        setData({
          items: data.items || [],
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.error || e.message || "Erreur réseau");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [q, page]);

  // Toujours 9 emplacements (slots) par page
  const pageItems = useMemo(() => {
    const arr = data.items || [];
    const pad = Math.max(0, PAGE_SIZE - arr.length);
    return [...arr, ...Array(pad).fill(null)];
  }, [data.items]);

  // Pagination
  const totalPages = Math.max(1, data.pages || 1);
  function prev() { setPage(p => (p - 1 < 1 ? totalPages : p - 1)); }
  function next() { setPage(p => (p + 1 > totalPages ? 1 : p + 1)); }
  function goto(i) { setPage(i); }

  return (
    <section className="page">
      <h2>Membres</h2>

      {/* Barre de recherche */}
      <div className="form" style={{ maxWidth: 520, marginBottom: 12 }}>
        <label>Rechercher un membre
          <input
            placeholder="Nom affiché ou @identifiant…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <p className="muted" style={{ margin: 0 }}>
          {loading ? "Chargement…" :
            data.total === 0 ? "Aucun résultat" :
            `${data.total} résultat${data.total > 1 ? "s" : ""} • Page ${data.page}/${totalPages}`}
        </p>
        {err && <p className="error" style={{ margin: 0 }}>{err}</p>}
      </div>

      {/* Classeur 3x3 */}
      {!loading && (
        <div className="binder">
          <div className="binder__ring" />
          <div className="binder__sheet">
            <div className="pockets">
              {pageItems.map((m, idx) =>
                m ? (
                  <div className="pocket" key={m._id || m.id}>
                    <div className="pocket__shine" />
                    <MemberCard member={{ ...m, id: m._id || m.id }} />
                  </div>
                ) : (
                  <div className="pocket pocket--empty" key={`empty-${idx}`}>
                    <div className="pocket__shine" />
                  </div>
                )
              )}
            </div>

            {/* Pagination */}
            <div className="pager">
              <button className="pager__arrow" onClick={prev} aria-label="Page précédente">◀</button>
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
              <button className="pager__arrow" onClick={next} aria-label="Page suivante">▶</button>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Chargement…</p>}
      {!loading && data.total === 0 && (
        <p style={{ marginTop: 12, opacity: 0.8 }}>Aucun membre pour le moment.</p>
      )}
    </section>
  );
}