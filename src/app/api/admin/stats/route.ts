import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromAuthHeader } from '@/lib/auth-service'

export async function GET(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ detail: 'Admin privileges required' }, { status: 403 })
    }

    const [ordersRes, productsRes] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('id, order_number, customer_name, customer_email, total_amount, payment_status, order_status, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('products').select('id, stock'),
    ])

    const allOrders = ordersRes.data || []
    const allProducts = productsRes.data || []

    const paidOrders = allOrders.filter((o) => o.payment_status === 'PAID')
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const lowStockCount = allProducts.filter((p) => (Number(p.stock) || 0) <= 10).length

    const recentOrders = allOrders.slice(0, 6).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      total_amount: Number(o.total_amount) || 0,
      payment_status: o.payment_status,
      order_status: o.order_status,
      created_at: o.created_at,
    }))

    return NextResponse.json({
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_orders: allOrders.length,
      paid_orders: paidOrders.length,
      total_products: allProducts.length,
      low_stock_count: lowStockCount,
      recent_orders: recentOrders,
    })
  } catch (err: any) {
    console.error('Error in admin stats API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

