import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Récupère les valeurs depuis app.json (extra)
const SUPABASE_URL = Constants?.expoConfig?.extra?.supabaseUrl;
const SUPABASE_ANON_KEY = Constants?.expoConfig?.extra?.supabaseAnonKey;

const hasConfig = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

console.log('[supabaseClient] url:', SUPABASE_URL || '<not set>');
console.log('[supabaseClient] key exists:', !!SUPABASE_ANON_KEY);
console.log('[supabaseClient] key preview:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.slice(0, 8) + '...' : '<not set>');

// Client “vide” si config manquante
function makeMissingClient(msg: string): SupabaseClient {
  const handler = {
    get() {
      throw new Error(msg);
    },
  } as any;
  return new Proxy({}, handler) as SupabaseClient;
}

// Export du client Supabase
export const supabaseClient: SupabaseClient = hasConfig
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : makeMissingClient(
      'Supabase client not configured. Définis supabaseUrl et supabaseAnonKey dans app.json extra.'
    );

// Accès sécurisé au client
export function getSupabaseClient(): SupabaseClient {
  if (!hasConfig) {
    throw new Error(
      'Supabase client not configured. Définis supabaseUrl et supabaseAnonKey dans app.json extra.'
    );
  }
  return supabaseClient;
}

// Wrappers pratiques
export async function signInClient(email: string, password: string) {
  return getSupabaseClient().auth.signInWithPassword({ email, password });
}

export async function signUpClient(email: string, password: string) {
  // @ts-ignore
  if (typeof getSupabaseClient().auth.signUpWithPassword === 'function') {
    // @ts-ignore
    return getSupabaseClient().auth.signUpWithPassword({ email, password });
  }
  // fallback pour anciennes versions
  // @ts-ignore
  return getSupabaseClient().auth.signUp({ email, password });
}
