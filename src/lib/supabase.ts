import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://timevtekqomblzriwjwk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zUHhK1zfeacMSDgyQpWGbg_TONniov7';

export const isSupabaseConfigured = true;

// Create the Supabase client using the keys provided
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

