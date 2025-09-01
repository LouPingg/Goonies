// goonies/src/components/MemberCard.jsx
import { useMemo, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function MemberCard({ member }) {
  const [broken, setBroken] = useState(false);

  const ref = member?.username || member?._id || member?.id;
  const v = useMemo(() => {
    const t = member?.updatedAt ? new Date(member.updatedAt).getTime() : Date.now();
    return String(t).slice(-8); // petit cache-buster
  }, [member?.updatedAt]);

  if (!ref) return null;

  const cardSrc = `${API}/cards/${encodeURIComponent(ref)}.png?w=600&v=${v}`;

  return (
    <div className="membercard">
      {!broken ? (
        <img
          src={cardSrc}
          alt={member?.displayName || member?.username || "card"}
          className="membercard__img"
          onError={() => setBroken(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="membercard__fallback">
          <img
            src={member?.avatarUrl || "https://dummyimage.com/600x400/ddd/555.png&text=Avatar"}
            alt=""
            className="membercard__avatar"
          />
          <div className="membercard__name">
            {member?.displayName || member?.username}
          </div>
        </div>
      )}
    </div>
  );
}