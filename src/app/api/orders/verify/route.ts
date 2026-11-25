import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cashfreeService } from '@/lib/cashfree-service'
import { confirmPaidOrder, getAwaitingPaymentOrderFromAuditLog, persistPaidOrder, type PendingOrderPayload } from '@/lib/order-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order_number, cashfree_order_id } = body
    const pendingOrder: PendingOrderPayload | undefined = body.pending_order

    if (!order_number) {
      return NextResponse.json({ detail: 'Order number is required.' }, { status: 400 })
    }

    // 1. Check if the paid order is already recorded in `orders`
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('order_number, total_amount, payment_status, cashfree_order_id')
      .eq('order_number', order_number)
      .maybeSingle()

    if (existing && existing.payment_status === 'PAID') {
      return NextResponse.json({
        status: 'success',
        message: 'Order payment is already confirmed.',
        order_number: existing.order_number,
        total_amount: existing.total_amount,
      })
    }

    // Look up authoritative pending checkout recorded in audit_logs (never trusts client amounts)
    const awaitingPayload = await getAwaitingPaymentOrderFromAuditLog(order_number)

    // 2. Testing / Checking Mode: When PAYMENT=false, Cashfree verification is bypassed
    if (!cashfreeService.isPaymentEnabled) {
      const payloadToSave = awaitingPayload || pendingOrder
      const res = payloadToSave
        ? await persistPaidOrder({ ...payloadToSave, order_number })
        : { created: false, alreadyExisted: false, order: null }
      return NextResponse.json({
        status: 'success',
        message: 'Order confirmed in test mode (Cashfree bypassed).',
        order_number: order_number,
        total_amount: res.order?.total_amount ?? payloadToSave?.total_amount ?? 0,
      })
    }

    // Confirm the payment directly with Cashfree before recording anything.
    const cfOrderId =
      awaitingPayload?.cashfree_order_id ||
      existing?.cashfree_order_id ||
      cashfree_order_id ||
      pendingOrder?.cashfree_order_id ||
      `cf_${order_number}`
    const { isPaid, paymentStatus, orderAmount } = await cashfreeService.verifyPayment(cfOrderId)

    if (!isPaid) {
      const stillOpen = ['ACTIVE', 'PENDING', 'NOT_ATTEMPTED', 'INCOMPLETE', ''].includes(paymentStatus)
      return NextResponse.json(
        {
          detail: stillOpen
            ? `Payment is not complete yet. Cashfree status: ${paymentStatus || 'ACTIVE'}`
            : `Payment verification failed: status is ${paymentStatus}`,
        },
        { status: 400 }
      )
    }

    // Verify paid amount matches server-recorded checkout total
    const expectedTotal = awaitingPayload?.total_amount ?? existing?.total_amount
    if (expectedTotal !== undefined && orderAmount !== undefined && orderAmount > 0 && orderAmount + 0.01 < Number(expectedTotal)) {
      console.error(`Amount mismatch for ${order_number}: Cashfree paid ${orderAmount}, expected ${expectedTotal}`)
      return NextResponse.json(
        { detail: 'Payment amount mismatch detected. Please contact support.' },
        { status: 400 }
      )
    }

    // Payment confirmed. Insert the PAID order into `orders` (only paid orders ever enter `orders`).
    const result = await confirmPaidOrder(
      order_number,
      pendingOrder ? { ...pendingOrder, order_number } : undefined
    )

    if (result.error) {
      return NextResponse.json({ detail: 'Payment received, but the order could not be recorded.' }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified and order confirmed successfully.',
      order_number,
      total_amount: result.order?.total_amount ?? pendingOrder?.total_amount ?? 0,
    })
  } catch (err: any) {
    console.error('Error in verify payment API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}
