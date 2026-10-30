import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateOtp } from '@/lib/auth-service'
import { sendPasswordResetOtpEmail } from '@/lib/email-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ detail: 'Email address is required.' }, { status: 400 })
    }

    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .ilike('email', email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { detail: 'No laboratory client account found registered to this email address.' },
        { status: 404 }
      )
    }

    // Invalidate previous OTPs for this email
    await supabaseAdmin
      .from('otps')
      .update({ used: true })
      .ilike('email', email)
      .eq('used', false)

    // Generate new OTP
    const otpCode = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insErr } = await supabaseAdmin.from('otps').insert({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    })

    if (insErr) {
      console.error('Failed to insert OTP:', insErr)
      return NextResponse.json({ detail: 'Failed to generate verification code.' }, { status: 500 })
    }

    // Dispatch luxury password reset email via Gmail SMTP
    const sent = await sendPasswordResetOtpEmail(email, otpCode)
    if (!sent) {
      return NextResponse.json(
        { detail: `Unable to dispatch verification email to ${email}. Please check your address.` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'otp_sent',
      message: `Verification code has been dispatched to ${email}`,
      email,
    })
  } catch (err: any) {
    console.error('Error in forgot-password-request:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

