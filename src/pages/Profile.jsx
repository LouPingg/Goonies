import { useAuth } from "../contexts/AuthContext";
import TagInput from "../components/TagInput";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  if (!user) return <p className="page">Non connecté.</p>;

  return (
    <section className="page">
      <h2>Mon profil</h2>
      <form className="form" onSubmit={(e)=>{e.preventDefault(); alert("Profil mis à jour !");}}>
        <label> Pseudo affiché
          <input value={user.displayName} onChange={e=>updateProfile({ displayName: e.target.value })}/>
        </label>
        <label> Avatar (URL)
          <input value={user.avatarUrl} onChange={e=>updateProfile({ avatarUrl: e.target.value })}/>
        </label>
        <label> Titres (tags)
          <TagInput value={user.titles} onChange={(titles)=>updateProfile({ titles })}/>
        </label>
        <button type="submit">Enregistrer</button>
        <button type="button" onClick={logout}>Se déconnecter</button>
      </form>
    </section>
  );
}