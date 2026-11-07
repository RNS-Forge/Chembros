import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idOrSlug = (id || '').trim()

    let query = supabaseAdmin.from('products').select('*')
    if (!isNaN(Number(idOrSlug))) {
      query = query.eq('id', Number(idOrSlug))
    } else {
      query = query.or(`slug.eq.${idOrSlug},name.ilike.%${idOrSlug.replace(/-/g, ' ')}%`)
    }

    const { data, error } = await query.maybeSingle()

    if (error || !data) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

