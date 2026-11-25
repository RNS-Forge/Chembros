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
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (body.price !== undefined) updatePayload.price = Number(body.price) || 0
    if (body.original_price !== undefined) updatePayload.original_price = Number(body.original_price) || 0
    if (body.delivery_fee !== undefined) updatePayload.delivery_fee = Number(body.delivery_fee) || 0

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }
    await recordAuditLog({
      action: 'PRODUCT_PRICE_UPDATED',
      category: 'CATALOG',
      details: `Updated pricing for product #${id} (${data?.name || ''}) to ₹${data?.price}.`,
      user_email: user.email,
      status: 'INFO',
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

