import { createClient } from '@supabase/supabase-js'
import { serverConfig } from './server-config'

const key = serverConfig.SUPABASE_SECRET_KEY || serverConfig.SUPABASE_PUBLISHABLE_KEY

export const supabaseAdmin = createClient(serverConfig.SUPABASE_URL, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

