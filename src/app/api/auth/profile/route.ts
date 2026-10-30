import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAccessToken } from '@/lib/auth-service'

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const payload = token ? verifyAccessToken(token) : null

    if (!payload?.sub) {
      return NextResponse.json({ detail: 'Authentication token required.' }, { status: 401 })
    }

    const body = await req.json()
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) updates.name = body.name?.trim() || null
    if (body.phone !== undefined) updates.phone = body.phone?.trim() || null
    if (body.shipping_address !== undefined) updates.shipping_address = body.shipping_address?.trim() || null
    if (body.city !== undefined) updates.city = body.city?.trim() || null
    if (body.state !== undefined) updates.state = body.state?.trim() || null
    if (body.pincode !== undefined) updates.pincode = body.pincode?.trim() || null
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url || null

    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', Number(payload.sub))
      .select()
      .single()

    if (error || !updated) {
      return NextResponse.json({ detail: error?.message || 'Failed to update profile.' }, { status: 400 })
    }

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      phone: updated.phone,
      shipping_address: updated.shipping_address,
      city: updated.city,
      state: updated.state,
      pincode: updated.pincode,
      avatar_url: updated.avatar_url,
    })
  } catch (err: any) {
    console.error('Error in profile update:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

