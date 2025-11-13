import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top navbar: logo left, logout right */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-brand" />
          <span className="font-semibold">Fastedge</span>
        </div>
        <button className="btn" onClick={onLogout}>Logout</button>
      </header>

      <main className="px-6 py-6 max-w-5xl mx-auto">
        {/* Grid page switcher (not a navbar) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <NavLink end to="/dashboard/home" className={({ isActive }) => `block p-4 rounded-lg border text-center ${isActive ? 'border-brand bg-neutral-800' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'} transition`}>
            <div className="text-sm font-medium text-neutral-300">Home</div>
          </NavLink>
          <NavLink end to="/dashboard/package" className={({ isActive }) => `block p-4 rounded-lg border text-center ${isActive ? 'border-brand bg-neutral-800' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'} transition`}>
            <div className="text-sm font-medium text-neutral-300">Package</div>
          </NavLink>
          <NavLink end to="/dashboard/account" className={({ isActive }) => `block p-4 rounded-lg border text-center ${isActive ? 'border-brand bg-neutral-800' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'} transition`}>
            <div className="text-sm font-medium text-neutral-300">My Account</div>
          </NavLink>
          <NavLink end to="/dashboard/settings" className={({ isActive }) => `block p-4 rounded-lg border text-center ${isActive ? 'border-brand bg-neutral-800' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'} transition`}>
            <div className="text-sm font-medium text-neutral-300">Settings</div>
          </NavLink>
        </div>

        {/* Page content */}
        <Outlet />
      </main>
    </div>
  );
}