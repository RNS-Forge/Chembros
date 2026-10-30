import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, isStrongPassword } from '@/lib/auth-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const otpCode = (body.otp_code || '').trim()
    const newPassword = body.new_password || ''

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { detail: 'Email, verification code, and new password are required.' },
        { status: 400 }
      )
    }

    // 1. Verify OTP
    const { data: validOtp, error: otpErr } = await supabaseAdmin
      .from('otps')
      .select('*')
      .ilike('email', email)
      .eq('otp_code', otpCode)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (otpErr || !validOtp) {
      return NextResponse.json(
        { detail: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      )
    }

    // 2. Validate Password Strength
    const strength = isStrongPassword(newPassword)
    if (!strength.valid) {
      return NextResponse.json({ detail: strength.message }, { status: 400 })
    }

    // 3. Hash New Password
    const newHash = await hashPassword(newPassword)

    // 4. Update User Password Hash
    const { data: updatedUser, error: updateErr } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      })
      .ilike('email', email)
      .select('id, email, name, role')
      .maybeSingle()

    if (updateErr || !updatedUser) {
      return NextResponse.json(
        { detail: updateErr?.message || 'Failed to update user password.' },
        { status: 500 }
      )
    }

    // 5. Invalidate OTP
    await supabaseAdmin
      .from('otps')
      .update({ used: true })
      .eq('id', validOtp.id)

    return NextResponse.json({
      status: 'success',
      message: 'Your laboratory password has been reset successfully. You can now sign in.',
    })
  } catch (err: any) {
    console.error('Error in reset-password:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

