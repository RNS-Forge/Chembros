import { NextResponse } from 'next/server'
import { cashfreeService } from '@/lib/cashfree-service'
import { confirmPaidOrder } from '@/lib/order-service'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-cf-signature') || ''
    const timestamp = req.headers.get('x-webhook-timestamp') || req.headers.get('x-cf-timestamp') || ''

    // 1. Strict Cryptographic Signature Verification
    if (!signature || !timestamp) {
      console.warn('Rejected webhook: missing Cashfree signature or timestamp headers.')
      return NextResponse.json({ detail: 'Missing required webhook signature headers' }, { status: 401 })
    }

    const isValid = cashfreeService.verifyWebhookSignature(rawBody, signature, timestamp)
    if (!isValid) {
      console.warn('Unauthorized webhook signature mismatch from Cashfree gateway.')
      return NextResponse.json({ detail: 'Invalid webhook signature' }, { status: 401 })
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

    const result = await confirmPaidOrder(orderNumber)
    if (result.error) {
      console.error(`Webhook could not confirm order ${orderNumber}:`, result.error)
      return NextResponse.json({ success: false, detail: result.error }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      message: result.alreadyExisted ? 'Order already confirmed.' : 'Webhook processed successfully',
    })
  } catch (err: any) {
    console.error('Error handling Cashfree webhook:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}
