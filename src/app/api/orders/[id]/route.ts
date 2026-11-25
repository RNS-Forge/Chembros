import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromAuthHeader } from '@/lib/auth-service'

function formatOrder(row: any, isFullAccess = true) {
  let parsedItems = []
  if (typeof row.items === 'string') {
    try {
      parsedItems = JSON.parse(row.items)
    } catch {
      parsedItems = []
    }
  } else if (Array.isArray(row.items)) {
    parsedItems = row.items
  }

  // Mask sensitive PII for unauthenticated receipt views to prevent data harvesting
  const maskedEmail = isFullAccess || !row.customer_email
    ? row.customer_email
    : row.customer_email.replace(/^(.{2})(.*)(@.*)$/, (_: string, a: string, b: string, c: string) => `${a}${'•'.repeat(Math.min(b.length, 5))}${c}`)

  const maskedPhone = isFullAccess || !row.customer_phone
    ? row.customer_phone
    : row.customer_phone.replace(/(\d{2})\d{4,6}(\d{2})/, '$1••••••$2')

  const maskedAddress = isFullAccess || !row.shipping_address
    ? row.shipping_address
    : row.shipping_address.replace(/^([^,]+),?/, '••••••••••••,')

  return {
    id: isFullAccess ? row.id : undefined,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_email: maskedEmail,
    customer_phone: maskedPhone,
    shipping_address: maskedAddress,
    items: parsedItems,
    subtotal: Number(row.subtotal) || 0,
    shipping_fee: Number(row.shipping_fee) || 0,
    total_amount: Number(row.total_amount) || 0,
    payment_status: row.payment_status || 'PENDING',
    payment_method: row.payment_method || (row.payment_status === 'PENDING_COD' ? 'Cash on Delivery' : 'Online Pre-Payment'),
    delivery_method: row.delivery_method || 'Standard',
    order_status: row.order_status || 'Placed',
    tracking_number: row.tracking_number,
    created_at: row.created_at || new Date().toISOString(),
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ detail: 'Order identifier is required.' }, { status: 400 })
    }

    const cleanId = id.trim()
    const orderId = Number(cleanId)
    const isNumericId = !isNaN(orderId) && orderId > 0 && String(orderId) === cleanId

    const currentUser = await getUserFromAuthHeader(req)
    const isAdmin = currentUser?.role === 'admin'

    // 1. Direct numeric ID lookup (e.g. /api/orders/26) strictly requires admin authorization
    // to prevent sequential enumeration attacks against the orders database.
    if (isNumericId && !isAdmin) {
      return NextResponse.json(
        { detail: 'Unauthorized. Numeric ID lookup requires administrative privileges.' },
        { status: 403 }
      )
    }

    let query = supabaseAdmin.from('orders').select('*')
    if (isNumericId) {
      query = query.eq('id', orderId)
    } else {
      query = query.eq('order_number', cleanId)
    }

    const { data: order, error } = await query.maybeSingle()
    if (error || !order) {
      return NextResponse.json({ detail: 'Order not found.' }, { status: 404 })
    }

    // 2. Ownership verification
    const isOwner = currentUser && (
      isAdmin ||
      (order.user_id && Number(currentUser.id) === Number(order.user_id)) ||
      (currentUser.email && order.customer_email && currentUser.email.toLowerCase() === order.customer_email.toLowerCase())
    )

    // If order is linked to a registered account, require the owner or admin to be authenticated
    if (order.user_id && !isOwner) {
      return NextResponse.json(
        { detail: 'Unauthorized. Please sign in to view this order.' },
        { status: 403 }
      )
    }

    return NextResponse.json(formatOrder(order, Boolean(isOwner)))
  } catch (err: any) {
    console.error('Error in order detail API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

