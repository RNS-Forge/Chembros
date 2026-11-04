import nodemailer from 'nodemailer'
import { serverConfig } from './server-config'

function cleanText(text?: string): string {
  if (!text) return ''
  return text
    .replace(/[±]/g, '-')
    .replace(/\u00B1/g, '-')
    .replace(/Â±/g, '-')
    .replace(/\s*-\s*([0-9]{6})/g, ' - $1')
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}): Promise<boolean> {
  // 1. HTTPS Webhook Gateway
  if (serverConfig.EMAIL_WEBHOOK_URL) {
    try {
      const res = await fetch(serverConfig.EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      })
      if (res.ok) return true
    } catch (err) {
      console.warn('Webhook email dispatch note:', err)
    }
  }

  // 2. Brevo HTTPS API
  if (serverConfig.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': serverConfig.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Chembros Parfums', email: serverConfig.SMTP_FROM },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      })
      if (res.ok) return true
    } catch (err) {
      console.warn('Brevo email dispatch note:', err)
    }
  }

  // 3. Resend HTTPS API
  if (serverConfig.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serverConfig.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Chembros Parfums <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
        }),
      })
      if (res.ok) return true
    } catch (err) {
      console.warn('Resend email dispatch note:', err)
    }
  }

  // 4. Nodemailer via SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: serverConfig.SMTP_HOST,
      port: serverConfig.SMTP_PORT,
      secure: serverConfig.SMTP_PORT === 465,
      auth: {
        user: serverConfig.SMTP_USER,
        pass: serverConfig.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    await transporter.sendMail({
      from: `"Chembros Parfums" <${serverConfig.SMTP_FROM}>`,
      to,
      subject,
      html,
      attachments: attachments || undefined,
    })
    return true
  } catch (smtpErr) {
    console.warn('Nodemailer SMTP dispatch note:', smtpErr)
  }

  // 5. Supabase Auth OTP Fallback
  try {
    const res = await fetch(`${serverConfig.SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serverConfig.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${serverConfig.SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ email: to }),
    })
    if (res.ok) return true
  } catch (supaErr) {
    console.warn('Supabase Auth OTP dispatch note:', supaErr)
  }

  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE EMAIL LAYOUT WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function wrapEmailHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chembros Parfums</title>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
        <!-- Minimal Header -->
        <tr>
            <td style="padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                <div style="font-size: 20px; font-weight: 800; letter-spacing: 5px; color: #000000; text-transform: uppercase;">CHEM BROS</div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 2.5px; color: #6b7280; text-transform: uppercase; margin-top: 4px;">HAUTE PARFUMERIE</div>
            </td>
        </tr>

        <!-- Main Body -->
        <tr>
            <td style="padding: 32px 24px;">
                ${content}
            </td>
        </tr>

        <!-- Minimal Footer -->
        <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f3f4f6; padding: 24px 24px; text-align: center;">
                <div style="font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #4b5563; text-transform: uppercase;">
                    Chembros Parfums Private Limited
                </div>
                <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                    Madurai, Tamil Nadu, India
                </div>
                <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                    Questions? Contact us at <a href="mailto:connect@thechemicalbrothers.in" style="color: #000000; text-decoration: underline;">connect@thechemicalbrothers.in</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTH & OTP EMAILS
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOtpEmail(
  to_email: string,
  otp_code: string,
  options?: {
    purpose?: string
    headline?: string
    message?: string
  }
): Promise<boolean> {
  const badge = options?.purpose ? options.purpose.toUpperCase() : 'VERIFICATION CODE'
  const headline = options?.headline || 'Your Verification Code'
  const message =
    options?.message ||
    'Use the one-time code below to access your Chembros account and orders.'
  const subject = options?.purpose
    ? `Chembros ${options.purpose}: ${otp_code}`
    : `Your Chembros Access Code: ${otp_code}`

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; background-color: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 9999px;">
            ${badge}
        </span>
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 12px 0 6px; line-height: 1.3;">
            ${headline}
        </h1>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563; margin: 0 auto; max-width: 420px;">
            ${message}
        </p>
    </div>

    <!-- OTP Code Display -->
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 24px 16px; margin: 0 auto 24px; text-align: center;">
        <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #000000; margin-bottom: 8px;">
            ${otp_code}
        </div>
        <div style="font-size: 11px; color: #6b7280;">
            This code expires in 10 minutes. Do not share it with anyone.
        </div>
    </div>
  `

  return await sendEmail({ to: to_email, subject, html: wrapEmailHtml(content) })
}

export async function sendPasswordResetOtpEmail(
  to_email: string,
  otp_code: string
): Promise<boolean> {
  const subject = `Reset Your Password - Chembros Code: ${otp_code}`
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; background-color: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 9999px;">
            PASSWORD RESET
        </span>
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 12px 0 6px; line-height: 1.3;">
            Reset Your Chembros Password
        </h1>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563; margin: 0 auto; max-width: 420px;">
            We received a request to reset your password. Enter the code below to choose a new password.
        </p>
    </div>

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 24px 16px; margin: 0 auto 24px; text-align: center;">
        <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #000000; margin-bottom: 8px;">
            ${otp_code}
        </div>
        <div style="font-size: 11px; color: #6b7280;">
            This code expires in 10 minutes. If you did not request this, you can ignore this email.
        </div>
    </div>
  `

  return await sendEmail({ to: to_email, subject, html: wrapEmailHtml(content) })
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORDER PROGRESS TIMELINE (Clean, numbered 4-stage bar)
// ─────────────────────────────────────────────────────────────────────────────
function renderProgressTimeline(stageNum: number): string {
  const stages = [
    { num: 1, label: 'Placed' },
    { num: 2, label: 'Confirmed' },
    { num: 3, label: 'Shipped' },
    { num: 4, label: 'Delivered' },
  ]

  const cols = stages
    .map((s) => {
      const isDoneOrCurrent = s.num <= stageNum
      const isCurrent = s.num === stageNum
      const bgColor = isDoneOrCurrent ? '#000000' : '#e5e7eb'
      const textColor = isDoneOrCurrent ? '#ffffff' : '#6b7280'
      const labelColor = isCurrent ? '#000000' : isDoneOrCurrent ? '#374151' : '#9ca3af'
      const labelWeight = isCurrent ? '700' : '500'

      return `
        <td style="width: 25%; padding: 0 4px; vertical-align: top; text-align: center;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${bgColor}; color: ${textColor}; line-height: 26px; margin: 0 auto 6px; font-size: 11px; font-weight: 700;">
                ${s.num}
            </div>
            <div style="font-size: 10px; font-weight: ${labelWeight}; text-transform: uppercase; letter-spacing: 0.5px; color: ${labelColor};">
                ${s.label}
            </div>
        </td>`
    })
    .join('')

  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 24px; background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 14px 8px;">
        <tr>
            ${cols}
        </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. E-COMMERCE ORDER TEMPLATE BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildOrderHtml(params: {
  titleBadge: string
  headline: string
  messageText: string
  stageNum: number
  orderNumber: string
  customerName: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
  trackingNumber?: string
  carrier?: string
  showReviewPrompt?: boolean
  productId?: string | number
}): string {
  const trackingUrl = `${serverConfig.FRONTEND_URL}/order-confirmation?order_id=${params.orderNumber}`
  const timelineHtml = renderProgressTimeline(params.stageNum)

  // Tracking box
  const trackingBox = params.trackingNumber
    ? `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 18px 0; text-align: center;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">
              Courier Tracking ID (${params.carrier || 'Express Courier'})
          </div>
          <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 18px; font-weight: 700; color: #000000; letter-spacing: 1.5px;">
              ${cleanText(params.trackingNumber)}
          </div>
      </div>`
    : ''

  // Delivery Address box
  const addressBox = params.shippingAddress
    ? `
      <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">
              Delivery Address
          </div>
          <div style="font-size: 13px; color: #111827; line-height: 1.5; font-weight: 500;">
              ${cleanText(params.shippingAddress)}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
              Recipient: ${cleanText(params.customerName)}
          </div>
      </div>`
    : ''

  // Review Invitation for Delivered Status
  const reviewCard = params.showReviewPrompt
    ? `
      <div style="background-color: #000000; color: #ffffff; border-radius: 16px; padding: 24px 20px; margin: 28px 0; text-align: center;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px;">
              WE VALUE YOUR FEEDBACK
          </div>
          <h2 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 8px;">
              How does your fragrance wear?
          </h2>
          <p style="font-size: 13px; line-height: 1.5; color: #d1d5db; margin: 0 auto 16px; max-width: 380px;">
              Share your honest wear experience, longevity, and scent notes with our fragrance community.
          </p>

          <!-- Interactive Star Row -->
          <div style="margin-bottom: 18px;">
              <a href="${serverConfig.FRONTEND_URL}/fragrances" style="text-decoration: none; font-size: 24px; color: #f59e0b; margin: 0 2px;">★</a>
              <a href="${serverConfig.FRONTEND_URL}/fragrances" style="text-decoration: none; font-size: 24px; color: #f59e0b; margin: 0 2px;">★</a>
              <a href="${serverConfig.FRONTEND_URL}/fragrances" style="text-decoration: none; font-size: 24px; color: #f59e0b; margin: 0 2px;">★</a>
              <a href="${serverConfig.FRONTEND_URL}/fragrances" style="text-decoration: none; font-size: 24px; color: #f59e0b; margin: 0 2px;">★</a>
              <a href="${serverConfig.FRONTEND_URL}/fragrances" style="text-decoration: none; font-size: 24px; color: #f59e0b; margin: 0 2px;">★</a>
          </div>

          <div>
              <a href="${serverConfig.FRONTEND_URL}/fragrances" style="background-color: #ffffff; color: #000000; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 12px 28px; border-radius: 9999px; display: inline-block;">
                  WRITE A REVIEW &rarr;
              </a>
          </div>
      </div>`
    : ''

  const content = `
    <!-- Top Pill & Headline -->
    <div style="margin-bottom: 20px;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; background-color: #f3f4f6; color: #111827; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
            ${params.titleBadge}
        </span>
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px; line-height: 1.3;">
            ${params.headline}
        </h1>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563; margin: 0;">
            ${params.messageText}
        </p>
    </div>

    ${timelineHtml}

    <!-- Primary Track Order Button -->
    <div style="text-align: center; margin: 20px 0 24px;">
        <a href="${trackingUrl}" style="background-color: #000000; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            VIEW ORDER STATUS &rarr;
        </a>
    </div>

    ${trackingBox}

    <!-- Order Meta Block -->
    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; padding: 3px 0;">Order Number</td>
                <td style="font-size: 13px; font-weight: 700; font-family: monospace; color: #000000; text-align: right; padding: 3px 0;">#${cleanText(params.orderNumber)}</td>
            </tr>
            <tr>
                <td style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; padding: 3px 0;">Customer</td>
                <td style="font-size: 12px; font-weight: 600; color: #111827; text-align: right; padding: 3px 0;">${cleanText(params.customerName)}</td>
            </tr>
        </table>
    </div>

    ${addressBox}

    <!-- Items Summary -->
    <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #111827; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;">
            Items Ordered
        </div>
        <div style="font-size: 13px; line-height: 1.6; color: #374151; white-space: pre-line;">
            ${cleanText(params.itemsSummary)}
        </div>
    </div>

    <!-- Total Paid -->
    <div style="border-top: 1px solid #000000; padding-top: 14px; text-align: right;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-right: 8px;">Total:</span>
        <span style="font-size: 18px; font-weight: 800; color: #000000;">₹${Number(params.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>

    ${reviewCard}
  `

  return wrapEmailHtml(content)
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ATTACHMENT & INVOICE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function parseItemsSummaryToInvoiceItems(summary: string, total: number) {
  if (!summary) return [{ name: 'Chembros Extrait de Parfum', price: total, quantity: 1 }]
  const lines = summary.split('\n').map((l) => l.trim()).filter(Boolean)
  const items: any[] = []
  for (const line of lines) {
    const match = line.match(
      /[•\-\*]?\s*(.*?)(?:\s*\((\d+)ml\))?\s*[×x]\s*(\d+)\s*[-—–]\s*Rs\.?\s*([\d,]+)/i
    )
    if (match) {
      items.push({
        name: match[1].trim(),
        volume_ml: match[2] ? Number(match[2]) : 30,
        quantity: match[3] ? Number(match[3]) : 1,
        price: match[4] ? Number(match[4].replace(/,/g, '')) / (Number(match[3]) || 1) : total,
      })
    } else {
      items.push({
        name: line.replace(/^[•\-\*]\s*/, '').trim(),
        quantity: 1,
        price: total,
      })
    }
  }
  return items.length > 0 ? items : [{ name: 'Chembros Extrait de Parfum', price: total, quantity: 1 }]
}

async function getInvoiceAttachment(params: {
  orderNumber: string
  customerName: string
  toEmail: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
}) {
  try {
    const { supabaseAdmin } = await import('./supabase-admin')
    const { data: dbOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', params.orderNumber)
      .maybeSingle()

    let invoiceData: any
    if (dbOrder) {
      let itemsList: any[] = []
      try {
        itemsList = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items || []
      } catch {
        itemsList = []
      }
      invoiceData = {
        id: dbOrder.id,
        order_number: dbOrder.order_number,
        created_at: dbOrder.created_at,
        customer_name: dbOrder.customer_name || params.customerName,
        customer_email: dbOrder.customer_email || params.toEmail,
        customer_phone: dbOrder.customer_phone || '',
        shipping_address: cleanText(dbOrder.shipping_address || params.shippingAddress || ''),
        items: itemsList,
        subtotal: Number(dbOrder.subtotal) || Number(params.totalAmount),
        shipping_fee: Number(dbOrder.shipping_fee) || 0,
        total_amount: Number(dbOrder.total_amount) || Number(params.totalAmount),
        payment_status: dbOrder.payment_status || 'PAID',
        payment_method: dbOrder.payment_method || 'Online / UPI',
        cashfree_payment_id: dbOrder.cashfree_payment_id || dbOrder.cashfree_order_id,
      }
    } else {
      invoiceData = {
        order_number: params.orderNumber,
        created_at: new Date().toISOString(),
        customer_name: params.customerName,
        customer_email: params.toEmail,
        customer_phone: '',
        shipping_address: cleanText(params.shippingAddress || ''),
        items: parseItemsSummaryToInvoiceItems(params.itemsSummary, params.totalAmount),
        subtotal: params.totalAmount,
        shipping_fee: 0,
        total_amount: params.totalAmount,
        payment_status: 'PAID',
      }
    }

    const { generateInvoicePdfBuffer } = await import('./invoice-generator')
    const pdfBuf = await generateInvoicePdfBuffer(invoiceData)
    return [
      {
        filename: `Tax-Invoice-${params.orderNumber}.pdf`,
        content: pdfBuf,
        contentType: 'application/pdf',
      },
    ]
  } catch (err) {
    console.warn('Invoice attachment generation note:', err)
    return undefined
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PUBLIC E-COMMERCE EMAIL DISPATCHERS
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOrderPlacedEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
}): Promise<boolean> {
  const subject = `Order Confirmed #${cleanText(params.orderNumber)} - Chembros Parfums`
  const html = buildOrderHtml({
    titleBadge: 'Order Confirmed',
    headline: `Thank You, ${cleanText(params.customerName)}!`,
    messageText:
      'We have received your order. Our atelier is carefully preparing your fragrances for packaging.',
    stageNum: 1,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
  })
  const attachments = await getInvoiceAttachment(params)
  return await sendEmail({ to: params.toEmail, subject, html, attachments })
}

export async function sendPaymentDoneEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
}): Promise<boolean> {
  const subject = `Payment Received for Order #${cleanText(params.orderNumber)}`
  const html = buildOrderHtml({
    titleBadge: 'Payment Verified',
    headline: `Payment Confirmed, ${cleanText(params.customerName)}`,
    messageText: `Your payment of ₹${Number(params.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been received. Your order is confirmed and queued for packing.`,
    stageNum: 2,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
  })
  const attachments = await getInvoiceAttachment(params)
  return await sendEmail({ to: params.toEmail, subject, html, attachments })
}

export async function sendOrderShippedEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  trackingNumber: string
  shippingAddress?: string
  carrier?: string
}): Promise<boolean> {
  const subject = `Your Order #${cleanText(params.orderNumber)} Has Been Shipped!`
  const html = buildOrderHtml({
    titleBadge: 'Order Dispatched',
    headline: `Your Fragrance is on its Way, ${cleanText(params.customerName)}`,
    messageText:
      'Your order has been handed over to our courier partner for priority express delivery.',
    stageNum: 3,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
    trackingNumber: params.trackingNumber,
    carrier: params.carrier || 'Express Courier',
  })
  const attachments = await getInvoiceAttachment(params)
  return await sendEmail({ to: params.toEmail, subject, html, attachments })
}

export async function sendDeliveryTodayEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  trackingNumber?: string
  shippingAddress?: string
  carrier?: string
}): Promise<boolean> {
  const subject = `Out for Delivery Today - Chembros Order #${cleanText(params.orderNumber)}`
  const html = buildOrderHtml({
    titleBadge: 'Arriving Today',
    headline: `Your Package Arrives Today!`,
    messageText:
      'Your order is out for delivery with our courier executive. Please ensure someone is available at your address to receive it.',
    stageNum: 3,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
    trackingNumber: params.trackingNumber,
    carrier: params.carrier,
  })
  return await sendEmail({ to: params.toEmail, subject, html })
}

export async function sendOrderDeliveredEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
}): Promise<boolean> {
  const subject = `Delivered: Chembros Order #${cleanText(params.orderNumber)}`
  const html = buildOrderHtml({
    titleBadge: 'Delivered',
    headline: `Your Fragrances Have Arrived!`,
    messageText:
      'Your package has been delivered successfully. We hope you enjoy wearing your new fragrance formulation.',
    stageNum: 4,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
    showReviewPrompt: true, // Enables the interactive 5-star review request card
  })
  return await sendEmail({ to: params.toEmail, subject, html })
}

export async function sendOrderCancelledEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  reason?: string
  shippingAddress?: string
}): Promise<boolean> {
  const subject = `Order #${cleanText(params.orderNumber)} Cancelled`
  const reasonText = params.reason
    ? `<div style="font-size: 12px; color: #dc2626; margin-top: 6px; font-weight: 500;">Reason: ${params.reason}</div>`
    : ''
  const trackingUrl = `${serverConfig.FRONTEND_URL}/dashboard?tab=orders`

  const addressBox = params.shippingAddress
    ? `
      <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">Destination Address</div>
          <div style="font-size: 13px; color: #111827; line-height: 1.5; font-weight: 500;">${cleanText(params.shippingAddress)}</div>
      </div>`
    : ''

  const content = `
    <div style="margin-bottom: 20px;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; background-color: #fee2e2; color: #b91c1c; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
            ORDER CANCELLED
        </span>
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px; line-height: 1.3;">
            Order #${cleanText(params.orderNumber)} Has Been Cancelled
        </h1>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563; margin: 0;">
            Your order has been cancelled. If payment was completed, your refund has been initiated and will reflect in your original payment account within 3 to 5 business days.
        </p>
        ${reasonText}
    </div>

    <!-- Order Meta Block -->
    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 14px 16px; margin: 20px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; padding: 3px 0;">Order Reference</td>
                <td style="font-size: 13px; font-weight: 700; font-family: monospace; color: #000000; text-align: right; padding: 3px 0;">#${cleanText(params.orderNumber)}</td>
            </tr>
            <tr>
                <td style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; padding: 3px 0;">Refund Amount</td>
                <td style="font-size: 14px; font-weight: 700; color: #000000; text-align: right; padding: 3px 0;">₹${Number(params.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
        </table>
    </div>

    ${addressBox}

    <!-- Primary Button -->
    <div style="text-align: center; margin: 24px 0 10px;">
        <a href="${trackingUrl}" style="background-color: #000000; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 9999px; display: inline-block;">
            VIEW YOUR ACCOUNT &rarr;
        </a>
    </div>
  `

  return await sendEmail({ to: params.toEmail, subject, html: wrapEmailHtml(content) })
}

export async function sendOrderStatusEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  newStatus: string
  totalAmount: number
  itemsSummary: string
  trackingNumber?: string
  shippingAddress?: string
}): Promise<boolean> {
  const statusLower = (params.newStatus || '').toLowerCase()

  if (statusLower.includes('cancel')) {
    return await sendOrderCancelledEmail(params)
  } else if (statusLower.includes('shipped') || statusLower.includes('dispatch')) {
    let carrier = 'Express Courier'
    let trackingNum = params.trackingNumber || 'CB-EXP-9921'
    if (params.trackingNumber && params.trackingNumber.includes(' - ')) {
      const parts = params.trackingNumber.split(' - ')
      carrier = parts[0].trim()
      trackingNum = parts.slice(1).join(' - ').trim()
    }
    return await sendOrderShippedEmail({
      ...params,
      trackingNumber: trackingNum,
      carrier,
    })
  } else if (statusLower.includes('today') || statusLower.includes('out')) {
    return await sendDeliveryTodayEmail(params)
  } else if (statusLower.includes('deliver')) {
    return await sendOrderDeliveredEmail(params)
  } else if (statusLower.includes('paid')) {
    return await sendPaymentDoneEmail(params)
  }

  // Fallback update
  const subject = `Order #${cleanText(params.orderNumber)} Status: ${params.newStatus}`
  const html = buildOrderHtml({
    titleBadge: params.newStatus.toUpperCase(),
    headline: `Status Update: ${params.newStatus}`,
    messageText: `Your Chembros fragrance order status has been updated to: ${params.newStatus}.`,
    stageNum: 2,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
    trackingNumber: params.trackingNumber,
  })
  return await sendEmail({ to: params.toEmail, subject, html })
}