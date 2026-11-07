import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderStatusEmail, sendOrderCancelledEmail, sendOtpEmail } from '@/lib/email-service'
import { getUserFromAuthHeader, generateOtp } from '@/lib/auth-service'

function formatItemsSummary(items: any[]): string {
  return items
    .map((item) => {
      const name = item.name || 'Fragrance Extrait'
      const vol = item.volume_ml || 50
      const qty = item.quantity || 1
      const price = Number(item.price) || 0
      return `• ${name} (${vol}ml) × ${qty} — Rs. ${(price * qty).toLocaleString('en-IN')}`
    })
    .join('\n')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { order_id, reason, otp_code, action } = body

    if (!order_id) {
      return NextResponse.json({ detail: 'Order ID or order number is required.' }, { status: 400 })
    }

    const orderNum = Number(order_id)
    let findQuery = supabaseAdmin.from('orders').select('*')
    if (isNaN(orderNum)) {
      findQuery = findQuery.eq('order_number', String(order_id))
    } else {
      findQuery = findQuery.or(`id.eq.${orderNum},order_number.eq.${order_id}`)
    }

    const { data: order, error: findErr } = await findQuery.maybeSingle()
    if (findErr || !order) {
      return NextResponse.json({ detail: 'Order not found.' }, { status: 404 })
    }

    // Optional user authorization check if bearer token is present
    const currentUser = await getUserFromAuthHeader(req)
    const isAdmin = currentUser?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { detail: 'Orders cannot be cancelled once placed. All sales are final with no return or refund policy.' },
        { status: 403 }
      )
    }

    const currentStatusUpper = (order.order_status || '').toUpperCase()
    if (currentStatusUpper === 'CANCELLED') {
      return NextResponse.json({
        success: true,
        message: 'Order is already cancelled.',
        order,
      })
    }

    // Cancellation allowed strictly while order is still in pre-shipping status (Placed, Processing, or Pending)
    const canCancel = currentStatusUpper === 'PLACED' || currentStatusUpper === 'PROCESSING' || currentStatusUpper === 'PENDING'
    if (!canCancel) {
      return NextResponse.json(
        { detail: `Cannot cancel this order because its status has already been updated to '${order.order_status}'. Order cancellation is only allowed while still pending dispatch.` },
        { status: 400 }
      )
    }

    // 1. Request Cancellation OTP Action
    if (action === 'request_otp') {
      const email = order.customer_email.trim().toLowerCase()
      await supabaseAdmin.from('otps').update({ used: true }).ilike('email', email).eq('used', false)

      const otpCode = generateOtp()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      await supabaseAdmin.from('otps').insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        used: false,
        created_at: new Date().toISOString(),
      })

      const sent = await sendOtpEmail(email, otpCode, {
        purpose: 'Cancellation Verification',
        headline: `Cancel Order #${order.order_number}`,
        message: `You have requested to cancel Chembros Order #${order.order_number}. Enter the 6-digit verification code below to authorize cancellation. Once verified, your order will be cancelled and refund processed.`
      })

      if (!sent) {
        return NextResponse.json({ detail: `Unable to dispatch cancellation verification email to ${email}.` }, { status: 500 })
      }

      return NextResponse.json({
        status: 'otp_sent',
        message: `Cancellation verification code has been dispatched to ${email}.`,
        email,
      })
    }

    // 2. Verify Cancellation OTP (Required for customer, optional for admin)
    if (!isAdmin) {
      const cleanOtp = (otp_code || '').trim()
      if (!cleanOtp) {
        return NextResponse.json({
          detail: 'Verification code is required to cancel this order.',
          require_otp: true,
        }, { status: 400 })
      }

      const now = new Date().toISOString()
      const email = order.customer_email.trim().toLowerCase()
      const { data: otpRecord } = await supabaseAdmin
        .from('otps')
        .select('*')
        .ilike('email', email)
        .eq('otp_code', cleanOtp)
        .eq('used', false)
        .gt('expires_at', now)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!otpRecord) {
        return NextResponse.json({ detail: 'Invalid or expired cancellation verification code.' }, { status: 400 })
      }

      await supabaseAdmin.from('otps').update({ used: true }).eq('id', otpRecord.id)
    }

    // Update status to Cancelled in Supabase
    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        order_status: 'Cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .single()

    if (updateErr) {
      console.error('Error updating order cancellation:', updateErr)
      return NextResponse.json({ detail: updateErr.message }, { status: 500 })
    }

    let itemsList: any[] = []
    try {
      itemsList = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items || []
    } catch {
      itemsList = []
    }

    // Dispatch dedicated Order Cancellation email notification via Resend
    try {
      await sendOrderCancelledEmail({
        toEmail: updatedOrder.customer_email,
        customerName: updatedOrder.customer_name,
        orderNumber: updatedOrder.order_number,
        totalAmount: updatedOrder.total_amount,
        itemsSummary: formatItemsSummary(itemsList),
        reason: typeof reason === 'string' && reason.trim() ? reason.trim() : undefined,
        shippingAddress: updatedOrder.shipping_address,
      })
    } catch (emailErr) {
      console.warn('Cancellation email notification note:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Order has been cancelled successfully. If paid, your refund will reflect within 3 to 5 business days.',
      order: updatedOrder,
    })
  } catch (err: any) {
    console.error('Error in order cancellation endpoint:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

