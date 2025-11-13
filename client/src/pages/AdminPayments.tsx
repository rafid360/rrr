import { useEffect, useState } from 'react';
import { fetchPayments, fetchUsers, fetchPackages, createPayment } from '../api/admin';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Create payment form state
  const [userId, setUserId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState('manual');
  const [status, setStatus] = useState<'pending'|'succeeded'|'failed'|'refunded'>('succeeded');
  const [reference, setReference] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setPayments(await fetchPayments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        setUsers(await fetchUsers({} as any));
        setPackages(await fetchPackages());
      } catch {}
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Payments</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-neutral-100">Create Payment</h3>
        <div className="grid md:grid-cols-6 gap-2">
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="">Select user…</option>
            {users.map((u) => (<option key={u._id} value={u._id}>{u.email}</option>))}
          </select>
          <select value={packageId} onChange={(e) => setPackageId(e.target.value)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="">No package</option>
            {packages.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
          </select>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')} placeholder="Amount" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100" />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Reference (optional)" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100 md:col-span-2" />
          <button
            className="btn md:col-span-1"
            disabled={creating}
            onClick={async () => {
              setCreateError(null);
              setCreating(true);
              try {
                if (!userId || amount === '') {
                  setCreateError('User and amount are required');
                } else {
                  await createPayment({ userId, packageId: packageId || undefined, amount: Number(amount), currency, provider, status, reference });
                  setUserId('');
                  setPackageId('');
                  setAmount('');
                  setCurrency('USD');
                  setProvider('manual');
                  setStatus('succeeded');
                  setReference('');
                  await load();
                }
              } catch (err: any) {
                setCreateError(err?.response?.data?.message || 'Failed to create payment');
              } finally {
                setCreating(false);
              }
            }}
          >Create</button>
        </div>
        {createError && <div className="text-red-400 mt-2 text-sm">{createError}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-300">
              <th className="p-2">User</th>
              <th className="p-2">Package</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Provider</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => (
              <tr key={pay._id} className="border-t border-neutral-800">
                <td className="p-2">{pay.user?.email || '—'}</td>
                <td className="p-2">{pay.package?.name || '—'}</td>
                <td className="p-2">${pay.amount} {pay.currency}</td>
                <td className="p-2">{pay.provider}</td>
                <td className="p-2">{pay.status}</td>
                <td className="p-2">{new Date(pay.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-neutral-300 mt-4">Loading…</div>}
      </div>
    </div>
  );
}