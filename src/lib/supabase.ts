/* __backup__ 2025-08-12 15:30 */
// import { createClient } from '@supabase/supabase-js';
// 
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
// 
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL!;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!url || !anon) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

console.info('[AUTH] VITE_SUPABASE_URL =', url);
const ref = url.split('//')[1]?.split('.')[0];
console.info('[AUTH] project_ref =', ref);

export const supabase = createClient(url, anon);