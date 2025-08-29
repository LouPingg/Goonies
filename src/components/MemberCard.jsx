// src/components/MemberCard.jsx

// Petite image sûre : ne rend rien si src vide (évite <img src="">)
function SafeImg({ src, alt = "", className = "", ...rest }) {
  const ok = typeof src === "string" && src.trim().length > 0;
  if (!ok) return null;
  return <img src={src} alt={alt} className={className} {...rest} />;
}

export default function MemberCard({ member = {} }) {
  const name =
    member.displayName?.trim() ||
    member.username?.trim() ||
    "Membre";

  const subtitle = member.username && member.displayName !== member.username
    ? `@${member.username}`
    : "";

  const titles = Array.isArray(member.titles) ? member.titles : [];
  const hasAvatar = typeof member.avatarUrl === "string" && member.avatarUrl.trim().length > 0;
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className="card">
      <div className="card__frame">
        {hasAvatar ? (
          <SafeImg
            src={member.avatarUrl}
            alt={`Avatar de ${name}`}
            className="card__img"
            loading="lazy"
          />
        ) : (
          // Placeholder visuel si pas d’avatar
          <div
            className="card__placeholder"
            aria-label="Pas d’avatar"
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#6d7a8a",
              background: "linear-gradient(135deg,#0b1016,#0f141a)",
              border: "1px dashed #2a303a",
            }}
          >
            {initial}
          </div>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title">{name}</h3>
        {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}

        {titles.length > 0 ? (
          <ul className="card__tags">
            {titles.map((t, i) => (
              <li key={`${t}-${i}`} className="tag">
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="card__subtitle" style={{ opacity: 0.6 }}>
            Aucun titre pour le moment
          </p>
        )}
      </div>
    </article>
  );
}