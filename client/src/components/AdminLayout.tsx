import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-neutral-900 border-r border-neutral-800 p-4">
        <div className="text-neutral-200 font-semibold mb-6">Admin • {user?.name}</div>
        <nav className="space-y-2">
          <NavLink end to="/admin/users" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>Users</NavLink>
          <NavLink end to="/admin/packages" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>Packages</NavLink>
          <NavLink end to="/admin/payments" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>Payments</NavLink>
          <NavLink end to="/admin/transactions" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>Transactions</NavLink>
        </nav>
      </aside>
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}