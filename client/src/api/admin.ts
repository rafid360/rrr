import api from './axios';

// Users
export async function fetchUsers(params?: { search?: string; status?: 'active' | 'suspended' }) {
  const { data } = await api.get('/api/admin/users', { params });
  return data as Array<{ _id: string; name: string; email: string; role: 'user'|'admin'; suspended: boolean; package?: { _id: string; name: string; dailyLimit: number } }>;
}

export async function setUserSuspended(id: string, suspended: boolean) {
  const { data } = await api.patch(`/api/admin/users/${id}/suspend`, { suspended });
  return data;
}

export async function assignUserPackage(id: string, packageId: string) {
  const { data } = await api.patch(`/api/admin/users/${id}/package`, { packageId });
  return data;
}

export async function createUser(payload: { name: string; email: string; password: string; packageId?: string }) {
  const { data } = await api.post(`/api/admin/users`, payload);
  return data;
}

// Packages
export async function fetchPackages() {
  const { data } = await api.get('/api/admin/packages');
  return data as Array<{ _id: string; name: string; dailyLimit: number; priceMonthly: number; active: boolean }>;
}

export async function updatePackage(id: string, payload: Partial<{ name: string; dailyLimit: number; priceMonthly: number; active: boolean }>) {
  const { data } = await api.patch(`/api/admin/packages/${id}`, payload);
  return data;
}

export async function createPackage(payload: { name: string; dailyLimit: number; priceMonthly: number; active?: boolean }) {
  const { data } = await api.post(`/api/admin/packages`, payload);
  return data;
}

// Payments
export async function fetchPayments() {
  const { data } = await api.get('/api/admin/payments');
  return data as Array<any>;
}

export async function createPayment(payload: { userId: string; packageId?: string; amount: number; currency?: string; provider?: string; status?: string; reference?: string }) {
  const { data } = await api.post(`/api/admin/payments`, payload);
  return data;
}

// Transactions
export async function fetchTransactions() {
  const { data } = await api.get('/api/admin/transactions');
  return data as Array<any>;
}

export async function createTransaction(payload: { userId: string; kind: 'submit'|'openai'|'courier'; status?: 'queued'|'processing'|'succeeded'|'failed'; details?: Record<string, any> }) {
  const { data } = await api.post(`/api/admin/transactions`, payload);
  return data;
}