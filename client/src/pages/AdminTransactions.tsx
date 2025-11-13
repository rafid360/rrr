import { useEffect, useState } from 'react';
import { fetchTransactions, fetchUsers, createTransaction } from '../api/admin';

export default function AdminTransactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Create transaction form
  const [userId, setUserId] = useState('');
  const [kind, setKind] = useState<'submit'|'openai'|'courier'>('submit');
  const [status, setStatus] = useState<'queued'|'processing'|'succeeded'|'failed'>('queued');
  const [detailsText, setDetailsText] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setTxs(await fetchTransactions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try { setUsers(await fetchUsers({} as any)); } catch {}
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-neutral-100">Create Transaction</h3>
        <div className="grid md:grid-cols-6 gap-2">
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="">Select user…</option>
            {users.map((u) => (<option key={u._id} value={u._id}>{u.email}</option>))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="submit">submit</option>
            <option value="openai">openai</option>
            <option value="courier">courier</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100">
            <option value="queued">queued</option>
            <option value="processing">processing</option>
            <option value="succeeded">succeeded</option>
            <option value="failed">failed</option>
          </select>
          <input value={detailsText} onChange={(e) => setDetailsText(e.target.value)} placeholder="Details (JSON)" className="px-3 py-2 rounded bg-neutral-950 border border-neutral-700 text-neutral-100 md:col-span-2" />
          <button
            className="btn"
            disabled={creating}
            onClick={async () => {
              setCreateError(null);
              setCreating(true);
              try {
                if (!userId) {
                  setCreateError('User is required');
                } else {
                  let details: Record<string, any> = {};
                  if (detailsText.trim()) {
                    try { details = JSON.parse(detailsText); } catch (e) { setCreateError('Details must be valid JSON'); setCreating(false); return; }
                  }
                  await createTransaction({ userId, kind, status, details });
                  setUserId('');
                  setKind('submit');
                  setStatus('queued');
                  setDetailsText('');
                  await load();
                }
              } catch (err: any) {
                setCreateError(err?.response?.data?.message || 'Failed to create transaction');
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
              <th className="p-2">Kind</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
              <th className="p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t._id} className="border-t border-neutral-800">
                <td className="p-2">{t.user?.email || '—'}</td>
                <td className="p-2">{t.kind}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-2"><pre className="bg-neutral-900 p-2 rounded overflow-x-auto">{JSON.stringify(t.details || {}, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-neutral-300 mt-4">Loading…</div>}
      </div>
    </div>
  );
}