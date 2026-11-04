import { NextResponse } from 'next/server'
import { getPlatformSettingsServer } from '@/lib/settings-service'

export async function GET() {
  try {
    const settings = await getPlatformSettingsServer()
    return NextResponse.json(settings, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Error fetching settings' }, { status: 500 })
  }
}
