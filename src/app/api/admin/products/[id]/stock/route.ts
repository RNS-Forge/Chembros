import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromAuthHeader } from '@/lib/auth-service'
import { recordAuditLog } from '@/lib/audit-log-service'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromAuthHeader(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }
    const { id } = await params
    const body = await req.json()
    const stock = Math.max(0, Number(body.stock) || 0)

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ stock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }
    await recordAuditLog({
      action: 'PRODUCT_STOCK_UPDATED',
      category: 'CATALOG',
      details: `Updated stock for product #${id} (${data?.name || ''}) to ${stock} units.`,
      user_email: user.email,
      status: 'INFO',
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

