import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // After login, server decides role; fetch via context and route
      const role = (await fetchRole()).role;
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchRole = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include' });
      return await res.json();
    } catch {
      return { role: 'user' } as const;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-lg p-6 shadow">
        <h1 className="text-2xl font-semibold mb-4 text-neutral-100">Fastedge Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="btn w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-neutral-300 mt-4">
          New here? <Link to="/signup" className="text-brand hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}