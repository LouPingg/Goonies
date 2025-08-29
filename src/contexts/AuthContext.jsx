import { createContext, useContext, useEffect, useState } from "react";
import {
  findUserByUsername, upsertUser, getSession, setSession, clearSession, getUserById,
  isAllowed
} from "../lib/storage";

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sess = getSession();
    setUser(sess ? getUserById(sess.userId) : null);
  }, []);

  function register({ username, password }) {
    if (!username || !password) throw new Error("Champs requis");
    if (findUserByUsername(username)) throw new Error("Identifiant déjà utilisé");

    // 🔒 vérif allowlist
    if (!isAllowed(username)) {
      throw new Error("Cet identifiant n’a pas été autorisé par l’admin.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      password, // demo
      displayName: username,
      avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(username)}/300/300`,
      titles: [],
      role: "member"
    };
    upsertUser(newUser);
    setSession(newUser.id);
    setUser(newUser);
  }

  function login({ username, password }) {
    const u = findUserByUsername(username);
    if (!u || u.password !== password) throw new Error("Identifiants invalides");
    setSession(u.id);
    setUser(u);
  }

  function logout() { clearSession(); setUser(null); }

  function updateProfile(patch) {
    if (!user) return;
    const updated = { ...user, ...patch };
    upsertUser(updated);
    setUser(updated);
  }

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isAdmin, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}