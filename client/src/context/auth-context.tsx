import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";


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
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // Captura token da URL (ex: /login-success?token=...)
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");

      if (tokenFromUrl) {
        localStorage.setItem("authToken", tokenFromUrl);
        // Limpa a URL
        window.history.replaceState({}, "", window.location.pathname);
      }

      const token = tokenFromUrl || localStorage.getItem("authToken");
      if (!token) return;
  
    try {
      const decoded: any = jwtDecode(token);
  
      const userData: User = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        username: decoded.username,
        role: decoded.role,
        profilePicture: null, // ajuste conforme necessário
      };
  
      setUser(userData);
    } catch (err) {
      console.error("Token inválido:", err);
      localStorage.removeItem("authToken");
    }
  }, []);
  
  

  const login = (userData: User, token?: string) => {
    setUser(userData);
    if (token) {
      localStorage.setItem("authToken", token);
    }
  };
  

  const logout = () => {
    setUser(null);
  };
  
  // Check if user is an admin
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
