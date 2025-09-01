// src/components/EventCard.jsx
import CatButton from "./CatButton";
import { formatUTCForUser } from "../lib/time";

export default function EventCard({ ev, canDelete = false, onDelete }) {
  const start = formatUTCForUser(ev.startAt);
  const end   = formatUTCForUser(ev.endAt);

  return (
    <div className="featured">
      {ev.imageUrl ? (
        <img
          src={ev.imageUrl}
          alt={ev.title}
          className="featured__img"
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <div className="featured__body">
        <h3 className="featured__title">{ev.title}</h3>

        {(ev.description || ev.text) && (
          <p className="featured__text">{ev.description || ev.text}</p>
        )}

        <p className="featured__meta">
          {start} → {end}
        </p>

        {canDelete && (
          <div className="row gap-8">
            <CatButton
              variant="delete"
              size={72}
              label="Delete"
              onClick={() => onDelete?.(ev)}
              showLabel   /* retire showLabel si tu veux juste l’icône */
            />
          </div>
        )}
      </div>
    </div>
  );
}