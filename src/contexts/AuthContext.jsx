// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthCtx = createContext(null);
const TOKEN_KEY = "goonies_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setReady(true); return; }
    api.get("/users/me")
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setUser(null); })
      .finally(() => setReady(true));
  }, []);

  function setAuthFromResponse({ token, user }) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    setAuthFromResponse(res.data);
    return res.data.user;
  }

  async function register(username, password) {
    const res = await api.post("/auth/register", { username, password });
    setAuthFromResponse(res.data);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  async function updateProfile(patch) {
    const res = await api.patch("/users/me", patch);
    setUser(res.data);
    return res.data;
  }

  const isAdmin = !!user && user.role === "admin";

  const value = useMemo(() => ({
    user, ready, isAdmin,
    login, register, logout, updateProfile,
  }), [user, ready, isAdmin]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}