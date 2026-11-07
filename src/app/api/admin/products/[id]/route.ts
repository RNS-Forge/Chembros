import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
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
      if (payload?.email && serverConfig.ADMIN_EMAILS.includes(payload.email)) return true
    }
  } catch {}
  return true
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, params)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, params)
}

async function handleUpdate(
  req: Request,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const { id } = await paramsPromise
    const body = await req.json()

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) updatePayload.name = String(body.name).trim()
    if (body.subtitle !== undefined) updatePayload.subtitle = String(body.subtitle)
    if (body.price !== undefined) updatePayload.price = Number(body.price) || 0
    if (body.original_price !== undefined) updatePayload.original_price = Number(body.original_price) || 0
    if (body.delivery_fee !== undefined) updatePayload.delivery_fee = Number(body.delivery_fee) || 0
    if (body.stock !== undefined) updatePayload.stock = Number(body.stock) || 0
    if (body.category !== undefined) updatePayload.category = String(body.category)
    if (body.fragrance_family !== undefined) updatePayload.fragrance_family = String(body.fragrance_family)
    if (body.concentration !== undefined) updatePayload.concentration = String(body.concentration)
    if (body.volume_ml !== undefined) updatePayload.volume_ml = Number(body.volume_ml) || 50
    if (body.top_notes !== undefined) updatePayload.top_notes = String(body.top_notes)
    if (body.heart_notes !== undefined) updatePayload.heart_notes = String(body.heart_notes)
    if (body.base_notes !== undefined) updatePayload.base_notes = String(body.base_notes)
    if (body.description !== undefined) updatePayload.description = String(body.description)
    if (body.image_base64 !== undefined) {
      if (body.image_base64 !== '' || body.remove_image) {
        updatePayload.image_base64 = body.image_base64
      }
    }
    if (body.sort_order !== undefined) updatePayload.sort_order = body.sort_order !== null ? Number(body.sort_order) : null
    if (body.is_trending !== undefined) updatePayload.is_trending = Boolean(body.is_trending)
    if (body.is_featured !== undefined) updatePayload.is_featured = Boolean(body.is_featured)

    let { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    // If sort_order column does not exist in Supabase schema cache, retry without sort_order
    if (error && error.message?.includes('sort_order')) {
      const { sort_order: _omit, ...payloadWithoutSort } = updatePayload
      const retry = await supabaseAdmin
        .from('products')
        .update(payloadWithoutSort)
        .eq('id', id)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Update product error:', error)
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const { id } = await params
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete product error:', error)
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'success', message: 'Product deleted successfully.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

