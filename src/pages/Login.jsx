// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ⬅️ important
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login({ username: username.trim(), password });
      nav("/"); // redirection après connexion
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Échec de connexion");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <h2>Connexion</h2>
      {err && <p className="error">{err}</p>}

      <form className="form" onSubmit={onSubmit}>
        <label>Identifiant
          <input value={username} onChange={(e) => setU(e.target.value)} disabled={busy} />
        </label>
        <label>Mot de passe
          <input type="password" value={password} onChange={(e) => setP(e.target.value)} disabled={busy} />
        </label>
        <button disabled={busy}>Se connecter</button>
      </form>

      <p style={{ marginTop: 8 }}>
        <Link to="/forgot">Mot de passe oublié ?</Link>
      </p>
    </section>
  );
}