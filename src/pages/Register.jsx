import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const nav = useNavigate();

  function submit(e) {
    e.preventDefault();
    try { register(form); nav("/profile"); } catch (e) { setErr(e.message); }
  }

  return (
    <section className="page">
      <h2>Créer un compte</h2>
      {err && <p className="error">{err}</p>}
      <form className="form" onSubmit={submit}>
        <input placeholder="Identifiant du jeu" value={form.username}
               onChange={e=>setForm(f=>({...f,username:e.target.value}))}/>
        <input type="password" placeholder="Mot de passe" value={form.password}
               onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
        <button>Créer</button>
      </form>
      <p>Déjà un compte ? <Link to="/login">Connexion</Link></p>
    </section>
  );
}