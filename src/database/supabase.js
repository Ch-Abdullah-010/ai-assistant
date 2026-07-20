import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

let client = null;

export function getSupabaseClient() {
  if (client) return client;

  const { url, serviceKey } = config.supabase;
  if (!url || !url.startsWith('http')) {
    throw new Error('Supabase URL not configured. Set SUPABASE_URL in your .env file.');
  }
  if (!serviceKey) {
    throw new Error('Supabase service key not configured. Set SUPABASE_SERVICE_KEY in your .env file.');
  }

  client = createClient(url, serviceKey);
  return client;
}

export default getSupabaseClient;
