import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAccessToken, enrichUserAddress } from '@/lib/auth-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const otpCode = (body.otp_code || '').trim()
    const name = body.name?.trim()

    if (!email || !otpCode) {
      return NextResponse.json({ detail: 'Email and verification code are required.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const { data: otpRecord } = await supabaseAdmin
      .from('otps')
      .select('*')
      .ilike('email', email)
      .eq('otp_code', otpCode)
      .eq('used', false)
      .gt('expires_at', now)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()

    let otpValid = Boolean(otpRecord)
    if (!otpValid) {
      try {
        const { data: supaAuth, error: supaErr } = await supabaseAdmin.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email',
        })
        if (!supaErr && supaAuth?.user) otpValid = true
      } catch (e) {
        console.warn('Supabase Auth verifyOtp note:', e)
      }
    }

    if (!otpValid) {
      return NextResponse.json({ detail: 'Invalid or expired verification code.' }, { status: 400 })
    }

    if (otpRecord) {
      await supabaseAdmin.from('otps').update({ used: true }).eq('id', otpRecord.id)
    }

    let { data: user } = await supabaseAdmin.from('users').select('*').ilike('email', email).maybeSingle()

    const isAdminEmail = serverConfig.ADMIN_EMAILS.includes(email) || email === 'admin@chembros.com'

    if (!user) {
      const { data: created } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          name: name || email.split('@')[0],
          role: isAdminEmail ? 'admin' : 'user',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      user = created
    } else {
      let shouldUpdate = false
      const updates: any = {}
      if (isAdminEmail && user.role !== 'admin') {
        updates.role = 'admin'
        shouldUpdate = true
      }
      if (name && !user.name) {
        updates.name = name
        shouldUpdate = true
      }
      if (shouldUpdate) {
        const { data: updated } = await supabaseAdmin
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()
        user = updated || user
      }
    }

    user = await enrichUserAddress(user)

    const token = createAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
    })

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
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
      },
    })
  } catch (err: any) {
    console.error('Error in verify-otp:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

