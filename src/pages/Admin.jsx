import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api";
import CatButton from "../components/CatButton";

export default function Admin() {
  const { isAdmin, loading } = useAuth();

  const [allow, setAllow] = useState([]);
  const [allowName, setAllowName] = useState("");
  const [allowLoading, setAllowLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // set password modal
  const [pwdFor, setPwdFor] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdErr, setPwdErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (loading) return;
      if (!isAdmin) {
        if (!cancelled) { setAllowLoading(false); setUsersLoading(false); }
        return;
      }
      try {
        setErr("");
        setAllowLoading(true);
        setUsersLoading(true);
        const [allowRes, usersRes] = await Promise.all([
          api.get("/allow"),
          api.get("/users"),
        ]);
        if (!cancelled) {
          setAllow(Array.isArray(allowRes.data) ? allowRes.data : []);
          const list = Array.isArray(usersRes.data?.items)
            ? usersRes.data.items
            : (Array.isArray(usersRes.data) ? usersRes.data : []);
          setUsers(list);
        }
      } catch (e) {
        if (!cancelled) setErr(messageFrom(e));
      } finally {
        if (!cancelled) { setAllowLoading(false); setUsersLoading(false); }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [loading, isAdmin]);

  if (loading) return <section className="page"><p>Loading…</p></section>;
  if (!isAdmin) return <section className="page"><p className="error">Admin access only.</p></section>;

  async function loadAllow() {
    try {
      setAllowLoading(true);
      const { data } = await api.get("/allow");
      setAllow(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setAllowLoading(false);
    }
  }

  async function addAllow(e) {
    e.preventDefault();
    const username = allowName.trim();
    if (!username) return;
    setBusy(true); setErr("");
    try {
      await api.post("/allow", { username });
      setAllowName("");
      await loadAllow();
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeAllow(username) {
    setBusy(true); setErr("");
    try {
      await api.delete(`/allow/${encodeURIComponent(username)}`);
      setAllow((cur) => cur.filter((x) => x.username !== username));
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(u) {
    if (u.role === "admin") return alert("Unable to delete an admin.");
    if (!confirm(`Delete account “${u.username}”?`)) return;
    setBusy(true); setErr("");
    try {
      const id = u._id || u.id;
      await api.delete(`/users/${id}`);
      setUsers((cur) => cur.filter((x) => (x._id || x.id) !== id));
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setBusy(false);
    }
  }

  
  function openPwd(u) {
    setPwdFor(u);
    setNewPwd("");
    setPwdErr("");
  }
  async function submitPwd(e) {
    e.preventDefault();
    if (!pwdFor) return;
    const pass = newPwd.trim();
    if (pass.length < 6) { setPwdErr("6 characters minimum"); return; }
    setPwdLoading(true); setPwdErr("");
    try {
      const id = pwdFor._id || pwdFor.id;
      await api.patch(`/users/${id}/password`, { password: pass });
      alert(`Password set for @${pwdFor.username}`);
      setPwdFor(null);
    } catch (e) {
      setPwdErr(messageFrom(e));
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <section className="page">
      {/* Set password modal */}
      {pwdFor && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Set password" onClick={() => !pwdLoading && setPwdFor(null)}>
          <div className="modal__backdrop" />
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal__tools">
              <CatButton variant="cancel" label="Cancel" onClick={() => !pwdLoading && setPwdFor(null)} size={64} showLabel />
              <div style={{ flex: 1 }} />
              <CatButton
                variant="confirm"
                label="Save"
                type="submit"
                size={64}
                showLabel
                className="modal__submit-proxy"
                onClick={() => {
                  const form = document.getElementById("pwdForm");
                  if (form && !pwdLoading) form.requestSubmit();
                }}
              />
            </div>

            <form id="pwdForm" className="form modal__form" onSubmit={submitPwd} noValidate>
              <h3>Set password</h3>
              <p className="muted">Account: <strong>@{pwdFor.username}</strong></p>

              {pwdErr && <p className="error">{pwdErr}</p>}

              <label>New password
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  minLength={6}
                  required
                  autoFocus
                />
              </label>
            </form>
          </div>
        </div>
      )}

      <h2>Administration</h2>
      {err && <p className="error">{err}</p>}

      {}
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <h3>Allowlist (usernames allowed to register)</h3>
        <form className="form" onSubmit={addAllow}>
          <label>Allow a username
            <input
              value={allowName}
              onChange={(e) => setAllowName(e.target.value)}
              placeholder="e.g., Mikey"
              disabled={busy}
            />
          </label>
          <button disabled={busy || !allowName.trim()}>Add</button>
        </form>

        {allowLoading ? (
          <p>Loading…</p>
        ) : allow.length === 0 ? (
          <p>No allowed usernames yet.</p>
        ) : (
          <ul className="list">
            {allow.map((item) => (
              <li key={item._id || item.username} className="list__item">
                <span>{item.username}</span>
                <button onClick={() => removeAllow(item.username)} disabled={busy}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {}
      <div style={{ display: "grid", gap: 8 }}>
        <h3>Accounts</h3>
        {usersLoading ? (
          <p>Loading…</p>
        ) : users.length === 0 ? (
          <p>No accounts yet.</p>
        ) : (
          <ul className="list">
            {users.map((u) => (
              <li key={u._id || u.id} className="list__item" title={u._id || u.id}>
                <span>
                  <strong>{u.displayName || u.username}</strong>{" "}
                  <span className="muted">@{u.username}</span>{" "}
                  <RoleBadge role={u.role} />
                </span>
                {u.role !== "admin" ? (
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <button onClick={() => openPwd(u)} disabled={busy}>Set password</button>
                    <button onClick={() => deleteUser(u)} disabled={busy}>Delete</button>
                  </span>
                ) : (
                  <span className="muted">—</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RoleBadge({ role }) {
  const style = {
    admin:  { background: "#2f81f722", border: "1px solid #2f81f755", padding: "2px 6px", borderRadius: 8, fontSize: 12 },
    member: { background: "#1f6feb22", border: "1px solid #1f6feb55", padding: "2px 6px", borderRadius: 8, fontSize: 12 },
  }[role] || {};
  return <span style={style}>{role}</span>;
}

function messageFrom(e) {
  return e?.response?.data?.error || e.message || "Network error";
}