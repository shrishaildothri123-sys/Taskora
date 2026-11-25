import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'taskora_supabase_url';
const STORAGE_ANON_KEY = 'taskora_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

  const localUrl = localStorage.getItem(STORAGE_URL_KEY) ?? '';
  const localKey = localStorage.getItem(STORAGE_ANON_KEY) ?? '';

  const url = (localUrl || envUrl || '').trim();
  const anonKey = (localKey || envKey || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  cachedClient = null; // Reset cached client
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = (testUrl ?? getSupabaseConfig().url).trim();
    const key = (testKey ?? getSupabaseConfig().anonKey).trim();

    if (!url || !key) {
      return { success: false, message: 'Supabase URL or Anon Key is missing.' };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }

    const client = createClient(url, key);
    // Ping by checking projects or tasks table
    const { error } = await client.from('projects').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message:
            'Connected to Supabase, but tables are not created yet! Please run the schema.sql in Supabase SQL Editor.',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}

