import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { allowUsername, revokeUsername, listAllowlist } from "../lib/storage";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [name, setName] = useState("");
  const [allowed, setAllowed] = useState(listAllowlist());

  if (!user) return <section className="page"><h2>Admin</h2><p>Veuillez vous connecter.</p></section>;
  if (!isAdmin) return <section className="page"><h2>Admin</h2><p>Accès refusé.</p></section>;

  function add(e) {
    e.preventDefault();
    setAllowed([...allowUsername(name)]);
    setName("");
  }
  function remove(u) {
    setAllowed([...revokeUsername(u)]);
  }

  return (
    <section className="page">
      <h2>Panneau admin — Autoriser des pseudos</h2>

      <form className="form" onSubmit={add}>
        <input
          placeholder="Pseudo du jeu à autoriser (ex: Mikey)"
          value={name}
          onChange={e=>setName(e.target.value)}
        />
        <button>Autoriser</button>
      </form>

      <h3>Pseudos autorisés</h3>
      {allowed.length === 0 ? <p>Aucun pour l’instant.</p> : (
        <ul className="list">
          {allowed.map(u => (
            <li key={u} className="list__item">
              <span>{u}</span>
              <button onClick={()=>remove(u)}>Retirer</button>
            </li>
          ))}
        </ul>
      )}

      <p style={{opacity:.7, marginTop:12}}>
        Rappel: un utilisateur ne peut s’inscrire que si son pseudo est dans cette liste.
      </p>
    </section>
  );
}