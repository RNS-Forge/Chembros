import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderStatusEmail } from '@/lib/email-service'
import { getUserFromAuthHeader } from '@/lib/auth-service'

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
    const { order_id, reason } = body

    if (!order_id) {
      return NextResponse.json({ detail: 'Order ID or order number is required.' }, { status: 400 })
    }

    const orderNum = Number(order_id)
    let findQuery = supabaseAdmin.from('orders').select('*')
    if (isNaN(orderNum)) {
      findQuery = findQuery.eq('order_number', String(order_id))
    } else {
      findQuery = findQuery.or(`id.eq.${orderNum},order_number.eq.${order_id}`)
    }

    const { data: order, error: findErr } = await findQuery.maybeSingle()
    if (findErr || !order) {
      return NextResponse.json({ detail: 'Order not found.' }, { status: 404 })
    }

    // Optional user authorization check if bearer token is present
    const currentUser = await getUserFromAuthHeader(req)
    if (currentUser && currentUser.role !== 'admin' && order.user_id && order.user_id !== currentUser.id && order.customer_email.toLowerCase() !== currentUser.email.toLowerCase()) {
      return NextResponse.json({ detail: 'You are not authorized to cancel this order.' }, { status: 403 })
    }

    const currentStatusUpper = (order.order_status || '').toUpperCase()
    if (currentStatusUpper === 'CANCELLED') {
      return NextResponse.json({
        success: true,
        message: 'Order is already cancelled.',
        order,
      })
    }

    if (currentStatusUpper === 'SHIPPED' || currentStatusUpper === 'DELIVERED') {
      return NextResponse.json(
        { detail: 'Cannot cancel an order that has already been dispatched or delivered. Please reach out to customer concierge for returns.' },
        { status: 400 }
      )
    }

    // Update status to Cancelled in Supabase
    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        order_status: 'Cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .single()

    if (updateErr) {
      console.error('Error updating order cancellation:', updateErr)
      return NextResponse.json({ detail: updateErr.message }, { status: 500 })
    }

    let itemsList: any[] = []
    try {
      itemsList = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items || []
    } catch {
      itemsList = []
    }

    // Dispatch Order Status Update email notification
    try {
      await sendOrderStatusEmail({
        toEmail: updatedOrder.customer_email,
        customerName: updatedOrder.customer_name,
        orderNumber: updatedOrder.order_number,
        newStatus: 'Cancelled',
        trackingNumber: updatedOrder.tracking_number,
        totalAmount: updatedOrder.total_amount,
        itemsSummary: formatItemsSummary(itemsList),
        shippingAddress: updatedOrder.shipping_address,
      })
    } catch (emailErr) {
      console.warn('Cancellation email notification note:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Order has been cancelled successfully. If paid, your refund will reflect within 3 to 5 business days.',
      order: updatedOrder,
    })
  } catch (err: any) {
    console.error('Error in order cancellation endpoint:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

