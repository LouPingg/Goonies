import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]       = useState(false);
  const [err,  setErr]        = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page auth">
      <div className="auth__card">
        <h2 className="text-center">Sign in</h2>
        {err && <p className="error text-center">{err}</p>}

        <form className="form form--grid" onSubmit={onSubmit} noValidate>
          <label>Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              autoComplete="username"
              disabled={busy}
              required
            />
          </label>

          <label>Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              disabled={busy}
              required
            />
          </label>

          <div className="field">
            <div />{}
            <div className="field__control" style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={busy || !username.trim() || !password}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <Link to="/register" className="btn-secondary">Create account</Link>
              <Link to="/forgot" className="btn-secondary">Forgot password?</Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}