import { useAuth } from '../context/AuthContext';

export default function UserAccount() {
  const { user } = useAuth();
  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">My Account</h2>
      <div className="text-neutral-300">Name: {user?.name}</div>
      <div className="text-neutral-300">Email: {user?.email}</div>
      <div className="text-neutral-300">Role: {user?.role}</div>
      <p className="text-neutral-500 text-sm mt-3">Profile editing coming soon.</p>
    </section>
  );
}