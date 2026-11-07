import { NextResponse } from 'next/server'
import { cashfreeService } from '@/lib/cashfree-service'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderPlacedEmail } from '@/lib/email-service'

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

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-cf-signature') || ''
    const timestamp = req.headers.get('x-webhook-timestamp') || req.headers.get('x-cf-timestamp') || ''

    // 1. Strict Cryptographic Signature Verification
    if (signature && timestamp) {
      const isValid = cashfreeService.verifyWebhookSignature(rawBody, signature, timestamp)
      if (!isValid) {
        console.warn('Unauthorized webhook signature mismatch from Cashfree gateway.')
        return NextResponse.json({ detail: 'Invalid webhook signature' }, { status: 401 })
      }
    }

    let payload: any = {}
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ detail: 'Invalid JSON payload' }, { status: 400 })
    }

    const eventType = payload.type || ''
    const orderData = payload.data?.order || {}
    const paymentData = payload.data?.payment || {}

    const cfOrderId = String(orderData.order_id || payload.order_id || '')
    const paymentStatus = String(
      paymentData.payment_status || orderData.order_status || payload.event || ''
    ).toUpperCase()

    if (!cfOrderId) {
      return NextResponse.json({ detail: 'No order identifier found in webhook payload' }, { status: 200 })
    }

    const orderNumber = cfOrderId.startsWith('cf_') ? cfOrderId.replace(/^cf_/, '') : cfOrderId

    const isSuccess =
      eventType.includes('PAYMENT_SUCCESS') ||
      eventType.includes('ORDER_PAID') ||
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'PAID'

    if (!isSuccess) {
      // Non-success events are ignored — nothing is recorded for unpaid orders.
      return NextResponse.json({ success: true, message: 'Event acknowledged (no action).' })
    }

    // Only paid orders are persisted. The browser-return /verify call is the primary
    // creator (it carries the full item/customer payload). The webhook is a safety net:
    // if the order row already exists we ensure it is marked PAID; if it does not exist
    // yet, Cashfree will retry and the /verify call will create it shortly.
    const { data: order, error: findErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .or(`order_number.eq.${orderNumber},cashfree_order_id.eq.${cfOrderId}`)
      .maybeSingle()

    if (findErr || !order) {
      console.warn(
        `Webhook received for ${cfOrderId} but no order row exists yet. ` +
          `Awaiting the customer's return (/api/orders/verify) to persist it, or a webhook retry.`
      )
      return NextResponse.json({ success: true, message: 'Awaiting order persistence.' }, { status: 200 })
    }

    if (order.payment_status === 'PAID') {
      return NextResponse.json({ success: true, message: 'Order already confirmed.' })
    }

    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'PAID',
        order_status: 'Placed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .neq('payment_status', 'PAID')
      .select('id')

    if (claimErr) {
      console.error('Webhook failed to mark order paid:', claimErr)
      return NextResponse.json({ success: false }, { status: 200 })
    }

    if (claimed && claimed.length > 0) {
      let itemsList: any[] = []
      try {
        itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []
      } catch {
        itemsList = []
      }

      try {
        await sendOrderPlacedEmail({
          toEmail: order.customer_email,
          customerName: order.customer_name,
          orderNumber: order.order_number,
          totalAmount: order.total_amount,
          itemsSummary: formatItemsSummary(itemsList),
          shippingAddress: order.shipping_address,
        })
      } catch (mailErr) {
        console.warn('Webhook payment email dispatch notice:', mailErr)
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })
  } catch (err: any) {
    console.error('Error handling Cashfree webhook:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}
