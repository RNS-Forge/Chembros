import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderStatusEmail } from '@/lib/email-service'

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { order_status, tracking_number } = body

    if (!order_status) {
      return NextResponse.json({ detail: 'order_status is required.' }, { status: 400 })
    }

    const orderId = Number(id)
    let findQuery = supabaseAdmin.from('orders').select('*')
    if (isNaN(orderId)) {
      findQuery = findQuery.eq('order_number', id)
    } else {
      findQuery = findQuery.eq('id', orderId)
    }

    const { data: order, error: findErr } = await findQuery.maybeSingle()

    if (findErr || !order) {
      return NextResponse.json({ detail: `Order with ID or number ${id} not found.` }, { status: 404 })
    }

    const updateFields: any = {
      order_status,
      updated_at: new Date().toISOString(),
    }
    if (tracking_number !== undefined) {
      updateFields.tracking_number = tracking_number ? tracking_number.trim() : null
    }

    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update(updateFields)
      .eq('id', order.id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ detail: updateErr.message }, { status: 500 })
    }

    let itemsList: any[] = []
    try {
      itemsList = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items || []
    } catch {
      itemsList = []
    }

    // Trigger multi-stage email notification
    try {
      await sendOrderStatusEmail({
        toEmail: updatedOrder.customer_email,
        customerName: updatedOrder.customer_name,
        orderNumber: updatedOrder.order_number,
        newStatus: updatedOrder.order_status,
        trackingNumber: updatedOrder.tracking_number,
        totalAmount: updatedOrder.total_amount,
        itemsSummary: formatItemsSummary(itemsList),
        shippingAddress: updatedOrder.shipping_address,
      })
    } catch (emailErr) {
      console.warn('Status update email dispatch note:', emailErr)
    }

    return NextResponse.json({
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      customer_name: updatedOrder.customer_name,
      customer_email: updatedOrder.customer_email,
      order_status: updatedOrder.order_status,
      payment_status: updatedOrder.payment_status,
      tracking_number: updatedOrder.tracking_number,
      total_amount: updatedOrder.total_amount,
    })
  } catch (err: any) {
    console.error('Error updating order status:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}
