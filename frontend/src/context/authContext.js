import { createContext, useContext, useEffect, useState } from "react";
import api from "../hooks/useApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.usuario);
    } catch(err) {
      if (err.response?.status !== 401) console.error("Erro ao carregar sessão", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, senha) => {
    setError(null);

    try {
      const res = await api.post("/auth/login", { email, senha });
      
      setUser(res.data.usuario);
      return { ok: true };
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer login");
      return { ok: false };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer logout");
      return { message: "Erro ao fazer logout" }
    }
    
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
