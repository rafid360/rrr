import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only fetch user once on mount
    if (!initialized) {
      (async () => {
        try {
          const { data } = await api.get('/api/auth/me');
          setUser(data);
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      })();
    }
  }, [initialized]);

  const login = useCallback(async (email: string, password: string) => {
    await api.post('/api/auth/login', { email, password });
    const { data } = await api.get('/api/auth/me');
    setUser(data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.post('/api/auth/register', { name, email, password });
    // Auto-login after successful registration
    await api.post('/api/auth/login', { email, password });
    const { data } = await api.get('/api/auth/me');
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}