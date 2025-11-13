import api from './axios';

export async function extractCustomers(text: string): Promise<{ customers: Array<{
  serial?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}> }> {
  const { data } = await api.post('/api/openai/extract-customers', { text });
  return data;
}