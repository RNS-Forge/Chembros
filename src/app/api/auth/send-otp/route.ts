import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateOtp } from '@/lib/auth-service'
import { sendOtpEmail } from '@/lib/email-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ detail: 'A valid email address is required.' }, { status: 400 })
    }

    // Prevent OTP bombing against arbitrary third-party addresses
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { detail: 'No account found with this email address.' },
        { status: 404 }
      )
    }

    // 45-second cooldown per email to prevent OTP spam
    const cooldownCutoff = new Date(Date.now() - 45 * 1000).toISOString()
    const { data: recentOtp } = await supabaseAdmin
      .from('otps')
      .select('id')
      .ilike('email', email)
      .gt('created_at', cooldownCutoff)
      .limit(1)
      .maybeSingle()

    if (recentOtp) {
      return NextResponse.json(
        { detail: 'Please wait 45 seconds before requesting another verification code.' },
        { status: 429 }
      )
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
      status: 'success',
      message: `Verification code sent to ${email}`,
      email,
    })
  } catch (err: any) {
    console.error('Error in send-otp:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

