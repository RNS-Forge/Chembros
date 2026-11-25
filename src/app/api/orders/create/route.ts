import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cashfreeService } from '@/lib/cashfree-service'
import { getUserFromAuthHeader } from '@/lib/auth-service'
import { getPlatformSettingsServer } from '@/lib/settings-service'
import { saveAwaitingPaymentOrder } from '@/lib/order-service'
import { persistPaidOrder } from '@/lib/order-service'

function generateOrderNumber(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `CB-${today}-${randomSuffix}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer_name, customer_email, customer_phone, shipping_address } = body

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ detail: 'Order must contain between 1 and 50 fragrance items.' }, { status: 400 })
    }

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return NextResponse.json({ detail: 'Customer name, email, phone, and shipping address are required.' }, { status: 400 })
    }

    if (
      String(customer_name).length > 200 ||
      String(customer_email).length > 254 ||
      String(customer_phone).length > 30 ||
      String(shipping_address).length > 1000
    ) {
      return NextResponse.json({ detail: 'One or more customer fields exceed maximum allowed length.' }, { status: 400 })
    }

    const settings = await getPlatformSettingsServer()
    const currentUser = await getUserFromAuthHeader(req)

    // 1. Guest Checkout Enforcement
    if (!settings.allow_guest_checkout && !currentUser) {
      return NextResponse.json(
        { detail: 'Guest checkout is disabled. Please sign in or register before checking out.' },
        { status: 403 }
      )
    }

    const cleanEmail = customer_email.trim().toLowerCase()
    const cleanName = customer_name.trim()
    const cleanPhone = customer_phone.trim()
    const cleanAddress = shipping_address.trim()

    // 2. Authoritative Server-Side Product Price & Stock Lookup
    const productIds = Array.from(
      new Set(
        items
          .map((item: any) => Number(item.product_id))
          .filter((id: number) => Number.isInteger(id) && id > 0)
      )
    )

    if (productIds.length === 0) {
      return NextResponse.json({ detail: 'Valid product IDs are required for all order items.' }, { status: 400 })
    }

    const { data: dbProducts, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, name, price, volume_ml, stock')
      .in('id', productIds)

    if (prodErr || !dbProducts) {
      return NextResponse.json({ detail: 'Unable to verify product pricing.' }, { status: 500 })
    }

    const productMap = new Map<number, any>(dbProducts.map((p: any) => [Number(p.id), p]))

    let subtotal = 0
    const itemsJsonList: any[] = []
    for (const item of items) {
      const pid = Number(item.product_id)
      const dbProd = productMap.get(pid)
      if (!dbProd) {
        return NextResponse.json({ detail: `Product #${item.product_id} could not be found.` }, { status: 400 })
      }
      const quantity = Math.min(99, Math.max(1, Math.floor(Number(item.quantity) || 1)))
      if (dbProd.stock !== null && dbProd.stock !== undefined && Number(dbProd.stock) < quantity) {
        return NextResponse.json(
          { detail: `Insufficient stock for ${dbProd.name}. Available: ${dbProd.stock}` },
          { status: 400 }
        )
      }
      const price = Number(dbProd.price)
      subtotal += price * quantity
      itemsJsonList.push({
        product_id: dbProd.id,
        name: dbProd.name || 'Extrait de Parfum',
        price,
        quantity,
        volume_ml: Number(dbProd.volume_ml) || 50,
        image_base64: null,
      })
    }

    // 2. Max Cart Order Limit Enforcement
    if (settings.max_cart_value > 0 && subtotal > settings.max_cart_value) {
      return NextResponse.json(
        { detail: `Order value (Rs. ${subtotal.toLocaleString('en-IN')}) exceeds the maximum permissible limit of Rs. ${settings.max_cart_value.toLocaleString('en-IN')}. Please reduce item quantities.` },
        { status: 400 }
      )
    }

    const isCod = body.payment_method === 'COD' || body.payment_method === 'Cash on Delivery'
    if (isCod) {
      return NextResponse.json(
        { detail: 'Cash on Delivery is permanently disabled. Please complete your order using Online Pre-Payment.' },
        { status: 400 }
      )
    }

    // Server-side shipping fee calculation (mirrors CheckoutPage location rates + thresholds; never trusts client shipping_fee)
    // Extract state from shipping_address (format: "address, city, state - pincode")
    const addrWithoutPin = cleanAddress.replace(/\s*[-–,]?\s*\b\d{6}\b\s*$/, '').trim()
    const addrParts = addrWithoutPin.split(',').map((p: string) => p.trim().toLowerCase()).filter(Boolean)
    const extractedState = addrParts.length > 0 ? addrParts[addrParts.length - 1] : ''
    const addrLower = cleanAddress.toLowerCase()

    let matchedLocationFee: number | null = null
    let defaultZoneFee: number | null = null
    if (Array.isArray(settings.location_delivery_rates)) {
      for (const loc of settings.location_delivery_rates) {
        if (!loc?.states) continue
        const stateList = String(loc.states)
          .split(',')
          .map((s: string) => s.trim().toLowerCase())
          .filter(Boolean)
        if (stateList.some((s: string) => s.includes('all other'))) {
          defaultZoneFee = Number(loc.fee)
          continue
        }
        const stateMatch = extractedState
          ? stateList.some((s: string) => extractedState.includes(s) || s.includes(extractedState))
          : stateList.some((s: string) => s.length > 2 && addrLower.includes(s))
        if (stateMatch) {
          matchedLocationFee = Number(loc.fee)
          break
        }
      }
    }

    const baseStandardFee =
      matchedLocationFee !== null
        ? matchedLocationFee
        : defaultZoneFee !== null
        ? defaultZoneFee
        : typeof settings.default_delivery_fee === 'number'
        ? settings.default_delivery_fee
        : 100

    const freeThreshold =
      typeof settings.free_shipping_threshold === 'number' ? settings.free_shipping_threshold : 1500
    const isFreeShipping = settings.enable_free_shipping !== false && subtotal >= freeThreshold
    const standardShippingCost = isFreeShipping ? 0 : baseStandardFee

    const deliveryMethodsEnabled = settings.enable_delivery_methods !== false
    const expressEnabled = deliveryMethodsEnabled && Boolean(settings.enable_express_dispatch)
    const expressAddonFee = typeof settings.express_dispatch_fee === 'number' ? settings.express_dispatch_fee : 150

    const shippingFee =
      expressEnabled && body.delivery_method === 'EXPRESS'
        ? standardShippingCost + expressAddonFee
        : standardShippingCost
    const totalAmount = Math.round((subtotal + shippingFee) * 100) / 100

    const orderNumber = generateOrderNumber()
    const cfOrderId = `cf_${orderNumber}`
    const customerId = currentUser?.id ? `cust_${currentUser.id}` : `guest_${orderNumber}`

    // 3. Testing / Checking Mode: When PAYMENT=false, bypass Cashfree API completely
    // Allows placing and verifying orders without invoking external Cashfree endpoints.
    if (!cashfreeService.isPaymentEnabled) {
      const testPendingOrder = {
        order_number: orderNumber,
        user_id: currentUser?.id || null,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        shipping_address: cleanAddress,
        items: itemsJsonList,
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        cashfree_order_id: `test_${orderNumber}`,
        cashfree_payment_session_id: `test_session_${orderNumber}`,
        payment_method: 'Test Mode (Cashfree Bypassed)',
      }

      const persistRes = await persistPaidOrder(testPendingOrder)
      if (persistRes.error) {
        return NextResponse.json({ detail: persistRes.error }, { status: 500 })
      }

      return NextResponse.json({
        order_number: orderNumber,
        cashfree_order_id: `test_${orderNumber}`,
        payment_session_id: '',
        total_amount: totalAmount,
        status: 'PAID',
        payment_bypass: true,
        message: 'Order created in test mode without calling Cashfree API.',
      })
    }

    // Handle Online Pre-Payment via Cashfree PG
    // Resolve the canonical frontend URL — FRONTEND_URL env var must be set to your custom domain
    // in Vercel (e.g. https://www.thechemicalbrothers.in). VERCEL_URL is a preview subdomain only.
    const baseUrl = (
      process.env.FRONTEND_URL ||
      serverConfig.FRONTEND_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.thechemicalbrothers.in')
    ).trim().replace(/\/+$/, '')
    const returnUrl = `${baseUrl}/order-confirmation?order_id=${orderNumber}`

    const cfResult = await cashfreeService.createOrder({
      order_id: cfOrderId,
      order_amount: totalAmount,
      customer_id: customerId,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
      customer_name: cleanName,
      return_url: returnUrl,
    })

    if (!cfResult.success || !cfResult.data) {
      return NextResponse.json(
        { detail: cfResult.error || 'Unable to initialize Cashfree payment gateway session. Please try again.' },
        { status: 500 }
      )
    }

    const pendingOrder = {
      order_number: orderNumber,
      user_id: currentUser?.id || null,
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
      shipping_address: cleanAddress,
      items: itemsJsonList,
      subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      cashfree_order_id: cfOrderId,
      cashfree_payment_session_id: cfResult.data.payment_session_id || '',
      payment_method: 'Cashfree PG',
    }

    // Log Awaiting Payment checkout in `audit_logs` ONLY (do NOT insert into `orders`).
    // Only paid & confirmed orders are written to `orders`. Cashfree webhooks read this
    // audit log entry if a customer closes their browser after UPI payment.
    await saveAwaitingPaymentOrder(pendingOrder)

    return NextResponse.json({
      order_number: orderNumber,
      cashfree_order_id: cfOrderId,
      payment_session_id: cfResult.data.payment_session_id || '',
      total_amount: totalAmount,
      cf_environment: serverConfig.CASHFREE_ENV,
      pending_order: pendingOrder,
    })
  } catch (err: any) {
    console.error('Error in create order API:', err)
    return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
  }
}
