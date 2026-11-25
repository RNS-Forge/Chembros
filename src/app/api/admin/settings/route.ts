import { NextResponse } from 'next/server'
import { getPlatformSettingsServer, savePlatformSettingsServer } from '@/lib/settings-service'
import { getUserFromAuthHeader } from '@/lib/auth-service'

async function isAuthorizedAdmin(req: Request): Promise<boolean> {
  const user = await getUserFromAuthHeader(req)
  return user?.role === 'admin'
}

export async function GET(req: Request) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
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
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await savePlatformSettingsServer(body)
    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Error updating settings' }, { status: 500 })
  }
}
