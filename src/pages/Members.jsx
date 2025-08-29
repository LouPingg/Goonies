import { listMembers } from "../lib/storage";
import MemberCard from "../components/MemberCard";

export default function Members() {
  const members = listMembers();

  return (
    <section className="page">
      <h2>Collection de cartes</h2>

      {!members.length ? (
        <p>Aucun membre pour l’instant.</p>
      ) : (
        <div className="binder">                 {/* classeur */}
          <div className="binder__ring"></div>   {/* anneaux */}
          <div className="binder__sheet">        {/* feuille/protège-carte */}
            <div className="pockets">            {/* grille des pochettes */}
              {members.map((m) => (
                <div key={m.id} className="pocket">
                  <div className="pocket__shine"></div>
                  <MemberCard member={m} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}