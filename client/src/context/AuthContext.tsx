import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

type User = { name: string; email: string; role: 'user' | 'admin' } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    await api.post('/api/auth/login', { email, password });
    const { data } = await api.get('/api/auth/me');
    setUser(data);
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post('/api/auth/register', { name, email, password });
    // Auto-login after successful registration
    await api.post('/api/auth/login', { email, password });
    const { data } = await api.get('/api/auth/me');
    setUser(data);
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}