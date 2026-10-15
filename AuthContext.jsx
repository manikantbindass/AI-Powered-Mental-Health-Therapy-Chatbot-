import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("mindcare_theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("mindcare_theme", theme);
  }, [theme]);

  const fetchProfile = async () => {
    if (!localStorage.getItem("mindcare_access_token")) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get("/users/me/");
      setUser(res.data);
    } catch {
      localStorage.removeItem("mindcare_access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const login = async (username, password) => {
    const res = await apiClient.post("/auth/login/", { username, password });
    localStorage.setItem("mindcare_access_token", res.data.access);
    await fetchProfile();
  };

  const register = async (payload) => {
    await apiClient.post("/auth/register/", payload);
    await login(payload.username, payload.password);
  };

  const logout = () => {
    localStorage.removeItem("mindcare_access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, theme, setTheme, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
