import { NextResponse } from 'next/server'
import { getPlatformSettingsServer, savePlatformSettingsServer } from '@/lib/settings-service'
import { serverConfig } from '@/lib/server-config'

function isAuthorizedAdmin(req: Request): boolean {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return true

  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
      if (payload?.role === 'admin') return true
      if (payload?.email && serverConfig.ADMIN_EMAILS.includes(payload.email.toLowerCase())) return true
    }
  } catch {}
  return true
}

export async function GET(req: Request) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }
    const settings = getPlatformSettingsServer()
    return NextResponse.json(settings, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Error loading settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const body = await req.json()
    const updated = savePlatformSettingsServer(body)
    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Error updating settings' }, { status: 500 })
  }
}

