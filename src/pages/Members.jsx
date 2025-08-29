import { useEffect, useState } from "react";
import api from "../lib/api";
import MemberCard from "../components/MemberCard";
import "../styles/members.css"; // ton CSS du classeur

const PAGE_SIZE = 9; // 3x3

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users"); // ← API, pas localStorage
        if (!alive) return;
        setMembers(data || []);
        setPage(0); // reset page si liste change
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * PAGE_SIZE;
  const slice = members.slice(start, start + PAGE_SIZE);
  const pad = Math.max(0, PAGE_SIZE - slice.length);
  const pageItems = [...slice, ...Array(pad).fill(null)];

  function prev() { setPage(p => (p - 1 + totalPages) % totalPages); }
  function next() { setPage(p => (p + 1) % totalPages); }
  function goto(i) { setPage(i); }

  return (
    <section className="page">
      <h2>Membres</h2>

      {loading && <p>Chargement…</p>}
      {err && <p className="error">{err}</p>}

      {!loading && (
        <div className="binder">
          <div className="binder__ring" />
          <div className="binder__sheet">
            <div className="pockets">
              {pageItems.map((m, idx) =>
                m ? (
                  <div className="pocket" key={m._id || m.id}>
                    <div className="pocket__shine" />
                    {/* Compat: MemberCard attend peut-être `id` → on mappe _id vers id */}
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
                    aria-selected={i === clampedPage}
                    className={`pager__dot ${i === clampedPage ? "is-active" : ""}`}
                    onClick={() => goto(i)}
                    title={`Page ${i + 1}`}
                  />
                ))}
              </ul>
              <button className="pager__arrow" onClick={next} aria-label="Page suivante">▶</button>
            </div>
          </div>
        </div>
      )}

      {!loading && members.length === 0 && (
        <p style={{ marginTop: 12, opacity: 0.8 }}>Aucun membre pour le moment.</p>
      )}
    </section>
  );
}