import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cashfreeService } from '@/lib/cashfree-service'
import { sendOrderPlacedEmail } from '@/lib/email-service'
import { getUserFromAuthHeader } from '@/lib/auth-service'

function generateOrderNumber(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `CB-${today}-${randomSuffix}`
}

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
    const { items, customer_name, customer_email, customer_phone, shipping_address } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ detail: 'Order must contain at least one fragrance item.' }, { status: 400 })
    }

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return NextResponse.json({ detail: 'Customer name, email, phone, and shipping address are required.' }, { status: 400 })
    }

    const cleanEmail = customer_email.trim().toLowerCase()
    const cleanName = customer_name.trim()
    const cleanPhone = customer_phone.trim()
    const cleanAddress = shipping_address.trim()

    let subtotal = 0
    const itemsJsonList = items.map((item) => {
      const price = Number(item.price) || 0
      const quantity = Math.max(1, Number(item.quantity) || 1)
      subtotal += price * quantity
      return {
        product_id: item.product_id,
        name: item.name || 'Extrait de Parfum',
        price,
        quantity,
        volume_ml: item.volume_ml || 50,
        image_base64: item.image_base64 || null,
      }
    })

    const shippingFee = subtotal >= 1500 ? 0 : 150
    const totalAmount = Math.round((subtotal + shippingFee) * 100) / 100

    const orderNumber = generateOrderNumber()
    const cfOrderId = `cf_${orderNumber}`

    const currentUser = await getUserFromAuthHeader(req)
    const customerId = currentUser?.id ? `cust_${currentUser.id}` : `guest_${orderNumber}`

    const baseUrl = (serverConfig.FRONTEND_URL || 'https://chembros.vercel.app').replace(/\/+$/, '')
    const returnUrl = `${baseUrl}/order-confirmation?order_id=${orderNumber}`

    // 1. Initialize Cashfree PG session
    const cfResult = await cashfreeService.createOrder({
      order_id: cfOrderId,
      order_amount: totalAmount,
      customer_id: customerId,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
      customer_name: cleanName,
      return_url: returnUrl,
    })

    if (!cfResult.success) {
      return NextResponse.json(
        { detail: 'Unable to initialize Cashfree payment gateway session. Please try again.' },
        { status: 500 }
      )
    }

    // 2. Persist order in Supabase
    const { data: newOrder, error: dbErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: currentUser?.id || null,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        shipping_address: cleanAddress,
        items: JSON.stringify(itemsJsonList),
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        payment_status: 'PENDING',
        order_status: 'Placed',
        cashfree_order_id: cfOrderId,
        cashfree_payment_session_id: cfResult.data.payment_session_id || '',
        payment_method: 'Cashfree PG',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbErr) {
      console.error('Error persisting order in Supabase:', dbErr)
      return NextResponse.json({ detail: 'Failed to record order: ' + dbErr.message }, { status: 500 })
    }

    // 3. Dispatch Order Placed confirmation email immediately
    try {
      await sendOrderPlacedEmail({
        toEmail: cleanEmail,
        customerName: cleanName,
        orderNumber: orderNumber,
        totalAmount: totalAmount,
        itemsSummary: formatItemsSummary(itemsJsonList),
        shippingAddress: cleanAddress,
      })
    } catch (emailErr) {
      console.warn('Order placed email dispatch note:', emailErr)
    }

    return NextResponse.json({
      order_number: orderNumber,
      cashfree_order_id: cfOrderId,
      payment_session_id: cfResult.data.payment_session_id || '',
      total_amount: totalAmount,
      cf_environment: serverConfig.CASHFREE_ENV,
    })
  } catch (err: any) {
    console.error('Error in create order API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}

