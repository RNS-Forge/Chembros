import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromAuthHeader } from '@/lib/auth-service'

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

export async function GET(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ detail: 'Admin privileges required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status_filter')
    const search = searchParams.get('search')

    let query = supabaseAdmin.from('orders').select('*')

    if (statusFilter && statusFilter !== 'all') {
      query = query.ilike('order_status', `%${statusFilter}%`)
    }

    if (search && search.trim()) {
      const s = search.trim()
      query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    return NextResponse.json((data || []).map(formatOrder))
  } catch (err: any) {
    console.error('Error fetching admin orders:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

