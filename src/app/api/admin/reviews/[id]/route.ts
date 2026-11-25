import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromAuthHeader } from '@/lib/auth-service'
import { recordAuditLog } from '@/lib/audit-log-service'

async function isAuthorizedAdmin(req: Request): Promise<boolean> {
  const user = await getUserFromAuthHeader(req)
  return user?.role === 'admin'
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ detail: 'Unauthorized. Admin privileges required.' }, { status: 403 })
    }

    const { id } = await params
    const reviewId = Number(id)

    // Find review to get product_id before deleting
    const { data: rev } = await supabaseAdmin
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
      .maybeSingle()

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Delete review error:', error)
      return NextResponse.json({ detail: error.message }, { status: 500 })
    }

    if (rev?.product_id) {
      try {
        const { data: allReviews } = await supabaseAdmin
          .from('reviews')
          .select('rating')
          .eq('product_id', rev.product_id)

        const count = allReviews ? allReviews.length : 0
        const avg = allReviews && count > 0
          ? allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / count
          : 0

        await supabaseAdmin
          .from('products')
          .update({
            reviews_count: count,
            rating: Number(avg.toFixed(1)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', rev.product_id)
      } catch {}
    }

    const adminUser = await getUserFromAuthHeader(req)
    await recordAuditLog({
      action: 'REVIEW_DELETED',
      category: 'CATALOG',
      details: `Deleted customer review #${reviewId}${rev?.product_id ? ` on product #${rev.product_id}` : ''}.`,
      user_email: adminUser?.email,
      status: 'WARNING',
    })

    return NextResponse.json({ status: 'success', message: 'Review deleted successfully.' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ detail: msg }, { status: 500 })
  }
}

