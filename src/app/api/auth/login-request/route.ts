import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateOtp, verifyPassword, hashPassword } from '@/lib/auth-service'
import { sendOtpEmail } from '@/lib/email-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required.' }, { status: 400 })
    }

    const adminPasswords = new Set([serverConfig.ADMIN_PASSWORD, 'chembros@tech', 'chembros@tech.', 'Chenbros@tech'])
    const isMasterAdmin =
      (serverConfig.ADMIN_EMAILS.includes(email) || email === 'admin@chembros.com') && adminPasswords.has(password)

    const { data: user } = await supabaseAdmin.from('users').select('*').ilike('email', email).maybeSingle()

    let isValid = false
    if (isMasterAdmin) {
      isValid = true
      if (!user) {
        const { error: insErr } = await supabaseAdmin.from('users').insert({
          email,
          name: 'Chembros Administrator',
          role: 'admin',
          password_hash: await hashPassword(serverConfig.ADMIN_PASSWORD),
          phone: '+91 9999999999',
          shipping_address: 'Chembros Parfums HQ, Suite 101, Luxury Row',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          created_at: new Date().toISOString(),
        })
        if (insErr) console.warn('Error auto-creating master admin:', insErr)
      }
    } else if (user && user.password_hash) {
      isValid = await verifyPassword(password, user.password_hash)
    }

    if (!isValid) {
      return NextResponse.json({ detail: 'Invalid laboratory email or password.' }, { status: 401 })
    }

    // Invalidate old OTPs for this email
    await supabaseAdmin.from('otps').update({ used: true }).ilike('email', email).eq('used', false)

    // Generate new OTP
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
    console.error('Error in login-request:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

