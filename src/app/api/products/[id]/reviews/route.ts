import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let targetId: number | null = !isNaN(Number(id)) ? Number(id) : null

    // If id is a slug like 'molecule-j', look up product id first
    if (!targetId) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('id')
        .or(`slug.eq.${id},name.ilike.%${id.replace(/-/g, ' ')}%`)
        .maybeSingle()

      if (prod) targetId = Number(prod.id)
    }

    if (!targetId) {
      return NextResponse.json([])
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('product_id', targetId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch reviews error:', error)
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: msg }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let targetId: number | null = !isNaN(Number(id)) ? Number(id) : null

    if (!targetId) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('id')
        .or(`slug.eq.${id},name.ilike.%${id.replace(/-/g, ' ')}%`)
        .maybeSingle()

      if (prod) targetId = Number(prod.id)
    }

    if (!targetId) {
      return NextResponse.json({ detail: 'Target product not found.' }, { status: 404 })
    }

    const body = await req.json()
    const authorName = (body.author_name || body.author || '').trim()
    const title = (body.title || '').trim()
    const comment = (body.comment || '').trim()

    if (!authorName || !title || !comment) {
      return NextResponse.json(
        { detail: 'Author name, headline, and comments are required.' },
        { status: 400 }
      )
    }

    const rating = Math.max(1, Math.min(5, Number(body.rating) || 5))
    const location = (body.location || 'Verified Buyer').trim()
    const longevity = body.longevity || '10+ Hours'
    const sillage = body.sillage || 'Clean & Radiant'

    const insertPayload: Record<string, any> = {
      product_id: targetId,
      author_name: authorName,
      location,
      rating,
      title,
      comment,
      longevity,
      sillage,
      created_at: new Date().toISOString(),
    }

    if (body.user_id) insertPayload.user_id = Number(body.user_id)

    let { data, error } = await supabaseAdmin
      .from('reviews')
      .insert(insertPayload)
      .select()
      .single()

    // Retry without user_id if column not present in schema
    if (error && error.message?.includes('user_id')) {
      const { user_id: _, ...withoutUser } = insertPayload
      const retry = await supabaseAdmin
        .from('reviews')
        .insert(withoutUser)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Insert review error:', error)
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    // Recalculate average rating & count on product
    try {
      const { data: allReviews } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('product_id', targetId)

      if (allReviews && allReviews.length > 0) {
        const count = allReviews.length
        const avg = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / count
        await supabaseAdmin
          .from('products')
          .update({
            reviews_count: count,
            rating: Number(avg.toFixed(1)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId)
      }
    } catch (statErr) {
      console.warn('Update product stats note:', statErr)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: msg }, { status: 500 })
  }
}

