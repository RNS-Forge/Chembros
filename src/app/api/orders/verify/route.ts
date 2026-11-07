import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cashfreeService } from '@/lib/cashfree-service'
import { persistPaidOrder, type PendingOrderPayload } from '@/lib/order-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order_number, cashfree_order_id } = body
    const pendingOrder: PendingOrderPayload | undefined = body.pending_order

    if (!order_number) {
      return NextResponse.json({ detail: 'Order number is required.' }, { status: 400 })
    }

    // If the order already exists (e.g. webhook beat us to it), it's already paid & recorded.
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

    // Payment confirmed. Persist the order now (only paid orders ever reach the DB).
    if (!pendingOrder) {
      return NextResponse.json(
        { detail: 'Payment confirmed, but order details were missing. Please contact support with your order number.' },
        { status: 400 }
      )
    }

    // Trust the server-verified amount/number; keep the client payload for the rest.
    const result = await persistPaidOrder({ ...pendingOrder, order_number })

    if (result.error) {
      return NextResponse.json({ detail: 'Payment received, but the order could not be recorded.' }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified and order confirmed successfully.',
      order_number,
      total_amount: pendingOrder.total_amount,
    })
  } catch (err: any) {
    console.error('Error in verify payment API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}
