import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://nrnudrucxixyvuoacchg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybnVkcnVjeGl4eXZ1b2FjY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjEwMjYsImV4cCI6MjA3MDM5NzAyNn0.PDSHvG_uwv90cgaAZTgtWuU0_k_NUVOqzf16SOcyhog";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', SUPABASE_URL);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'grocery-simplified-auth', // Use a unique storage key
  }
});