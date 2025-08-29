import { useEffect, useRef, useState } from "react";
import { listMembers } from "../lib/storage";
import MemberCard from "../components/MemberCard";
import "../styles/members.css";

const PAGE_SIZE = 9; // 3x3

export default function Members() {
  const members = listMembers();
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));

  // Toujours garder "page" dans les bornes si la liste change
  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [members.length, totalPages, page]);

  const start = page * PAGE_SIZE;
  const paged = members.slice(start, start + PAGE_SIZE);

  // Navigation
  function prev() { setPage((p) => (p - 1 + totalPages) % totalPages); }
  function next() { setPage((p) => (p + 1) % totalPages); }
  function goto(i) { setPage(i); }

  // Clavier (← →)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages]);

  // Swipe (simple)
  const swipeStartX = useRef(null);
  function onPointerDown(e) { swipeStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? null; }
  function onPointerUp(e) {
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? null;
    if (swipeStartX.current == null || endX == null) return;
    const delta = endX - swipeStartX.current;
    if (Math.abs(delta) > 50) { delta < 0 ? next() : prev(); }
    swipeStartX.current = null;
  }

  return (
    <section className="page">
      <h2>Collection de cartes</h2>

      {!members.length ? (
        <p>Aucun membre pour l’instant.</p>
      ) : (
        <div className="binder" onPointerDown={onPointerDown} onPointerUp={onPointerUp}
             onTouchStart={onPointerDown} onTouchEnd={onPointerUp}>
          <div className="binder__ring"></div>

          <div className="binder__sheet">
            <div className="pockets">
              {paged.map((m) => (
                <div key={m.id} className="pocket">
                  <div className="pocket__shine"></div>
                  <MemberCard member={m} />
                </div>
              ))}
              {/* Si la dernière page n'a pas 9 éléments, on complète avec des "pochettes vides" pour garder 3x3 */}
              {Array.from({ length: Math.max(0, PAGE_SIZE - paged.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="pocket pocket--empty" aria-hidden="true" />
              ))}
            </div>
          </div>

          {/* Contrôles du slider */}
          <div className="pager" role="navigation" aria-label="Pagination des cartes">
            <button className="pager__arrow" onClick={prev} aria-label="Page précédente">◀</button>
            <ul className="pager__dots" role="tablist">
              {Array.from({ length: totalPages }).map((_, i) => (
                <li key={i} role="presentation">
                  <button
                    role="tab"
                    aria-selected={i === page}
                    className={`pager__dot ${i === page ? "is-active" : ""}`}
                    onClick={() => goto(i)}
                  />
                </li>
              ))}
            </ul>
            <button className="pager__arrow" onClick={next} aria-label="Page suivante">▶</button>
          </div>
        </div>
      )}
    </section>
  );
}