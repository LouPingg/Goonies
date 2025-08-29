import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api";

export default function Admin() {
  const { isAdmin, ready } = useAuth();

  const [allow, setAllow] = useState([]);
  const [allowName, setAllowName] = useState("");
  const [allowLoading, setAllowLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ready || !isAdmin) return;
    loadAllow();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isAdmin]);

  async function loadAllow() {
    try {
      setAllowLoading(true);
      const { data } = await api.get("/allow");
      setAllow(data || []);
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setAllowLoading(false);
    }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true);
      const { data } = await api.get("/users");
      setUsers(data || []);
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setUsersLoading(false);
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
    if (u.role === "admin") return alert("Impossible de supprimer un admin.");
    if (!confirm(`Supprimer le compte « ${u.username} » ?`)) return;
    setBusy(true); setErr("");
    try {
      await api.delete(`/users/${u._id || u.id}`);
      setUsers((cur) => cur.filter((x) => (x._id || x.id) !== (u._id || u.id)));
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <section className="page"><p>Chargement…</p></section>;
  if (!isAdmin) return <section className="page"><p className="error">Accès réservé à l’admin.</p></section>;

  return (
    <section className="page">
      <h2>Administration</h2>
      {err && <p className="error" style={{ marginBottom: 8 }}>{err}</p>}

      {/* Allowlist */}
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <h3>Allowlist (pseudos autorisés à s’inscrire)</h3>
        <form className="form" onSubmit={addAllow}>
          <label>Autoriser un pseudo
            <input
              value={allowName}
              onChange={(e) => setAllowName(e.target.value)}
              placeholder="ex: Mikey"
              disabled={busy}
            />
          </label>
          <button disabled={busy || !allowName.trim()}>Ajouter</button>
        </form>

        {allowLoading ? (
          <p>Chargement…</p>
        ) : allow.length === 0 ? (
          <p>Aucun pseudo autorisé pour le moment.</p>
        ) : (
          <ul className="list">
            {allow.map((item) => (
              <li key={item._id || item.username} className="list__item">
                <span>{item.username}</span>
                <button onClick={() => removeAllow(item.username)} disabled={busy}>Retirer</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comptes utilisateurs */}
      <div style={{ display: "grid", gap: 8 }}>
        <h3>Comptes</h3>
        {usersLoading ? (
          <p>Chargement…</p>
        ) : users.length === 0 ? (
          <p>Aucun compte pour le moment.</p>
        ) : (
          <ul className="list">
            {users.map((u) => (
              <li key={u._id || u.id} className="list__item" title={u._id || u.id}>
                <span>
                  <strong>{u.displayName || u.username}</strong>
                  {" "}
                  <span style={{ opacity: 0.7 }}>
                    @{u.username}
                  </span>
                  {" "}
                  <RoleBadge role={u.role} />
                </span>
                {u.role !== "admin" ? (
                  <button onClick={() => deleteUser(u)} disabled={busy}>Supprimer</button>
                ) : (
                  <span style={{ opacity: 0.6 }}>—</span>
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
    admin: { background: "#2f81f722", border: "1px solid #2f81f755", padding: "2px 6px", borderRadius: 8, fontSize: 12 },
    member: { background: "#1f6feb22", border: "1px solid #1f6feb55", padding: "2px 6px", borderRadius: 8, fontSize: 12 },
  }[role] || {};
  return <span style={style}>{role}</span>;
}

function messageFrom(e) {
  return e?.response?.data?.error || e.message || "Erreur réseau";
}