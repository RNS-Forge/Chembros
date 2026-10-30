import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serverConfig } from './server-config'
import { supabaseAdmin } from './supabase-admin'

export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one number.' }
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character.' }
  }
  return { valid: true, message: '' }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false
  return await bcrypt.compare(password, hash)
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function createAccessToken(payload: { sub: string | number; email: string; role: string }): string {
  return jwt.sign(
    {
      sub: String(payload.sub),
      email: payload.email,
      role: payload.role,
    },
    serverConfig.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyAccessToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, serverConfig.JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function enrichUserAddress(user: any) {
  if (!user) return user

  let changed = false
  const updated = { ...user }

  if (updated.shipping_address && !updated.pincode) {
    const pinMatch = updated.shipping_address.match(/\b\d{6}\b/)
    if (pinMatch) {
      updated.pincode = pinMatch[0]
      changed = true
    }
  }

  if (!updated.shipping_address || !updated.phone || !updated.city || !updated.pincode) {
    try {
      let query = supabaseAdmin
        .from('orders')
        .select('customer_name, customer_phone, shipping_address, created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      if (updated.id && updated.email) {
        query = query.or(`user_id.eq.${updated.id},customer_email.ilike.${updated.email}`)
      } else if (updated.id) {
        query = query.eq('user_id', updated.id)
      } else if (updated.email) {
        query = query.ilike('customer_email', updated.email)
      }

      const { data: orders } = await query
      if (orders && orders.length > 0) {
        const latest = orders[0]
        if (!updated.name && latest.customer_name) {
          updated.name = latest.customer_name
          changed = true
        }
        if (!updated.phone && latest.customer_phone) {
          updated.phone = latest.customer_phone
          changed = true
        }
        if (latest.shipping_address) {
          const raw = latest.shipping_address.trim()
          const pinMatch = raw.match(/\b\d{6}\b/)
          if (!updated.pincode && pinMatch) {
            updated.pincode = pinMatch[0]
            changed = true
          }

          if (!updated.shipping_address) {
            const clean = raw.replace(/\s*[-–,]\s*\d{6}\s*$/, '').trim()
            const parts = clean.split(',').map((p: string) => p.trim()).filter(Boolean)
            if (parts.length >= 3) {
              if (!updated.state) updated.state = parts[parts.length - 1]
              if (!updated.city) updated.city = parts[parts.length - 2]
              updated.shipping_address = parts.slice(0, parts.length - 2).join(', ')
            } else if (parts.length === 2) {
              if (!updated.city) updated.city = parts[1]
              updated.shipping_address = parts[0]
            } else {
              updated.shipping_address = clean || raw
            }
            changed = true
          }
        }

        if (!updated.state) {
          updated.state = 'Tamil Nadu'
          changed = true
        }
      }
    } catch (err) {
      console.warn('Could not enrich user address from orders:', err)
    }
  }

  if (changed && updated.id) {
    try {
      await supabaseAdmin
        .from('users')
        .update({
          name: updated.name,
          phone: updated.phone,
          shipping_address: updated.shipping_address,
          city: updated.city,
          state: updated.state,
          pincode: updated.pincode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updated.id)
    } catch (updateErr) {
      console.warn('Could not persist enriched address:', updateErr)
    }
  }

  return updated
}


export async function getUserFromAuthHeader(req: Request): Promise<any | null> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null

    const token = authHeader.replace(/^Bearer\s+/, '').trim()
    const payload = verifyAccessToken(token)
    if (!payload) return null

    const userId = payload.sub
    const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle()
    return user || null
  } catch {
    return null
  }
}
