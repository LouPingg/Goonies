import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Forgot() {
  const [username, setU] = useState("");
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const [devLink, setDevLink] = useState("");

  async function submit(e) {
    e.preventDefault(); setErr(""); setInfo(""); setDevLink("");
    try {
      const { data } = await api.post("/auth/request-reset", { username: username.trim() });
      setInfo("Si un compte existe pour cet identifiant, un lien de réinitialisation a été généré.");
      if (data.resetUrl) setDevLink(data.resetUrl); // visible en dev
    } catch (e) { setErr(e?.response?.data?.error || e.message || "Erreur"); }
  }

  return (
    <section className="page">
      <h2>Mot de passe oublié</h2>
      {err && <p className="error">{err}</p>}
      {info && <p style={{ color: "#8fda8f" }}>{info}</p>}

      <form className="form" onSubmit={submit}>
        <label>Identifiant
          <input value={username} onChange={(e)=>setU(e.target.value)} />
        </label>
        <button>Envoyer le lien</button>
      </form>

      {devLink && <p className="muted">Dev : <a href={devLink}>Réinitialiser maintenant</a></p>}
      <p style={{ marginTop: 8 }}><Link to="/login">Retour connexion</Link></p>
    </section>
  );
}