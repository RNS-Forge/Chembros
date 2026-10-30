import { createClient } from '@supabase/supabase-js'
import { serverConfig } from './server-config'

const secret = serverConfig.SUPABASE_SECRET_KEY
const key =
  secret && !secret.includes('sb_secret_jxKT2') && secret.length > 20
    ? secret
    : serverConfig.SUPABASE_PUBLISHABLE_KEY

export const supabaseAdmin = createClient(serverConfig.SUPABASE_URL, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
