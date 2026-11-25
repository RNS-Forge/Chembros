import { supabaseAdmin } from './supabase-admin'
import { sendOrderPlacedEmail } from './email-service'
import { recordAuditLog } from './audit-log-service'

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
 * Log an `Awaiting Payment` checkout attempt in `audit_logs` (NOT in `orders`).
 * The `orders` table strictly stores ONLY paid & confirmed orders.
 * Storing the serialized payload inside `audit_logs` lets Cashfree webhooks
 * recover and confirm the paid order even if a customer closes their browser after UPI payment.
 */
export async function saveAwaitingPaymentOrder(payload: PendingOrderPayload): Promise<{ saved: boolean; error?: string }> {
  if (!payload || !payload.order_number) {
    return { saved: false, error: 'Missing order payload.' }
  }

  try {
    const summary = formatItemsSummary(payload.items || []).replace(/\n/g, '; ')
    const readable = `Order #${payload.order_number} awaiting payment (₹${Number(payload.total_amount).toLocaleString('en-IN')}) by ${payload.customer_name} (${payload.customer_phone}) — ${summary} | Ship to: ${payload.shipping_address}`
    const detailsWithPayload = `${readable} <!--PENDING:${JSON.stringify(payload)}-->`

    const { error: insErr } = await supabaseAdmin.from('audit_logs').insert({
      action: 'ORDER_AWAITING_PAYMENT',
      category: 'ORDER',
      details: detailsWithPayload,
      user_email: payload.customer_email,
      status: 'INFO',
      created_at: new Date().toISOString(),
    })

    if (insErr) {
      console.warn('saveAwaitingPaymentOrder audit_logs note:', insErr.message)
      return { saved: false, error: insErr.message }
    }

    return { saved: true }
  } catch (err: any) {
    console.warn('saveAwaitingPaymentOrder exception:', err?.message || err)
    return { saved: false, error: err?.message || 'Audit log error' }
  }
}

/**
 * Retrieve the server-recorded pending checkout payload from `audit_logs` for webhook/verify confirmation.
 */
export async function getAwaitingPaymentOrderFromAuditLog(orderNumber: string): Promise<PendingOrderPayload | null> {
  if (!orderNumber) return null
  try {
    const cleanNum = orderNumber.replace(/^#/, '').trim()
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('details')
      .eq('action', 'ORDER_AWAITING_PAYMENT')
      .ilike('details', `%Order #${cleanNum} %`)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data?.details) return null
    const match = String(data.details).match(/<!--PENDING:([\s\S]*?)-->/)
    if (!match || !match[1]) return null
    return JSON.parse(match[1]) as PendingOrderPayload
  } catch (err) {
    console.warn('Could not parse pending order from audit_logs:', err)
    return null
  }
}

/**
 * Confirm a paid order by order_number (and optional fallback payload).
 * Resolves the authoritative pending payload from `audit_logs` (or fallbackPayload),
 * inserts the confirmed `PAID` / `Placed` row into `orders`, and sends the confirmation email once.
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

  if (existing && existing.payment_status === 'PAID') {
    return { created: false, alreadyExisted: true, order: existing }
  }

  const serverPayload = await getAwaitingPaymentOrderFromAuditLog(orderNumber)
  const payloadToPersist = serverPayload || fallbackPayload

  if (!payloadToPersist) {
    return { created: false, alreadyExisted: false, error: 'Order record not found and no pending checkout payload available.' }
  }

  return persistPaidOrder({ ...payloadToPersist, order_number: orderNumber })
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

  await recordAuditLog({
    action: 'ORDER_PAID_CONFIRMED',
    category: 'ORDER',
    details: `Order #${payload.order_number} confirmed (₹${Number(payload.total_amount).toLocaleString('en-IN')}) for ${payload.customer_name || payload.customer_email}.`,
    user_email: payload.customer_email,
    status: 'SUCCESS',
  })

  return { created: true, alreadyExisted: false, order: inserted }
}
