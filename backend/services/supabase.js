const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

// For development/testing, use anon key if service role key is not available
const keyToUse = supabaseServiceKey && supabaseServiceKey !== 'your_service_role_key_here' 
  ? supabaseServiceKey 
  : supabaseAnonKey;

if (!keyToUse) {
  throw new Error('Missing Supabase keys - need either SERVICE_ROLE_KEY or ANON_KEY');
}

console.log('Supabase configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Using key type:', supabaseServiceKey && supabaseServiceKey !== 'your_service_role_key_here' ? 'SERVICE_ROLE' : 'ANON');

// Service role client for backend operations
const supabase = createClient(supabaseUrl, keyToUse, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for user-specific operations
const createUserClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey || keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

module.exports = {
  supabase,
  createUserClient
};
