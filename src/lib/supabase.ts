import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    '[SpeakAI] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing in .env! Please make sure your .env file contains these variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
