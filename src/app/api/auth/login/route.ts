import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyPassword, hashPassword, createAccessToken, enrichUserAddress, linkGuestOrdersToUser } from '@/lib/auth-service'
import { recordAuditLog } from '@/lib/audit-log-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required.' }, { status: 400 })
    }

    const isMasterAdmin =
      serverConfig.ADMIN_EMAILS.includes(email) && Boolean(serverConfig.ADMIN_PASSWORD && password === serverConfig.ADMIN_PASSWORD)

    let { data: user } = await supabaseAdmin.from('users').select('*').ilike('email', email).maybeSingle()

    let isValid = false
    if (isMasterAdmin) {
      isValid = true
      if (!user) {
        const { data: created } = await supabaseAdmin
          .from('users')
          .insert({
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
          .select()
          .single()
        user = created
      } else {
        const { data: updated } = await supabaseAdmin
          .from('users')
          .update({
            role: 'admin',
            password_hash: await hashPassword(serverConfig.ADMIN_PASSWORD),
          })
          .eq('id', user.id)
          .select()
          .single()
        user = updated || user
      }
    } else if (user && user.password_hash) {
      isValid = await verifyPassword(password, user.password_hash)
    }

    if (!isValid || !user) {
      await recordAuditLog({
        action: 'LOGIN_FAILED',
        category: 'AUTH',
        details: `Failed login attempt for ${email}.`,
        user_email: email,
        status: 'WARNING',
      })
      return NextResponse.json({ detail: 'Invalid email or password.' }, { status: 401 })
    }

    if (user.is_active === false && !isMasterAdmin) {
      return NextResponse.json({ detail: 'This account has been deactivated by administration. Please contact concierge support.' }, { status: 403 })
    }

    await linkGuestOrdersToUser(user.id, user.email)
    user = await enrichUserAddress(user)

    await recordAuditLog({
      action: user.role === 'admin' ? 'ADMIN_LOGIN' : 'USER_LOGIN',
      category: 'AUTH',
      details: `${user.role === 'admin' ? 'Administrator' : 'Client'} signed in: ${user.email}.`,
      user_email: user.email,
      status: 'SUCCESS',
    })

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
    console.error('Error in login:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

