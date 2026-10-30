import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAccessToken, enrichUserAddress } from '@/lib/auth-service'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const payload = token ? verifyAccessToken(token) : null

    if (!payload?.sub) {
      return NextResponse.json({ detail: 'Authentication token required.' }, { status: 401 })
    }

    let { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', Number(payload.sub))
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ detail: 'User account not found.' }, { status: 404 })
    }

    user = await enrichUserAddress(user)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      shipping_address: user.shipping_address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      avatar_url: user.avatar_url,
    })
  } catch (err: any) {
    console.error('Error in /api/auth/me:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

