import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = (
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://sbbqxtqiuafjceayaigp.supabase.co'
).trim()

export const SUPABASE_KEY = (
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)) ||
  'sb_publishable_M1Ag1eRpUvWdBWJI55_79g_uLj5sop7'
).trim()

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
