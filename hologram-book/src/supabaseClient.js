import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing!');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

if (supabaseUrl && (supabaseUrl.includes('your-project') || supabaseUrl === 'https://your-project.supabase.co')) {
  console.error('Please update your Supabase URL in the .env file');
}

if (supabaseAnonKey && supabaseAnonKey.includes('your-anon-key')) {
  console.error('Please update your Supabase anon key in the .env file');
}

console.log('Supabase client initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
