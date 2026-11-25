import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateInvoiceHtml, generateInvoicePdfBuffer, InvoiceOrderData } from '@/lib/invoice-generator'
import { getUserFromAuthHeader } from '@/lib/auth-service'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const autoPrint = searchParams.get('print') === 'true'
    const wantsPdf = searchParams.get('format') === 'pdf' || searchParams.get('download') === 'true'

    if (!id || !id.trim()) {
      return NextResponse.json({ detail: 'Order ID or order number is required.' }, { status: 400 })
    }

    const cleanNumber = decodeURIComponent(id).replace(/^#/, '').trim()
    const orderIdNum = Number(cleanNumber)
    let query = supabaseAdmin.from('orders').select('*')

    if (!isNaN(orderIdNum) && orderIdNum > 0 && String(orderIdNum) === cleanNumber) {
      query = query.or(`id.eq.${orderIdNum},order_number.eq.${cleanNumber},order_number.eq.#${cleanNumber}`)
    } else {
      query = query.or(`order_number.eq.${cleanNumber},order_number.eq.#${cleanNumber}`)
    }

    const { data: order, error } = await query.maybeSingle()

    if (error || !order) {
      const safeId = cleanNumber.replace(/[<>&"']/g, '')
      return new Response(
        `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h2>Order Not Found</h2><p>Could not locate order #${safeId}. Please verify the order number.</p></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Authenticate invoice access: Allow only if user is admin or verified owner of the order (via Authorization header or valid ?token= JWT)
    const currentUser = await getUserFromAuthHeader(req)
    const isOwner = currentUser && (
      currentUser.role === 'admin' ||
      (order.user_id && Number(currentUser.id) === Number(order.user_id)) ||
      (currentUser.email && order.customer_email && currentUser.email.toLowerCase() === order.customer_email.toLowerCase())
    )

    if (!isOwner) {
      return new Response(
        `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h2>Access Denied</h2><p>Please log in or access the official tax invoice attached to your order confirmation email.</p></body></html>`,
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    let itemsList = []
    try {
      itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []
    } catch {
      itemsList = []
    }

    const orderData: InvoiceOrderData = {
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      items: itemsList,
      subtotal: Number(order.subtotal) || 0,
      shipping_fee: Number(order.shipping_fee) || 0,
      total_amount: Number(order.total_amount) || 0,
      payment_status: order.payment_status || 'PAID',
      payment_method: order.payment_method || (order.payment_status === 'PAID' ? 'UPI / Online' : 'Pending'),
      cashfree_payment_id: order.cashfree_payment_id || order.cashfree_order_id,
      cashfree_order_id: order.cashfree_order_id,
      tracking_number: order.tracking_number,
    }

    if (wantsPdf) {
      const pdfBuffer = await generateInvoicePdfBuffer(orderData)
      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Invoice-${order.order_number}.pdf"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }

    const html = generateInvoiceHtml(orderData, autoPrint, searchParams.get('token') || '')

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err: any) {
    console.error('Invoice generation error:', err)
    return new Response(
      `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h2>Internal Server Error</h2><p>Failed to generate invoice: ${err.message}</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
