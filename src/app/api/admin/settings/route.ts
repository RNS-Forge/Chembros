import { NextResponse } from 'next/server'
import { getPlatformSettingsServer, savePlatformSettingsServer } from '@/lib/settings-service'
import { getUserFromAuthHeader } from '@/lib/auth-service'
import { recordAuditLog } from '@/lib/audit-log-service'

export async function GET(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req)
    if (user?.role !== 'admin') {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }
    const settings = await getPlatformSettingsServer()
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
    const user = await getUserFromAuthHeader(req)
    if (user?.role !== 'admin') {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await savePlatformSettingsServer(body)
    await recordAuditLog({
      action: 'SETTINGS_UPDATED',
      category: 'SYSTEM',
      details: `Platform configuration updated by ${user.email}.`,
      user_email: user.email,
      status: 'INFO',
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Error updating settings' }, { status: 500 })
  }
}
