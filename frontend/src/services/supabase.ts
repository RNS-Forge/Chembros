import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL || 'https://sbbqxtqiuafjceayaigp.supabase.co'
).trim()

export const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_M1Ag1eRpUvWdBWJI55_79g_uLj5sop7'
).trim()

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
