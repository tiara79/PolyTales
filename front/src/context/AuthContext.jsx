// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState, useCallback } from "react";

export const AuthContext = createContext({
  user: null, token: null, authLoading: true, login: () => {}, logout: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const verify = useCallback(async (t) => {
    try {
      const r = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && (d.ok || d.message === "ok") && d.user) {
        setUser(d.user);
        localStorage.setItem("user", JSON.stringify(d.user));
        localStorage.setItem("token", t);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    } finally {
      setAuthLoading(false);
    }
  }, [API]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (u && t) {
      try { setUser(JSON.parse(u)); } catch {}
      setToken(t);
      verify(t);
    } else {
      setAuthLoading(false);
    }
  }, [verify]);

  const login = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
    setAuthLoading(false);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthLoading(false);
  };

  const value = useMemo(() => ({ user, token, authLoading, login, logout }), [user, token, authLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
