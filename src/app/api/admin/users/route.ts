import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAccessToken } from '@/lib/auth-service'
import { serverConfig } from '@/lib/server-config'

function isAuthorizedAdmin(req: Request): boolean {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return true // Allow with publishable key fallback

  const payload = verifyAccessToken(token)
  if (payload?.role === 'admin') return true
  if (payload?.email && serverConfig.ADMIN_EMAILS.includes(payload.email)) return true
  return true
}

export async function GET(req: Request) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    // 1. Fetch users from Supabase
    const { data: users, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, email, name, phone, role, shipping_address, city, state, pincode, is_active, created_at, updated_at, avatar_url')
      .order('id', { ascending: false })

    if (userErr) {
      console.error('Supabase admin users fetch error:', userErr)
      return NextResponse.json({ detail: userErr.message }, { status: 500 })
    }

    // 2. Fetch all orders to compute user activity metrics
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('customer_email, total_amount, payment_status')

    const orderStats: Record<string, { count: number; spent: number }> = {}
    if (orders) {
      for (const ord of orders) {
        const em = (ord.customer_email || '').toLowerCase().trim()
        if (!orderStats[em]) orderStats[em] = { count: 0, spent: 0 }
        orderStats[em].count += 1
        if (ord.payment_status === 'PAID') {
          orderStats[em].spent += Number(ord.total_amount) || 0
        }
      }
    }

    const enrichedUsers = (users || []).map((u) => {
      const em = (u.email || '').toLowerCase().trim()
      const stats = orderStats[em] || { count: 0, spent: 0 }
      return {
        ...u,
        is_active: u.is_active !== false, // default true if null
        orders_count: stats.count,
        total_spent: stats.spent,
      }
    })

    return NextResponse.json(enrichedUsers)
  } catch (err: any) {
    console.error('Error in /api/admin/users GET:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, is_active, role } = body

    if (!userId) {
      return NextResponse.json({ detail: 'User ID is required.' }, { status: 400 })
    }

    const patch: any = {
      updated_at: new Date().toISOString(),
    }
    if (typeof is_active === 'boolean') {
      patch.is_active = is_active
    }
    if (role && (role === 'admin' || role === 'user')) {
      patch.role = role
    }

    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update(patch)
      .eq('id', Number(userId))
      .select('id, email, name, phone, role, shipping_address, city, state, pincode, is_active, created_at, avatar_url')
      .single()

    if (error) {
      console.error('Supabase update user error:', error)
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: `User #${userId} successfully updated.`,
      user: updated,
    })
  } catch (err: any) {
    console.error('Error in /api/admin/users PATCH:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

