import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const fromAppJson = {
  url: Constants?.expoConfig?.extra?.supabaseUrl,
  anonKey: Constants?.expoConfig?.extra?.supabaseAnonKey,
};

export const SUPABASE_URL =
  (fromAppJson.url as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

export const SUPABASE_ANON_KEY =
  (fromAppJson.anonKey as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const hasConfig = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

console.log('[supabase] url:', SUPABASE_URL || '<not set>');
console.log('[supabase] key exists:', !!SUPABASE_ANON_KEY);
console.log(
  '[supabase] key preview:',
  SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.slice(0, 8)}...` : '<not set>'
);

function makeMissingClient(msg: string): SupabaseClient {
  const handler = {
    get() {
      throw new Error(msg);
    },
    apply() {
      throw new Error(msg);
    },
    construct() {
      throw new Error(msg);
    },
  } as any;
  return new Proxy({}, handler) as SupabaseClient;
}

export const supabase: SupabaseClient = hasConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : makeMissingClient(
      'Supabase client not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or [app.json](http://_vscodecontentref_/0) extra) and restart Metro/Expo.'
    );

// Test simple : appelle auth.getSession() et retourne résultat (utile pour debug 401)
export async function testConnection(): Promise<{ ok: boolean; info: any }> {
  if (!hasConfig) return { ok: false, info: 'missing configuration' };
  try {
    const res = await supabase.auth.getSession();
    if (res.error) return { ok: false, info: res.error };
    return { ok: true, info: res.data };
  } catch (err) {
    return { ok: false, info: err };
  }
}
