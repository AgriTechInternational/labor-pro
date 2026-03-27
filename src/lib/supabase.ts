import { createClient } from '@supabase/supabase-js';

// AgriTech Pro: Supabase Connection
// Replace with your project details from Step 3 of the Migration Plan
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const tables = {
    ATTENDANCE: 'attendance',
    PRODUCTION: 'production'
};
