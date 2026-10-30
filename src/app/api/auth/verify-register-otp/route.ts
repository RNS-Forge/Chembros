import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAccessToken, hashPassword, enrichUserAddress } from '@/lib/auth-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const otpCode = (body.otp_code || '').trim()

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
        if (!supaErr && supaAuth?.user) {
          otpValid = true
        }
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

    const { data: existing } = await supabaseAdmin.from('users').select('id').ilike('email', email).maybeSingle()

    if (existing) {
      return NextResponse.json(
        { detail: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      )
    }

    const isAdminEmail = serverConfig.ADMIN_EMAILS.includes(email) || email === 'admin@chembros.com'
    const name = body.name?.trim() || email.split('@')[0].replace(/\b\w/g, (c) => c.toUpperCase())
    const passwordHash = body.password ? await hashPassword(body.password.trim()) : null

    const { data: newUser, error: insErr } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        phone: body.phone?.trim() || null,
        shipping_address: body.shipping_address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || 'Tamil Nadu',
        pincode: body.pincode?.trim() || null,
        role: isAdminEmail ? 'admin' : 'user',
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insErr || !newUser) {
      throw new Error(insErr?.message || 'Failed to create user record.')
    }

    const enriched = await enrichUserAddress(newUser)

    const token = createAccessToken({
      sub: enriched.id,
      email: enriched.email,
      role: enriched.role || 'user',
    })

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: enriched.id,
        email: enriched.email,
        name: enriched.name,
        role: enriched.role,
        phone: enriched.phone,
        shipping_address: enriched.shipping_address,
        city: enriched.city,
        state: enriched.state,
        pincode: enriched.pincode,
        avatar_url: enriched.avatar_url,
      },
    })
  } catch (err: any) {
    console.error('Error in verify-register-otp:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

