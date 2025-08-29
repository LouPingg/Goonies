// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(username, password);
      nav("/"); // redirige où tu veux
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur de connexion");
    }
  }

  return (
    <section className="page">
      <h2>Connexion</h2>
      {err && <p className="error">{err}</p>}
      <form className="form" onSubmit={onSubmit}>
        <label>Identifiant
          <input value={username} onChange={(e)=>setU(e.target.value)} />
        </label>
        <label>Mot de passe
          <input type="password" value={password} onChange={(e)=>setP(e.target.value)} />
        </label>
        <button>Se connecter</button>
      </form>
    </section>
  );
}