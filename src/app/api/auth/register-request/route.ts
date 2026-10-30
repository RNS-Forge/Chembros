import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateOtp, isStrongPassword } from '@/lib/auth-service'
import { sendOtpEmail } from '@/lib/email-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password ? String(body.password).trim() : ''

    if (!email) {
      return NextResponse.json({ detail: 'Email address is required.' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin.from('users').select('id').ilike('email', email).maybeSingle()

    if (existing) {
      return NextResponse.json(
        { detail: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      )
    }

    if (password) {
      const strength = isStrongPassword(password)
      if (!strength.valid) {
        return NextResponse.json({ detail: strength.message }, { status: 400 })
      }
    }

    await supabaseAdmin.from('otps').update({ used: true }).ilike('email', email).eq('used', false)

    const otpCode = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabaseAdmin.from('otps').insert({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    })

    const sent = await sendOtpEmail(email, otpCode)
    if (!sent) {
      return NextResponse.json(
        { detail: `Unable to dispatch verification email to ${email}. Please check your address and try again.` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'otp_sent',
      message: `Verification code has been dispatched to ${email}`,
      email,
    })
  } catch (err: any) {
    console.error('Error in register-request:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

