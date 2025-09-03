import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  
  const [token, setToken] = useState(() => localStorage.getItem("goonies_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token); 
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get("/users/me");
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      } catch (e) {
        console.warn("[auth] /users/me failed:", e?.response?.data || e.message);
        localStorage.removeItem("goonies_token");
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
      }
    }

    loadMe();
    return () => { cancelled = true; };
  }, [token]);

  async function login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("goonies_token", data.token);
    setToken(data.token);   
    setUser(data.user);    
    return data.user;
  }

  function logout() {
    localStorage.removeItem("goonies_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, isAdmin, loading, login, logout }), [user, token, isAdmin, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx) ?? { user: null, isAdmin: false, loading: false, login: async()=>{}, logout: ()=>{} };
}