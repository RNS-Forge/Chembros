import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAccessToken, verifyPassword, hashPassword, isStrongPassword } from '@/lib/auth-service'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const payload = token ? verifyAccessToken(token) : null

    if (!payload?.sub) {
      return NextResponse.json({ detail: 'Authentication token required.' }, { status: 401 })
    }

    const body = await req.json()
    const currentPass = body.current_password || ''
    const newPass = body.new_password || ''

    if (!currentPass || !newPass) {
      return NextResponse.json({ detail: 'Both current and new passwords are required.' }, { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('id', Number(payload.sub))
      .single()

    if (!user || !user.password_hash) {
      return NextResponse.json({ detail: 'User not found or password not configured.' }, { status: 400 })
    }

    const isMatch = await verifyPassword(currentPass, user.password_hash)
    if (!isMatch) {
      return NextResponse.json({ detail: 'Current password is incorrect.' }, { status: 400 })
    }

    const strength = isStrongPassword(newPass)
    if (!strength.valid) {
      return NextResponse.json({ detail: strength.message }, { status: 400 })
    }

    const newHash = await hashPassword(newPass)
    await supabaseAdmin
      .from('users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({ status: 'success', message: 'Password changed successfully.' })
  } catch (err: any) {
    console.error('Error in change-password:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

