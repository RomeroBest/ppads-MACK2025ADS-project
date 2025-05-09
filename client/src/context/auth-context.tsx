// src/context/auth-context.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  role: string;
  profilePicture?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) Ao montar, busca /api/me para verificar sessão
  useEffect(() => {
    fetch("/api/me", {
      method: "GET",
      credentials: "include", // envia o cookie de sessão
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json() as Promise<User>;
      })
      .then(u => {
        setUser(u);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2) login e logout podem simplesmente ajustar o estado local
  const login = (userData: User) => {
    setUser(userData);
  };
  const logout = () => {
    // opcional: chamar rota de logout no backend para destruir sessão
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setUser(null);
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
