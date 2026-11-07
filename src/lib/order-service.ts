import { supabaseAdmin } from './supabase-admin'
import { sendOrderPlacedEmail } from './email-service'

export interface PendingOrderPayload {
  order_number: string
  user_id?: number | string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  items: any[]
  subtotal: number
  shipping_fee: number
  total_amount: number
  cashfree_order_id: string
  cashfree_payment_session_id?: string
  payment_method?: string
}

function formatItemsSummary(items: any[]): string {
  return (items || [])
    .map((item) => {
      const name = item.name || 'Fragrance Extrait'
      const vol = item.volume_ml || 50
      const qty = item.quantity || 1
      const price = Number(item.price) || 0
      return `• ${name} (${vol}ml) × ${qty} — Rs. ${(price * qty).toLocaleString('en-IN')}`
    })
    .join('\n')
}

export interface PersistPaidOrderResult {
  created: boolean
  alreadyExisted: boolean
  order?: any
  error?: string
}

/**
 * Persist a successfully-paid order into the `orders` table.
 *
 * This is the ONLY place an order row is created. It runs after Cashfree confirms
 * payment (from /api/orders/verify or /api/orders/webhook), so unpaid/abandoned
 * checkouts never enter the database.
 *
 * Idempotent: if an order with the same order_number already exists, it is left
 * untouched and no duplicate email is sent. The caller that actually inserts the
 * row (created === true) is the one responsible for the confirmation email, which
 * this function sends automatically.
 */
export async function persistPaidOrder(payload: PendingOrderPayload): Promise<PersistPaidOrderResult> {
  if (!payload || !payload.order_number) {
    return { created: false, alreadyExisted: false, error: 'Missing order payload.' }
  }

  // 1. Idempotency guard — never create the same order twice.
  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status, order_status')
    .eq('order_number', payload.order_number)
    .maybeSingle()

  if (existing) {
    return { created: false, alreadyExisted: true, order: existing }
  }

  // 2. Insert the confirmed, paid order.
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: payload.order_number,
      user_id: payload.user_id || null,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      shipping_address: payload.shipping_address,
      items: JSON.stringify(payload.items || []),
      subtotal: payload.subtotal,
      shipping_fee: payload.shipping_fee,
      total_amount: payload.total_amount,
      payment_status: 'PAID',
      order_status: 'Placed',
      cashfree_order_id: payload.cashfree_order_id,
      cashfree_payment_session_id: payload.cashfree_payment_session_id || '',
      payment_method: payload.payment_method || 'Cashfree PG',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insErr) {
    // A concurrent request may have inserted it between our check and insert.
    // Treat a unique-violation as "already existed" rather than an error.
    const { data: raceExisting } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_number', payload.order_number)
      .maybeSingle()
    if (raceExisting) {
      return { created: false, alreadyExisted: true, order: raceExisting }
    }
    console.error('persistPaidOrder insert failed:', insErr)
    return { created: false, alreadyExisted: false, error: insErr.message }
  }

  // 3. Send the Order Placed confirmation email exactly once (only the creator does this).
  try {
    await sendOrderPlacedEmail({
      toEmail: payload.customer_email,
      customerName: payload.customer_name,
      orderNumber: payload.order_number,
      totalAmount: payload.total_amount,
      itemsSummary: formatItemsSummary(payload.items || []),
      shippingAddress: payload.shipping_address,
    })
  } catch (emailErr) {
    console.warn('Order placed email dispatch note:', emailErr)
  }

  return { created: true, alreadyExisted: false, order: inserted }
}
