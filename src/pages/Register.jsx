import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const auth = useAuth?.();
  const setAuth = auth?.setAuth ?? null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!username.trim() || !password) {
      setErr("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (confirm !== password) {
      setErr("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", {
        username: username.trim(),
        password,
      });

      if (data?.token) {
        localStorage.setItem("goonies_token", data.token);
      }
      if (setAuth && data?.user) {
        setAuth({ token: data.token, user: data.user });
      }

      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <h2>Create an account</h2>
      {err && <p className="error">{err}</p>}

      <form className="form form--grid" onSubmit={onSubmit} noValidate>
        <label>Username (must be allowed by admin)
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., Mikey"
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
            disabled={busy}
            required
          />
        </label>

        <label>Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            disabled={busy}
            required
          />
        </label>

        <div className="field">
          <div />
          <div className="field__control" style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
            <Link to="/login" className="btn-secondary" aria-label="Go to login">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </section>
  );
}