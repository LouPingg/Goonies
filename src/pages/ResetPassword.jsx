src/pages/ResetPassword.jsx
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
    if (!token) return setErr("Invalid link.");
    if (password.length < 6) return setErr("Password too short (min 6).");
    if (password !== confirm) return setErr("Passwords do not match.");
    try {
      await api.post("/auth/reset-password", { token, password });
      setOk("Password updated.");
      setTimeout(() => nav("/login"), 1200);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || "Error");
    }
  }

  return (
    <section className="page">
      <h2>Reset password</h2>
      {err && <p className="error">{err}</p>}
      {ok && <p>{ok}</p>}

      <form className="form" onSubmit={submit}>
        <label>New password
          <input type="password" value={password} onChange={(e)=>setP(e.target.value)} />
        </label>
        <label>Confirm password
          <input type="password" value={confirm} onChange={(e)=>setC(e.target.value)} />
        </label>
        <button>Update password</button>
      </form>

      <p style={{ marginTop: 8 }}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </section>
  );
}