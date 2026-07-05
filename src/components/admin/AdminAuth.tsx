import { createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";

interface AuthContext {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthCtx = createContext<AuthContext>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

const ADMIN_PASSWORD = "amani2026";

export function AdminAuthProvider({ children }: { children: preact.ComponentChildren }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("amani-admin-auth");
    if (stored === "true") setIsAuthenticated(true);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("amani-admin-auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("amani-admin-auth");
  };

  return (
    <AuthCtx.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthCtx);
}
