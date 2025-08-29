import { useAuth } from "../contexts/AuthContext";
import { getActiveFeaturedEvent, removeEvent } from "../lib/storage";
import { formatUTCForUser } from "../lib/time";
import "../styles/home.css";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const ev = getActiveFeaturedEvent();
  const canRemove = ev && user && (isAdmin || ev.createdBy === user.id);

  function del() {
    if (!ev) return;
    removeEvent(ev.id);
    // simple refresh pour refléter la suppression
    window.location.reload();
  }

  return (
    <section className="home">
      {ev ? (
        <div className="featured">
          {ev.imageUrl && <img src={ev.imageUrl} alt="" className="featured__img" />}
          <div className="featured__body">
            <h3 className="featured__title">{ev.title}</h3>
            <p className="featured__text">{ev.text}</p>
            <p className="featured__meta">
              Quand : {formatUTCForUser(ev.startAtUtc)} • Expire : {formatUTCForUser(ev.expiresAt)}
            </p>
            {canRemove && (
              <button className="featured__remove" onClick={del}>Supprimer</button>
            )}
          </div>
        </div>
      ) : (
        <p className="muted" style={{textAlign:"center"}}>
          Aucun event à la une pour le moment.
        </p>
      )}
    </section>
  );
}