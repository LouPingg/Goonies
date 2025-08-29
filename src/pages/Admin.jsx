import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

export default function Admin() {
  const { user, isAdmin, ready } = useAuth();
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Charge la allowlist au montage (si admin)
  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/allow");
        setList(data); // [{_id, username}]
      } catch (e) {
        setErr(messageFrom(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, isAdmin]);

  async function add(e) {
    e.preventDefault();
    const username = name.trim();
    if (!username) return;
    setBusy(true); setErr("");
    try {
      await api.post("/allow", { username });
      setName("");
      const { data } = await api.get("/allow");
      setList(data);
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(username) {
    setBusy(true); setErr("");
    try {
      await api.delete(`/allow/${encodeURIComponent(username)}`);
      setList((cur) => cur.filter(x => x.username !== username));
    } catch (e) {
      setErr(messageFrom(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <section className="page"><p>Chargement…</p></section>;
  }
  if (!isAdmin) {
    return <section className="page"><p className="error">Accès réservé à l’admin.</p></section>;
  }

  return (
    <section className="page">
      <h2>Administration</h2>

      {err && <p className="error" style={{ marginBottom: 8 }}>{err}</p>}

      <form className="form" onSubmit={add}>
        <label>Autoriser un pseudo (identique à celui du jeu)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Mikey"
            disabled={busy}
          />
        </label>
        <button disabled={busy || !name.trim()}>Ajouter à l’allowlist</button>
      </form>

      <h3 style={{ marginTop: 16 }}>Allowlist</h3>
      {loading ? (
        <p>Chargement…</p>
      ) : list.length === 0 ? (
        <p>Aucun pseudo autorisé pour le moment.</p>
      ) : (
        <ul className="list">
          {list.map((item) => (
            <li key={item._id || item.username} className="list__item">
              <span>{item.username}</span>
              <button onClick={() => remove(item.username)} disabled={busy}>Retirer</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function messageFrom(e) {
  return e?.response?.data?.error || e.message || "Erreur réseau";
}