export default function MemberCard({ member }) {
  return (
    <article className="card">
      <div className="card__frame">
        <img className="card__img" src={member.avatarUrl} alt={member.displayName} />
      </div>
      <div className="card__body">
        <h3 className="card__title">{member.displayName}</h3>
        <p className="card__subtitle">@{member.username}</p>
        {!!member.titles?.length && (
          <ul className="card__tags">
            {member.titles.map((t,i)=><li key={i} className="tag">{t}</li>)}
          </ul>
        )}
      </div>
    </article>
  );
}