import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    const list = (data || []).sort((a: any, b: any) => {
      const orderA = a.sort_order != null && a.sort_order > 0 ? a.sort_order : 999999
      const orderB = b.sort_order != null && b.sort_order > 0 ? b.sort_order : 999999
      if (orderA !== orderB) return orderA - orderB
      return Number(a.id) - Number(b.id)
    })

    return NextResponse.json(list)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

