import { supabaseAdmin } from './supabase-admin'

export interface AuditLogInput {
  action: string
  category: 'ORDER' | 'AUTH' | 'USER' | 'CATALOG' | 'SYSTEM'
  details: string
  user_email?: string | null
  status?: 'SUCCESS' | 'WARNING' | 'INFO' | 'ERROR'
}

/**
 * Persist an administrative, order, or security event to the `audit_logs` table.
 * Non-blocking: failures are logged as warnings so primary business flows never abort.
 */
export async function recordAuditLog(entry: AuditLogInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      action: entry.action,
      category: entry.category,
      details: entry.details,
      user_email: entry.user_email || 'System',
      status: entry.status || 'INFO',
      created_at: new Date().toISOString(),
    })
    if (error) {
      console.warn('Audit log insert note:', error.message)
    }
  } catch (err) {
    console.warn('Audit log write exception:', err)
  }
}
