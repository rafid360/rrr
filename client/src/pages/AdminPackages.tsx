import { useEffect, useState } from 'react';
import { fetchPackages, updatePackage, createPackage } from '../api/admin';

export default function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create package form state
  const [name, setName] = useState('');
  const [dailyLimit, setDailyLimit] = useState<number | ''>('');
  const [priceMonthly, setPriceMonthly] = useState<number | ''>('');
  const [active, setActive] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setPackages(await fetchPackages());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Packages</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-neutral-100">Create Package</h3>
        <div className="grid md:grid-cols-5 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value ? Number(e.target.value) : '')} placeholder="Daily limit" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <input type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value ? Number(e.target.value) : '')} placeholder="Price monthly" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <label className="flex items-center gap-2 text-neutral-200"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
          <button
            className="btn"
            disabled={creating}
            onClick={async () => {
              setCreateError(null);
              setCreating(true);
              try {
                if (!name || dailyLimit === '' || priceMonthly === '') {
                  setCreateError('Name, daily limit, and monthly price are required');
                } else {
                  await createPackage({ name, dailyLimit: Number(dailyLimit), priceMonthly: Number(priceMonthly), active });
                  setName('');
                  setDailyLimit('');
                  setPriceMonthly('');
                  setActive(true);
                  await load();
                }
              } catch (err: any) {
                setCreateError(err?.response?.data?.message || 'Failed to create package');
              } finally {
                setCreating(false);
              }
            }}
          >Create</button>
        </div>
        {createError && <div className="text-red-400 mt-2 text-sm">{createError}</div>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((p) => (
          <div key={p._id} className="bg-neutral-900 border border-neutral-800 rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-neutral-100 font-medium">{p.name}</div>
                <div className="text-neutral-400 text-sm">{p.dailyLimit} requests/day</div>
                <div className="text-neutral-400 text-sm">${p.priceMonthly}/month</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${p.active ? 'bg-green-700 text-green-100' : 'bg-neutral-700 text-neutral-100'}`}>{p.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <input
                type="number"
                defaultValue={p.dailyLimit}
                onBlur={async (e) => { await updatePackage(p._id, { dailyLimit: Number(e.target.value) }); await load(); }}
                className="px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-neutral-100"
              />
              <input
                type="number"
                defaultValue={p.priceMonthly}
                onBlur={async (e) => { await updatePackage(p._id, { priceMonthly: Number(e.target.value) }); await load(); }}
                className="px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-neutral-100"
              />
              <button
                className="btn"
                onClick={async () => { await updatePackage(p._id, { active: !p.active }); await load(); }}
              >
                Toggle Active
              </button>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="text-neutral-300 mt-4">Loading…</div>}
    </div>
  );
}