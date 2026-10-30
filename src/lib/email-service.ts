import nodemailer from 'nodemailer'
import { serverConfig } from './server-config'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
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

  // 4. Nodemailer via Gmail SMTP
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
    })
    return true
  } catch (smtpErr) {
    console.warn('Nodemailer SMTP dispatch note:', smtpErr)
  }

  // 5. Supabase Auth OTP Fallback (if OTP email)
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

export async function sendOtpEmail(to_email: string, otp_code: string): Promise<boolean> {
  const subject = `Chembros Access Passcode: ${otp_code}`
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chembros Verification</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);">
        <tr>
            <td style="background-color: #000000; padding: 36px 32px 30px; text-align: center;">
                <div style="font-size: 22px; font-weight: 700; letter-spacing: 6px; color: #ffffff; text-transform: uppercase;">CHEM BROS</div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 3px; color: #a1a1aa; text-transform: uppercase; margin-top: 8px;">Haute Parfumerie &amp; Chemistry</div>
            </td>
        </tr>
        <tr>
            <td style="height: 1px; background-color: #27272a; line-height: 1px; font-size: 1px;">&nbsp;</td>
        </tr>
        <tr>
            <td style="padding: 40px 36px 32px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #71717a; margin-bottom: 12px;">Authentication Passcode</div>
                <h1 style="font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 16px; line-height: 1.4;">Sign in to Chembros Parfums</h1>
                <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 28px;">
                    Enter the one-time verification passcode below to access your bespoke formulations, orders, and laboratory archive.
                </p>
                <div style="background-color: #fafafa; border: 1px solid #000000; border-radius: 14px; padding: 24px 20px; margin: 0 auto 24px; text-align: center;">
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #000000; text-align: center; margin: 0 auto; user-select: all; -webkit-user-select: all;">
                        ${otp_code}
                    </div>
                    <div style="margin-top: 14px;">
                        <span style="display: inline-block; padding: 8px 18px; background-color: #000000; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-radius: 9999px; user-select: all; -webkit-user-select: all;">
                            Copy Code: ${otp_code}
                        </span>
                    </div>
                    <div style="font-size: 11px; color: #71717a; margin-top: 8px;">
                        Tap or click above to copy code to clipboard
                    </div>
                </div>
                <div style="border-top: 1px solid #f4f4f5; padding-top: 24px; text-align: left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 12px; line-height: 1.6; color: #71717a;">
                                <strong style="color: #18181b;">Security Protocol:</strong> This passcode remains valid for 10 minutes and is single-use. Chembros representatives will never ask for this code.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 24px 32px; text-align: center;">
                <div style="font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: #71717a; text-transform: uppercase;">
                    Chembros Parfums Private Limited
                </div>
                <div style="font-size: 11px; color: #a1a1aa; margin-top: 6px;">
                    Chemistry Captured in a Bottle. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
  return await sendEmail({ to: to_email, subject, html })
}

export async function sendPasswordResetOtpEmail(to_email: string, otp_code: string): Promise<boolean> {
  const subject = `Chembros Password Reset Passcode: ${otp_code}`
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chembros Password Reset</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);">
        <tr>
            <td style="background-color: #000000; padding: 36px 32px 30px; text-align: center;">
                <div style="font-size: 22px; font-weight: 700; letter-spacing: 6px; color: #ffffff; text-transform: uppercase;">CHEM BROS</div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 3px; color: #a1a1aa; text-transform: uppercase; margin-top: 8px;">Haute Parfumerie &amp; Chemistry</div>
            </td>
        </tr>
        <tr>
            <td style="height: 1px; background-color: #27272a; line-height: 1px; font-size: 1px;">&nbsp;</td>
        </tr>
        <tr>
            <td style="padding: 40px 36px 32px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #71717a; margin-bottom: 12px;">Laboratory Security Protocol</div>
                <h1 style="font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 16px; line-height: 1.4;">Reset Your Account Password</h1>
                <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 28px;">
                    We received a request to reset the password associated with your Chembros client account. Enter the verification passcode below to choose a new password.
                </p>
                <div style="background-color: #fafafa; border: 1px solid #000000; border-radius: 14px; padding: 24px 20px; margin: 0 auto 24px; text-align: center;">
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #000000; text-align: center; margin: 0 auto; user-select: all; -webkit-user-select: all;">
                        ${otp_code}
                    </div>
                    <div style="margin-top: 14px;">
                        <span style="display: inline-block; padding: 8px 18px; background-color: #000000; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-radius: 9999px; user-select: all; -webkit-user-select: all;">
                            Copy Code: ${otp_code}
                        </span>
                    </div>
                    <div style="font-size: 11px; color: #71717a; margin-top: 8px;">
                        Tap or click above to copy code to clipboard
                    </div>
                </div>
                <div style="border-top: 1px solid #f4f4f5; padding-top: 24px; text-align: left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 12px; line-height: 1.6; color: #71717a;">
                                <strong style="color: #18181b;">Security Notice:</strong> This reset code expires in 10 minutes. If you did not initiate this request, your account remains secure and you may safely disregard this message.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 24px 32px; text-align: center;">
                <div style="font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: #71717a; text-transform: uppercase;">
                    Chembros Parfums Private Limited
                </div>
                <div style="font-size: 11px; color: #a1a1aa; margin-top: 6px;">
                    Chemistry Captured in a Bottle. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
  return await sendEmail({ to: to_email, subject, html })
}

function renderProgressTimeline(stageNum: number): string {
  const stages = [
    { num: 1, label: 'Placed' },
    { num: 2, label: 'Paid' },
    { num: 3, label: 'Shipped' },
    { num: 4, label: 'Out Today' },
    { num: 5, label: 'Delivered' },
  ]

  const cols = stages
    .map((s) => {
      const isDoneOrCurrent = s.num <= stageNum
      const isCurrent = s.num === stageNum
      const bgColor = isDoneOrCurrent ? '#000000' : '#e4e4e7'
      const textColor = isDoneOrCurrent ? '#ffffff' : '#71717a'
      const labelColor = isCurrent ? '#000000' : isDoneOrCurrent ? '#52525b' : '#a1a1aa'
      const labelWeight = isCurrent ? '700' : '500'
      const border = isCurrent ? '2px solid #000000' : 'none'

      return `
        <td style="width: 20%; padding: 0 4px; vertical-align: top; text-align: center;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${bgColor}; color: ${textColor}; line-height: 30px; margin: 0 auto 6px; font-size: 12px; font-weight: 700; border: ${border};">
                ${s.num}
            </div>
            <div style="font-size: 10px; font-weight: ${labelWeight}; text-transform: uppercase; letter-spacing: 1px; color: ${labelColor};">
                ${s.label}
            </div>
        </td>`
    })
    .join('')

  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 28px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 18px 12px;">
        <tr>
            ${cols}
        </tr>
    </table>`
}

function renderTrackingButton(trackingUrl: string): string {
  return `
    <div style="text-align: center; margin: 32px 0 28px;">
        <a href="${trackingUrl}" style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; text-decoration: none; padding: 16px 36px; border-radius: 50px; display: inline-block; box-shadow: 0 6px 18px rgba(0,0,0,0.18);">
            TRACK YOUR SHIPMENT &rarr;
        </a>
        <div style="font-size: 11px; color: #71717a; margin-top: 10px; font-family: monospace;">
            Direct Order Monograph &bull; Real-time Telemetry
        </div>
    </div>`
}

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
}): string {
  const trackingUrl = `${serverConfig.FRONTEND_URL}/order-confirmation?order_id=${params.orderNumber}`
  const timelineHtml = renderProgressTimeline(params.stageNum)
  const buttonHtml = renderTrackingButton(trackingUrl)

  const trackingBox = params.trackingNumber
    ? `
        <div style="background-color: #fafafa; border: 1px dashed #000000; border-radius: 10px; padding: 18px; margin: 20px 0; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">Waybill Consignment Tracking Number</div>
            <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 20px; font-weight: 700; color: #000000; letter-spacing: 3px;">${params.trackingNumber}</div>
            <div style="font-size: 11px; color: #52525b; margin-top: 4px;">Carrier Service: ${params.carrier || 'Chembros Priority Express'}</div>
        </div>`
    : ''

  const addressBox = params.shippingAddress
    ? `
        <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #71717a; margin-bottom: 6px;">White-Glove Delivery Destination</div>
            <div style="font-size: 13px; color: #18181b; line-height: 1.5; font-weight: 500;">${params.shippingAddress}</div>
            <div style="font-size: 12px; color: #71717a; margin-top: 4px;">Recipient: ${params.customerName}</div>
        </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${params.headline}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);">
        <tr>
            <td style="background-color: #000000; padding: 36px 32px 30px; text-align: center;">
                <div style="font-size: 22px; font-weight: 700; letter-spacing: 6px; color: #ffffff; text-transform: uppercase;">CHEM BROS</div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 3px; color: #a1a1aa; text-transform: uppercase; margin-top: 8px;">Haute Parfumerie &amp; Chemistry</div>
            </td>
        </tr>
        <tr>
            <td style="padding: 36px 32px 28px;">
                <div style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 50px; margin-bottom: 14px;">
                    ${params.titleBadge}
                </div>

                <h1 style="font-size: 22px; font-weight: 700; color: #18181b; margin: 0 0 12px; line-height: 1.3;">
                    ${params.headline}
                </h1>
                <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 20px;">
                    ${params.messageText}
                </p>

                ${timelineHtml}
                ${buttonHtml}
                ${trackingBox}

                <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 12px; color: #71717a; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">Order Reference</td>
                            <td style="font-size: 14px; font-weight: 700; color: #000000; text-align: right; padding: 4px 0; font-family: monospace;">#${params.orderNumber}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 12px; color: #71717a; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">Client Name</td>
                            <td style="font-size: 13px; font-weight: 600; color: #18181b; text-align: right; padding: 4px 0;">${params.customerName}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 12px; color: #71717a; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">Fulfillment Status</td>
                            <td style="font-size: 12px; font-weight: 700; color: #000000; text-align: right; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">${params.titleBadge}</td>
                        </tr>
                    </table>
                </div>

                ${addressBox}

                <div style="margin-bottom: 24px;">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #18181b; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e4e4e7;">
                        Curated Formulations
                    </div>
                    <div style="font-size: 13px; line-height: 1.7; color: #3f3f46; white-space: pre-line;">
                        ${params.itemsSummary}
                    </div>
                </div>

                <div style="border-top: 2px solid #000000; padding-top: 18px; text-align: right;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; margin-right: 12px;">Total Acquisition:</span>
                    <span style="font-size: 22px; font-weight: 800; color: #000000;">Rs. ${Number(params.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 24px 32px; text-align: center;">
                <div style="font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: #71717a; text-transform: uppercase;">
                    Chembros Parfums Private Limited
                </div>
                <div style="font-size: 11px; color: #a1a1aa; margin-top: 6px;">
                    Chemistry Captured in a Bottle. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}

export async function sendOrderPlacedEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
}): Promise<boolean> {
  const subject = `Chembros Order #${params.orderNumber} Received & Confirmed`
  const html = buildOrderHtml({
    titleBadge: '1. ORDER PLACED',
    headline: `Your Flacon Order is Confirmed, ${params.customerName}`,
    messageText:
      'Your luxury fragrance order has been received. Our olfactory chemists have commenced formulating and hand-decanting your selection with white-glove care.',
    stageNum: 1,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
  })
  return await sendEmail({ to: params.toEmail, subject, html })
}

export async function sendPaymentDoneEmail(params: {
  toEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  itemsSummary: string
  shippingAddress?: string
}): Promise<boolean> {
  const subject = `Payment Confirmed - Chembros Order #${params.orderNumber}`
  const html = buildOrderHtml({
    titleBadge: '2. PAYMENT CONFIRMED',
    headline: `Payment Received for Order #${params.orderNumber}`,
    messageText: `Your transaction of Rs. ${Number(params.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been verified and settled via Cashfree PG. Your formulation order has been locked into the laboratory decanting queue.`,
    stageNum: 2,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
  })
  return await sendEmail({ to: params.toEmail, subject, html })
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
  const subject = `Your Chembros Order #${params.orderNumber} Has Been Shipped`
  const html = buildOrderHtml({
    titleBadge: '3. DISPATCHED & SHIPPED',
    headline: `Your Bespoke Fragrance Has Shipped, ${params.customerName}`,
    messageText:
      'Your handcrafted extrait flacons have passed our final olfactory inspection and have been handed to our secure courier partner for expedited white-glove transit.',
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
  const subject = `Out for Delivery Today - Chembros Order #${params.orderNumber}`
  const html = buildOrderHtml({
    titleBadge: '4. DELIVERY BY TODAY',
    headline: `Your Package is Arriving Today, ${params.customerName}`,
    messageText:
      'Your Chembros acquisition is out for delivery today. Our courier representative will arrive at your designated destination to deliver your luxury flacon.',
    stageNum: 4,
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
  const subject = `Delivered: Chembros Order #${params.orderNumber}`
  const html = buildOrderHtml({
    titleBadge: '5. SAFELY DELIVERED',
    headline: `Your Chembros Parcel Has Arrived, ${params.customerName}`,
    messageText:
      'Your handcrafted molecular flacons have arrived safely at your destination. Allow the formulation to rest at room temperature before experiencing its evolving olfactory architecture.',
    stageNum: 5,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    totalAmount: params.totalAmount,
    itemsSummary: params.itemsSummary,
    shippingAddress: params.shippingAddress,
  })
  return await sendEmail({ to: params.toEmail, subject, html })
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
  if (statusLower.includes('shipped') || statusLower.includes('dispatch')) {
    return await sendOrderShippedEmail({
      toEmail: params.toEmail,
      customerName: params.customerName,
      orderNumber: params.orderNumber,
      totalAmount: params.totalAmount,
      itemsSummary: params.itemsSummary,
      trackingNumber: params.trackingNumber || 'CB-EXP-9921',
      shippingAddress: params.shippingAddress,
    })
  } else if (statusLower.includes('today') || statusLower.includes('out')) {
    return await sendDeliveryTodayEmail({
      toEmail: params.toEmail,
      customerName: params.customerName,
      orderNumber: params.orderNumber,
      totalAmount: params.totalAmount,
      itemsSummary: params.itemsSummary,
      trackingNumber: params.trackingNumber,
      shippingAddress: params.shippingAddress,
    })
  } else if (statusLower.includes('deliver')) {
    return await sendOrderDeliveredEmail({
      toEmail: params.toEmail,
      customerName: params.customerName,
      orderNumber: params.orderNumber,
      totalAmount: params.totalAmount,
      itemsSummary: params.itemsSummary,
      shippingAddress: params.shippingAddress,
    })
  } else if (statusLower.includes('paid')) {
    return await sendPaymentDoneEmail({
      toEmail: params.toEmail,
      customerName: params.customerName,
      orderNumber: params.orderNumber,
      totalAmount: params.totalAmount,
      itemsSummary: params.itemsSummary,
      shippingAddress: params.shippingAddress,
    })
  }

  // Generic Order Status
  const subject = `Order #${params.orderNumber} Status Updated: ${params.newStatus}`
  const html = buildOrderHtml({
    titleBadge: params.newStatus.toUpperCase(),
    headline: `Status Update: ${params.newStatus}`,
    messageText: `Your Chembros fragrance order status has transitioned to: ${params.newStatus}.`,
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

