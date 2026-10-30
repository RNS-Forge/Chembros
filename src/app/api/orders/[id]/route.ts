import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function formatOrder(row: any) {
  let parsedItems = []
  if (typeof row.items === 'string') {
    try {
      parsedItems = JSON.parse(row.items)
    } catch {
      parsedItems = []
    }
  } else if (Array.isArray(row.items)) {
    parsedItems = row.items
  }

  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    shipping_address: row.shipping_address,
    items: parsedItems,
    subtotal: Number(row.subtotal) || 0,
    shipping_fee: Number(row.shipping_fee) || 0,
    total_amount: Number(row.total_amount) || 0,
    payment_status: row.payment_status || 'PENDING',
    order_status: row.order_status || 'Placed',
    tracking_number: row.tracking_number,
    created_at: row.created_at || new Date().toISOString(),
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = Number(id)

    let query = supabaseAdmin.from('orders').select('*')
    if (isNaN(orderId)) {
      query = query.eq('order_number', id)
    } else {
      query = query.or(`id.eq.${orderId},order_number.eq.${id}`)
    }

    const { data: order, error } = await query.maybeSingle()
    if (error || !order) {
      return NextResponse.json({ detail: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(formatOrder(order))
  } catch (err: any) {
    console.error('Error in order detail API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

