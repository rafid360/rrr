import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { extractCustomers } from '../api/openai';

export default function UserHome() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Array<any>>([]);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await extractCustomers(text);
      setCustomers(Array.isArray(res.customers) ? res.customers : []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to extract customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">Welcome</h2>
      <p className="text-neutral-300">Hello, {user?.name || 'User'}.</p>

      <div className="mt-4">
        <label className="block text-sm text-neutral-300 mb-1">Customer information (unstructured)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste or type customer info in any format…"
          className="w-full rounded-md bg-neutral-950 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <div className="mt-2 flex items-center gap-2">
          <button className="btn" onClick={onSubmit} disabled={loading || !text.trim()}>
            {loading ? 'Submitting…' : 'Submit'}
          </button>
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </div>

      {/* Results table */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Extracted Customers</h3>
        {customers.length === 0 ? (
          <p className="text-neutral-400 text-sm">No results yet. Submit text to see extracted data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-neutral-800 rounded">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-3 py-2 text-left text-sm">Serial</th>
                  <th className="px-3 py-2 text-left text-sm">Name</th>
                  <th className="px-3 py-2 text-left text-sm">Phone</th>
                  <th className="px-3 py-2 text-left text-sm">Email</th>
                  <th className="px-3 py-2 text-left text-sm">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr key={idx} className="odd:bg-neutral-900 even:bg-neutral-950 border-t border-neutral-800">
                    <td className="px-3 py-2 text-sm">{c.serial || ''}</td>
                    <td className="px-3 py-2 text-sm">{c.name || ''}</td>
                    <td className="px-3 py-2 text-sm">{c.phone || ''}</td>
                    <td className="px-3 py-2 text-sm">{c.email || ''}</td>
                    <td className="px-3 py-2 text-sm">
                      {[
                        c?.address?.line1,
                        c?.address?.line2,
                        c?.address?.city,
                        c?.address?.state,
                        c?.address?.postal_code,
                        c?.address?.country,
                      ].filter(Boolean).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}