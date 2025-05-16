
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// The URL and key will be provided by the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
