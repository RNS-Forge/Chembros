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
 * Save an order in `Awaiting Payment` state at checkout initiation (/api/orders/create).
 * Hidden from admin orders, stats, and customer my-orders until payment is confirmed.
 * Guarantees that if the customer completes UPI/mobile payment and closes the browser,
 * the Cashfree webhook still has the full items & shipping address to confirm the order.
 */
export async function saveAwaitingPaymentOrder(payload: PendingOrderPayload): Promise<{ saved: boolean; error?: string }> {
  if (!payload || !payload.order_number) {
    return { saved: false, error: 'Missing order payload.' }
  }

  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('order_number', payload.order_number)
    .maybeSingle()

  if (existing) {
    return { saved: true }
  }

  const { error: insErr } = await supabaseAdmin
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
      payment_status: 'PENDING',
      order_status: 'Awaiting Payment',
      cashfree_order_id: payload.cashfree_order_id,
      cashfree_payment_session_id: payload.cashfree_payment_session_id || '',
      payment_method: payload.payment_method || 'Cashfree PG',
      created_at: new Date().toISOString(),
    })

  if (insErr) {
    console.error('saveAwaitingPaymentOrder insert failed:', insErr)
    return { saved: false, error: insErr.message }
  }

  return { saved: true }
}

/**
 * Confirm a paid order by order_number (and optional fallback payload).
 * Atomically transitions an `Awaiting Payment` row to `PAID` / `Placed`,
 * or inserts a new `PAID` row if none existed.
 * Idempotent: confirmation email is dispatched exactly once.
 */
export async function confirmPaidOrder(
  orderNumber: string,
  fallbackPayload?: PendingOrderPayload
): Promise<PersistPaidOrderResult> {
  if (!orderNumber) {
    return { created: false, alreadyExisted: false, error: 'Missing order number.' }
  }

  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('*')
    .or(`order_number.eq.${orderNumber},cashfree_order_id.eq.cf_${orderNumber}`)
    .maybeSingle()

  if (existing) {
    if (existing.payment_status === 'PAID') {
      return { created: false, alreadyExisted: true, order: existing }
    }

    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'PAID',
        order_status: 'Placed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .neq('payment_status', 'PAID')
      .select()

    if (claimErr) {
      console.error('confirmPaidOrder update failed:', claimErr)
      return { created: false, alreadyExisted: false, error: claimErr.message }
    }

    if (!claimed || claimed.length === 0) {
      return { created: false, alreadyExisted: true, order: existing }
    }

    const confirmedOrder = claimed[0]
    let itemsList: any[] = []
    try {
      itemsList = typeof confirmedOrder.items === 'string' ? JSON.parse(confirmedOrder.items) : confirmedOrder.items || []
    } catch {
      itemsList = []
    }

    try {
      await sendOrderPlacedEmail({
        toEmail: confirmedOrder.customer_email,
        customerName: confirmedOrder.customer_name,
        orderNumber: confirmedOrder.order_number,
        totalAmount: confirmedOrder.total_amount,
        itemsSummary: formatItemsSummary(itemsList),
        shippingAddress: confirmedOrder.shipping_address,
      })
    } catch (emailErr) {
      console.warn('Order placed email dispatch note:', emailErr)
    }

    return { created: true, alreadyExisted: false, order: confirmedOrder }
  }

  if (!fallbackPayload) {
    return { created: false, alreadyExisted: false, error: 'Order record not found and no fallback payload provided.' }
  }

  return persistPaidOrder({ ...fallbackPayload, order_number: orderNumber })
}

/**
 * Persist a successfully-paid order into the `orders` table.
 *
 * Idempotent: if an order with the same order_number already exists, it transitions
 * any `Awaiting Payment` row to `PAID` or leaves an already-`PAID` row untouched.
 */
export async function persistPaidOrder(payload: PendingOrderPayload): Promise<PersistPaidOrderResult> {
  if (!payload || !payload.order_number) {
    return { created: false, alreadyExisted: false, error: 'Missing order payload.' }
  }

  // 1. Idempotency / upgrade guard
  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status, order_status')
    .eq('order_number', payload.order_number)
    .maybeSingle()

  if (existing) {
    if (existing.payment_status === 'PAID') {
      return { created: false, alreadyExisted: true, order: existing }
    }
    return confirmPaidOrder(payload.order_number, payload)
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
