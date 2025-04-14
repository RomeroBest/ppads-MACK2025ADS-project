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
    async function fetchUserFromSession() {
      try {
        const response = await fetch("http://localhost:5000/me", {
          credentials: "include", // ESSENCIAL para usar o cookie da sessão
        });
  
        if (response.ok) {
          const data = await response.json();
          // Ajusta para o formato que seu contexto espera
          const userData: User = {
            id: 0, // ou um valor que você decidir
            email: data.user.email,
            name: data.user.name,
            username: data.user.email, // ou algo diferente se preferir
            role: "user", // ou um valor retornado do backend
            profilePicture: null,
          };
          setUser(userData);
        }
      } catch (err) {
        console.error("Erro ao buscar sessão do usuário:", err);
      }
    }
  
    // Só busca se ainda não houver usuário no contexto
    if (!user) {
      fetchUserFromSession();
    }
  }, []);
  

  const login = (userData: User) => {
    setUser(userData);
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
