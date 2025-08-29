import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [confirm, setC] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!username.trim()) return setErr("Identifiant requis.");
    if (!password) return setErr("Mot de passe requis.");
    if (password !== confirm) return setErr("Les mots de passe ne correspondent pas.");

    try {
      await register(username.trim(), password);
      nav("/profile"); // ou "/"
    } catch (e) {
      const msg = e?.response?.data?.error || "Erreur d'inscription";
      setErr(msg);
    }
  }

  return (
    <section className="page">
      <h2>Créer un compte</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Ton identifiant doit être **autorisé par l’admin** (allowlist).
      </p>
      {err && <p className="error">{err}</p>}

      <form className="form" onSubmit={onSubmit} noValidate>
        <label>Identifiant (même pseudo que dans le jeu)
          <input value={username} onChange={(e)=>setU(e.target.value)} />
        </label>
        <label>Mot de passe
          <input type="password" value={password} onChange={(e)=>setP(e.target.value)} />
        </label>
        <label>Confirmer le mot de passe
          <input type="password" value={confirm} onChange={(e)=>setC(e.target.value)} />
        </label>
        <button>Créer le compte</button>
      </form>

      <p style={{ marginTop: 8 }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </section>
  );
}