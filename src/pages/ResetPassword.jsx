import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nav = useNavigate();
  const [password, setP] = useState("");
  const [confirm, setC] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e) {
    e.preventDefault(); setErr(""); setOk("");
    if (!token) return setErr("Lien invalide.");
    if (password.length < 6) return setErr("Mot de passe trop court (min. 6).");
    if (password !== confirm) return setErr("Les mots de passe ne correspondent pas.");
    try {
      await api.post("/auth/reset-password", { token, password });
      setOk("Mot de passe mis à jour.");
      setTimeout(() => nav("/login"), 1200);
    } catch (e) { setErr(e?.response?.data?.error || e.message || "Erreur"); }
  }

  return (
    <section className="page">
      <h2>Réinitialiser le mot de passe</h2>
      {err && <p className="error">{err}</p>}
      {ok && <p style={{ color: "#8fda8f" }}>{ok}</p>}
      <form className="form" onSubmit={submit}>
        <label>Nouveau mot de passe
          <input type="password" value={password} onChange={(e)=>setP(e.target.value)} />
        </label>
        <label>Confirmer
          <input type="password" value={confirm} onChange={(e)=>setC(e.target.value)} />
        </label>
        <button>Mettre à jour</button>
      </form>
      <p style={{ marginTop: 8 }}><Link to="/login">Retour connexion</Link></p>
    </section>
  );
}