import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh the session when it expires
    autoRefreshToken: true,
    // Persist the session in localStorage
    persistSession: true,
    // Detect session in the URL for OAuth flows
    detectSessionInUrl: true,
  },
});

// Export types for convenience
export type { Session, User } from '@supabase/supabase-js';