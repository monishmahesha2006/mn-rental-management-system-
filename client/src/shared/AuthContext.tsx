import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type Role = "OWNER" | "TENANT";

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (params: { email: string; password: string }) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("blr_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem("blr_auth");
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token: jwt, user: u } = res.data;
    setUser(u);
    setToken(jwt);
    localStorage.setItem("blr_auth", JSON.stringify({ user: u, token: jwt }));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("blr_auth");
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

