import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-neutral-800 border border-neutral-700 rounded-lg p-8">
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-neutral-300 mb-6">Welcome, {user?.name || 'Admin'}.</p>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}