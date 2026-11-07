import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cashfreeService } from '@/lib/cashfree-service'
import { sendOrderPlacedEmail } from '@/lib/email-service'

function formatItemsSummary(items: any[]): string {
  return items
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
    const body = await req.json()
    const { order_number, cashfree_order_id } = body

    if (!order_number) {
      return NextResponse.json({ detail: 'Order number is required.' }, { status: 400 })
    }

    const { data: order, error: findErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', order_number)
      .maybeSingle()

    if (findErr || !order) {
      return NextResponse.json({ detail: 'Order not found.' }, { status: 404 })
    }

    if (order.payment_status === 'PAID') {
      return NextResponse.json({
        status: 'success',
        message: 'Order payment is already confirmed.',
        order_number: order.order_number,
        total_amount: order.total_amount,
      })
    }

    const cfOrderId = cashfree_order_id || order.cashfree_order_id || `cf_${order.order_number}`
    const { isPaid, paymentStatus } = await cashfreeService.verifyPayment(cfOrderId)

    if (!isPaid) {
      const stillOpen = ['ACTIVE', 'PENDING', 'NOT_ATTEMPTED', 'INCOMPLETE', ''].includes(paymentStatus)
      if (!stillOpen) {
        await supabaseAdmin
          .from('orders')
          .update({ payment_status: 'FAILED', updated_at: new Date().toISOString() })
          .eq('id', order.id)
          .neq('payment_status', 'PAID')
      }
      return NextResponse.json(
        { detail: stillOpen ? `Payment is not complete yet. Cashfree status: ${paymentStatus || 'ACTIVE'}` : `Payment verification failed: status is ${paymentStatus}` },
        { status: 400 }
      )
    }

    // Only the request that flips PENDING -> PAID sends the confirmation mail.
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
      console.error('Failed to mark order paid:', claimErr)
      return NextResponse.json({ detail: 'Payment was received, but the order could not be updated.' }, { status: 500 })
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
      } catch (emailErr) {
        console.warn('Payment confirmed email dispatch note:', emailErr)
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified and order confirmed successfully.',
      order_number: order.order_number,
      total_amount: order.total_amount,
    })
  } catch (err: any) {
    console.error('Error in verify payment API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

