import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cashfreeService } from '@/lib/cashfree-service'
import { confirmPaidOrder, type PendingOrderPayload } from '@/lib/order-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order_number, cashfree_order_id } = body
    const pendingOrder: PendingOrderPayload | undefined = body.pending_order

    if (!order_number) {
      return NextResponse.json({ detail: 'Order number is required.' }, { status: 400 })
    }

    // 1. If the order already exists (e.g. created in test mode or webhook beat us to it), it's already paid & recorded.
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('order_number, total_amount, payment_status')
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

    // 2. Testing / Checking Mode: When PAYMENT=false, Cashfree verification is bypassed
    if (!cashfreeService.isPaymentEnabled) {
      if (pendingOrder) {
        await persistPaidOrder(pendingOrder)
      }
      return NextResponse.json({
        status: 'success',
        message: 'Order confirmed in test mode (Cashfree bypassed).',
        order_number: order_number,
        total_amount: pendingOrder?.total_amount || 0,
      })
    }

    // Confirm the payment directly with Cashfree before recording anything.
    const cfOrderId = cashfree_order_id || pendingOrder?.cashfree_order_id || `cf_${order_number}`
    const { isPaid, paymentStatus } = await cashfreeService.verifyPayment(cfOrderId)

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

    // Payment confirmed. Atomically promote the Awaiting Payment row to PAID / Placed
    // (or insert using pendingOrder if no row existed).
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
