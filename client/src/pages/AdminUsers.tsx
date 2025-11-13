import { useEffect, useState } from 'react';
import { assignUserPackage, fetchPackages, fetchUsers, setUserSuspended, createUser } from '../api/admin';
import { useDebounce } from '../hooks/useDebounce';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all'|'active'|'suspended'>('all');
  const [loading, setLoading] = useState(false);

  // Debounce search input for better performance
  const debouncedSearch = useDebounce(search, 400);

  // Create user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPackageId, setNewPackageId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers({ search: debouncedSearch || undefined, status: status === 'all' ? undefined : status });
      // Handle both old and new API response formats
      const userData = response.users || response;
      setUsers(Array.isArray(userData) ? userData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => setPackages(await fetchPackages()))();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status]);

  return (
    <div>
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-neutral-100">Create User</h2>
        <div className="grid md:grid-cols-5 gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <select value={newPackageId} onChange={(e) => setNewPackageId(e.target.value)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="">No package</option>
            {packages.map((p) => (
              <option key={p._id} value={p._id}>{p.name} ({p.dailyLimit}/day)</option>
            ))}
          </select>
          <button
            className="btn"
            disabled={creating}
            onClick={async () => {
              setCreateError(null);
              setCreating(true);
              try {
                if (!newName || !newEmail || !newPassword) {
                  setCreateError('Name, email, and password are required');
                } else {
                  await createUser({ name: newName, email: newEmail, password: newPassword, packageId: newPackageId || undefined });
                  setNewName('');
                  setNewEmail('');
                  setNewPassword('');
                  setNewPackageId('');
                  await load();
                }
              } catch (err: any) {
                setCreateError(err?.response?.data?.message || 'Failed to create user');
              } finally {
                setCreating(false);
              }
            }}
          >Create</button>
        </div>
        {createError && <div className="text-red-400 mt-2 text-sm">{createError}</div>}
      </div>
      <div className="flex gap-2 mb-4">
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search name/email (auto-filters)" 
          className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-100" 
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-100">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        {loading && <span className="text-neutral-400 self-center text-sm">Searching...</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-300">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Package</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-neutral-800">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  <select
                    value={u.package?._id || ''}
                    onChange={async (e) => {
                      const pid = e.target.value;
                      await assignUserPackage(u._id, pid);
                      await load();
                    }}
                    className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-100"
                  >
                    <option value="">None</option>
                    {packages.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.dailyLimit}/day)</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">{u.suspended ? 'Suspended' : 'Active'}</td>
                <td className="p-2">
                  <button
                    className="btn"
                    onClick={async () => {
                      await setUserSuspended(u._id, !u.suspended);
                      await load();
                    }}
                  >
                    {u.suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-neutral-300 mt-4">Loading…</div>}
      </div>
    </div>
  );
}