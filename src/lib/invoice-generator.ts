export interface InvoiceItem {
  name: string
  subtitle?: string
  hsn?: string
  price: number
  quantity: number
  volume_ml?: number
}

export interface InvoiceOrderData {
  id?: number | string
  order_number: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  items: InvoiceItem[]
  subtotal: number
  shipping_fee: number
  total_amount: number
  payment_status: string
  payment_method?: string
  cashfree_payment_id?: string
  cashfree_order_id?: string
  tracking_number?: string
}

export function generateInvoiceHtml(order: InvoiceOrderData, autoPrint = false): string {
  const items: InvoiceItem[] = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? JSON.parse(order.items)
    : []

  const subtotal =
    Number(order.subtotal) ||
    items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
  const shippingFee = Number(order.shipping_fee) || 0
  const total = Number(order.total_amount) || subtotal + shippingFee

  // 18% inclusive GST calculations
  const taxableValue = Math.round((subtotal / 1.18) * 100) / 100
  const totalGst = Math.round((subtotal - taxableValue) * 100) / 100
  const cgst = Math.round((totalGst / 2) * 100) / 100
  const sgst = Math.round((totalGst - cgst) * 100) / 100

  // Format order date
  const orderDate = new Date(order.created_at || Date.now())
  const formattedDate = orderDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedDateTime = `${formattedDate}, ${orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`

  // Invoice ID
  const invoiceId = `CB${order.id || order.order_number.replace(/\D/g, '').slice(-4) || '42'}`
  const isPaid = (order.payment_status || '').toUpperCase() === 'PAID'
  const isCancelled = (order.payment_status || '').toUpperCase() === 'CANCELLED'

  // Payment details
  const paymentRef = order.cashfree_payment_id || order.cashfree_order_id || order.order_number.replace(/\D/g, '') || '6898920465'
  let paymentMethod = order.payment_method || (isPaid ? 'Upi' : 'Pending')
  if (paymentMethod.toLowerCase().includes('upi')) paymentMethod = 'Upi'
  else if (paymentMethod.toLowerCase().includes('cashfree')) paymentMethod = 'Cashfree PG / Online'

  // Format customer address lines cleanly
  const rawAddress = (order.shipping_address || '').trim()
  let addressLinesHtml = ''
  if (!rawAddress) {
    addressLinesHtml = '<p>Delivery destination provided at order dispatch</p><p>India</p>'
  } else {
    const parts = rawAddress.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length <= 2) {
      addressLinesHtml = parts.map((p) => `<p>${p}</p>`).join('') + '<p>India</p>'
    } else {
      const mid = Math.ceil(parts.length / 2)
      const line1 = parts.slice(0, mid).join(', ')
      const line2 = parts.slice(mid).join(', ')
      addressLinesHtml = `<p>${line1}</p><p>${line2}</p><p>India</p>`
    }
  }

  // Items table rows
  const itemsHtml = items.length > 0
    ? items
        .map((item) => {
          const name = item.name || 'Extrait de Parfum'
          const subtitle =
            item.subtitle ||
            (item.name.toLowerCase().includes('discovery')
              ? 'The Molecule Series · 4 × 3ml Extrait'
              : `Extrait de Parfum · ${item.volume_ml || 50}ml`)
          const hsn = item.hsn || '33030050'
          const price = Number(item.price) || 0
          const qty = Number(item.quantity) || 1
          const amount = price * qty

          return `      <tr>
        <td class="item">${name}</td>
        <td>${hsn}</td>
        <td>₹${price.toLocaleString('en-IN')}</td>
        <td>${qty}</td>
        <td>₹${amount.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="sub"><td colspan="5">${subtitle}</td></tr>`
        })
        .join('\n')
    : `      <tr>
        <td class="item">Extrait de Parfum Formulation</td>
        <td>33030050</td>
        <td>₹${subtotal.toLocaleString('en-IN')}</td>
        <td>1</td>
        <td>₹${subtotal.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="sub"><td colspan="5">Bespoke Molecular Extrait Formulation</td></tr>`

  const statusBadge = isPaid
    ? '<span class="paid">Paid</span>'
    : isCancelled
    ? '<span class="paid" style="border-color: #ef4444; color: #b91c1c;">Cancelled</span>'
    : `<span class="paid" style="border-color: #f59e0b; color: #b45309;">${order.payment_status || 'Pending'}</span>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tax Invoice ${invoiceId} – Chem Bros</title>
<style>
  :root {
    --ink: #111;
    --muted: #7a6c5d;
    --line: #e6e0d4;
    --rule: #1a1a1a;
    --green: #1f7a4d;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #f3f1ec;
    color: var(--ink);
    font-family: "DejaVu Sans", Verdana, system-ui, sans-serif;
    font-size: 11px;
    line-height: 1.6;
  }
  .toolbar {
    width: 794px;
    max-width: 100%;
    margin: 20px auto 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #111;
    color: #fff;
    padding: 10px 18px;
    border-radius: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .toolbar-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .toolbar-actions {
    display: flex;
    gap: 8px;
  }
  .toolbar-btn {
    background: #ffffff;
    color: #111111;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .toolbar-btn:hover {
    background: #e5e5e5;
  }
  .toolbar-btn-ghost {
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.3);
  }
  .toolbar-btn-ghost:hover {
    background: rgba(255,255,255,0.1);
  }
  .page {
    width: 794px;
    max-width: 100%;
    margin: 16px auto 32px;
    background: #fff;
    padding: 40px 40px 36px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 14px;
    border-bottom: 2px solid var(--rule);
  }
  .brand { font-size: 17px; letter-spacing: 0.18em; font-weight: 400; margin: 0 0 14px; }
  .seller div { margin-bottom: 4px; }
  .seller .addr { color: var(--muted); }
  .seller .gstin { margin-top: 6px; }
  .doc { text-align: right; }
  .doc h1 { font-size: 26px; font-weight: 400; letter-spacing: 0.08em; margin: 0 0 12px; }
  .doc .meta { color: var(--muted); margin-bottom: 4px; }
  .paid {
    display: inline-block;
    margin-top: 6px;
    padding: 3px 12px;
    border: 1px solid var(--green);
    border-radius: 12px;
    color: var(--green);
    font-size: 10px;
  }
  .parties { display: flex; justify-content: space-between; margin: 28px 0 24px; }
  .box {
    width: 49%;
    border: 1px solid var(--line);
    padding: 16px 16px 14px;
  }
  .box.right { margin-top: -0px; }
  .label {
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }
  .box .name { font-weight: 700; font-size: 12px; margin-bottom: 8px; }
  .box p { margin: 0 0 6px; }
  .box.left p { margin-bottom: 8px; }
  hr.thin { border: 0; border-top: 1px solid var(--line); margin: 0; }
  table { width: 100%; border-collapse: collapse; }
  .items th {
    text-align: right;
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 14px 0 6px;
    border-bottom: 1px solid var(--rule);
  }
  .items th:first-child, .items td:first-child { text-align: left; }
  .items td { text-align: right; padding: 12px 0 4px; vertical-align: top; }
  .items td.item { font-weight: 700; font-size: 12px; }
  .items tr.sub td { padding: 0 0 12px; color: var(--muted); font-size: 10px; border-bottom: 1px solid var(--line); text-align: left; }
  .items col.hsn { width: 90px; } .items col.unit { width: 70px; }
  .items col.qty { width: 50px; } .items col.amt { width: 90px; }
  .totals { width: 205px; margin: 22px 0 0 auto; }
  .totals .row { display: flex; justify-content: space-between; padding: 5px 0; color: var(--muted); }
  .totals .row span:last-child { color: var(--ink); }
  .totals .total {
    border-top: 2px solid var(--rule);
    margin-top: 8px;
    padding-top: 10px;
    color: var(--ink);
    font-weight: 700;
    font-size: 13px;
    line-height: 1.4;
  }
  .totals .total span:last-child { font-size: 14px; }
  .note { color: var(--muted); font-size: 10px; margin: 18px 0 14px; }
  .payment { border: 1px solid var(--line); padding: 14px 16px; margin-top: 14px; }
  .payment strong { display: block; font-size: 10.5px; margin-bottom: 8px; }
  .payment div { margin-bottom: 7px; }
  footer { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; }
  footer div { margin-bottom: 8px; }
  @media print {
    body { background: #fff; padding: 0; }
    .page { margin: 0; padding: 24px; width: 100%; box-shadow: none; }
    .toolbar { display: none !important; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <div class="toolbar-title">CHEM BROS TAX INVOICE // ${order.order_number}</div>
  <div class="toolbar-actions">
    <button type="button" class="toolbar-btn" onclick="window.print()">Print Invoice</button>
    <a href="?format=pdf" class="toolbar-btn toolbar-btn-ghost">Download PDF</a>
    <a href="/dashboard?tab=orders" class="toolbar-btn toolbar-btn-ghost">Back to Orders</a>
  </div>
</div>

<div class="page">

  <header>
    <div class="seller">
      <h2 class="brand">CHEM BROS</h2>
      <div>Chemical Brothers Perfumery LLP</div>
      <div class="addr">12th Floor, b12H, AVM ASTA</div>
      <div class="addr">Arcot Road, Vadapalani, AV Meiyappan Salai</div>
      <div class="addr">Chennai, Tamil Nadu 600026</div>
      <div class="gstin"><strong>GSTIN</strong> 33AAWFC8794P1Z7</div>
    </div>
    <div class="doc">
      <h1>TAX INVOICE</h1>
      <div class="meta">${invoiceId}</div>
      <div class="meta">Order ${order.order_number}</div>
      <div class="meta">${formattedDate}</div>
      ${statusBadge}
    </div>
  </header>

  <section class="parties">
    <div class="box left">
      <div class="label">Billed to</div>
      <div class="name">${order.customer_name || 'Valued Client'}</div>
      <p>${order.customer_email || 'client@chembros.com'}</p>
      <p>${order.customer_phone || ''}</p>
    </div>
    <div class="box right">
      <div class="label">Delivery address</div>
      ${addressLinesHtml}
    </div>
  </section>

  <hr class="thin">

  <table class="items">
    <colgroup><col><col class="hsn"><col class="unit"><col class="qty"><col class="amt"></colgroup>
    <thead>
      <tr><th>Item</th><th>HSN</th><th>Unit</th><th>Qty</th><th>Amount</th></tr>
    </thead>
    <tbody>
${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Taxable value</span><span>₹${taxableValue.toLocaleString('en-IN')}</span></div>
    <div class="row"><span>Shipping</span><span>₹${shippingFee.toLocaleString('en-IN')}</span></div>
    <div class="row"><span>CGST @ 9%</span><span>₹${cgst.toLocaleString('en-IN')}</span></div>
    <div class="row"><span>SGST @ 9%</span><span>₹${sgst.toLocaleString('en-IN')}</span></div>
    <div class="row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
  </div>

  <div class="note">GST is included in the prices shown.</div>
  <hr class="thin">

  <div class="payment">
    <strong>Payment</strong>
    <div>Method: ${paymentMethod}</div>
    <div>Received: ${formattedDateTime}</div>
    <div>Reference: ${paymentRef}</div>
  </div>

  <footer>
    <div>Chem Bros · connect@thechemicalbrothers.in · 6374470866 / 6374203953</div>
    <div>Each bottle is hand-poured to order. Thank you for your custom.</div>
  </footer>

</div>

${
  autoPrint
    ? `<script>
        window.addEventListener('load', function() {
          setTimeout(function() { window.print(); }, 400);
        });
      </script>`
    : ''
}

</body>
</html>`
}



import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateInvoicePdfBuffer(order: InvoiceOrderData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier)

  const black = rgb(0.07, 0.09, 0.15)
  const gray = rgb(0.42, 0.45, 0.50)
  const lightGray = rgb(0.89, 0.91, 0.92)
  const greenText = rgb(0.02, 0.47, 0.34)
  const greenBg = rgb(0.92, 0.99, 0.96)
  const greenBorder = rgb(0.06, 0.73, 0.51)

  let y = height - 50
  const leftX = 50
  const rightX = width - 50

  // Header Left - Seller Details
  page.drawText('CHEM BROS', { x: leftX, y, size: 18, font: fontBold, color: black })
  y -= 18
  page.drawText('Chemical Brothers Perfumery LLP', { x: leftX, y, size: 9, font: fontRegular, color: gray })
  y -= 13
  page.drawText('12th Floor, b12H, AVM ASTA', { x: leftX, y, size: 9, font: fontRegular, color: gray })
  y -= 13
  page.drawText('Arcot Road, Vadapalani, AV Meiyappan Salai', { x: leftX, y, size: 9, font: fontRegular, color: gray })
  y -= 13
  page.drawText('Chennai, Tamil Nadu 600026', { x: leftX, y, size: 9, font: fontRegular, color: gray })
  y -= 14
  page.drawText('GSTIN 33AAWFC8794P1Z7', { x: leftX, y, size: 9, font: fontBold, color: black })

  // Header Right - Tax Invoice Title & Meta
  const titleText = 'TAX INVOICE'
  const titleWidth = fontBold.widthOfTextAtSize(titleText, 22)
  page.drawText(titleText, { x: rightX - titleWidth, y: height - 50, size: 22, font: fontBold, color: black })

  const invoiceId = `CB${order.id || 42}`
  const invIdWidth = fontRegular.widthOfTextAtSize(invoiceId, 9.5)
  page.drawText(invoiceId, { x: rightX - invIdWidth, y: height - 68, size: 9.5, font: fontRegular, color: gray })

  const orderNumStr = `Order ${order.order_number}`
  const orderNumWidth = fontRegular.widthOfTextAtSize(orderNumStr, 9.5)
  page.drawText(orderNumStr, { x: rightX - orderNumWidth, y: height - 81, size: 9.5, font: fontRegular, color: gray })

  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateWidth = fontRegular.widthOfTextAtSize(dateStr, 9.5)
  page.drawText(dateStr, { x: rightX - dateWidth, y: height - 94, size: 9.5, font: fontRegular, color: gray })

  // Status Badge
  const statusStr = (order.payment_status || 'PAID').toUpperCase() === 'PAID' ? 'Paid' : (order.payment_status || 'Pending')
  const badgeTextWidth = fontBold.widthOfTextAtSize(statusStr, 9)
  const badgeWidth = badgeTextWidth + 18
  const badgeHeight = 16
  const badgeX = rightX - badgeWidth
  const badgeY = height - 118

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: badgeHeight,
    color: greenBg,
    borderColor: greenBorder,
    borderWidth: 1,
  })
  page.drawText(statusStr, {
    x: badgeX + 9,
    y: badgeY + 4,
    size: 9,
    font: fontBold,
    color: greenText,
  })

  // Header Divider
  y -= 14
  page.drawLine({
    start: { x: leftX, y },
    end: { x: rightX, y },
    thickness: 1.5,
    color: black,
  })

  // Billed To & Delivery Address Box
  y -= 80
  const boxY = y
  const boxHeight = 75
  const boxWidth = rightX - leftX

  page.drawRectangle({
    x: leftX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: lightGray,
    borderWidth: 1,
  })

  page.drawLine({
    start: { x: leftX + boxWidth / 2, y: boxY },
    end: { x: leftX + boxWidth / 2, y: boxY + boxHeight },
    thickness: 1,
    color: lightGray,
  })

  // Left Column: Billed To
  let colLeftY = boxY + boxHeight - 16
  page.drawText('BILLED TO', { x: leftX + 16, y: colLeftY, size: 8.5, font: fontBold, color: gray })
  colLeftY -= 15
  page.drawText(order.customer_name || 'Valued Client', { x: leftX + 16, y: colLeftY, size: 11, font: fontBold, color: black })
  colLeftY -= 13
  page.drawText(order.customer_email || '', { x: leftX + 16, y: colLeftY, size: 9, font: fontRegular, color: gray })
  colLeftY -= 13
  page.drawText(order.customer_phone || '', { x: leftX + 16, y: colLeftY, size: 9, font: fontRegular, color: gray })

  // Right Column: Delivery Address
  const colRightX = leftX + boxWidth / 2 + 16
  let colRightY = boxY + boxHeight - 16
  page.drawText('DELIVERY ADDRESS', { x: colRightX, y: colRightY, size: 8.5, font: fontBold, color: gray })
  colRightY -= 15
  const addr = (order.shipping_address || 'Customer Delivery Address').split(',').map((s) => s.trim())
  const addrLine1 = addr.slice(0, 3).join(', ')
  const addrLine2 = addr.slice(3).join(', ') || 'India'
  page.drawText(addrLine1.slice(0, 42), { x: colRightX, y: colRightY, size: 9, font: fontRegular, color: black })
  colRightY -= 13
  page.drawText(addrLine2.slice(0, 42), { x: colRightX, y: colRightY, size: 9, font: fontRegular, color: black })
  colRightY -= 13
  page.drawText('India', { x: colRightX, y: colRightY, size: 9, font: fontRegular, color: gray })

  // Items Table
  y = boxY - 25
  page.drawLine({ start: { x: leftX, y }, end: { x: rightX, y }, thickness: 1, color: black })

  y -= 14
  page.drawText('ITEM', { x: leftX, y, size: 9, font: fontBold, color: black })
  page.drawText('HSN', { x: leftX + 240, y, size: 9, font: fontBold, color: black })
  page.drawText('UNIT', { x: leftX + 320, y, size: 9, font: fontBold, color: black })
  page.drawText('QTY', { x: leftX + 390, y, size: 9, font: fontBold, color: black })
  page.drawText('AMOUNT', { x: rightX - 50, y, size: 9, font: fontBold, color: black })

  y -= 8
  page.drawLine({ start: { x: leftX, y }, end: { x: rightX, y }, thickness: 1, color: black })

  const rawItems = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? JSON.parse(order.items)
    : []

  let subtotal = 0

  for (const item of rawItems) {
    y -= 22
    const itemName = item.name || 'Extrait de Parfum'
    const itemSub = item.name?.toLowerCase().includes('discovery')
      ? 'The Molecule Series · 4 × 3ml Extrait'
      : `Extrait de Parfum · ${item.volume_ml || 30}ml`
    const hsn = item.hsn || '33030050'
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 1
    const lineTotal = price * qty
    subtotal += lineTotal

    page.drawText(itemName, { x: leftX, y, size: 11, font: fontBold, color: black })
    page.drawText(hsn, { x: leftX + 235, y, size: 9, font: fontMono, color: gray })
    page.drawText(`Rs. ${price.toLocaleString('en-IN')}`, { x: leftX + 310, y, size: 9.5, font: fontRegular, color: black })
    page.drawText(String(qty), { x: leftX + 395, y, size: 9.5, font: fontRegular, color: black })

    const amtStr = `Rs. ${lineTotal.toLocaleString('en-IN')}`
    const amtW = fontBold.widthOfTextAtSize(amtStr, 10)
    page.drawText(amtStr, { x: rightX - amtW, y, size: 10, font: fontBold, color: black })

    y -= 12
    page.drawText(itemSub, { x: leftX, y, size: 8.5, font: fontRegular, color: gray })

    y -= 8
    page.drawLine({ start: { x: leftX, y }, end: { x: rightX, y }, thickness: 0.5, color: lightGray })
  }

  // Summary Calculations
  const shippingFee = Number(order.shipping_fee) || 0
  const taxableValue = Math.round((subtotal / 1.18) * 100) / 100
  const totalGst = Math.round((subtotal - taxableValue) * 100) / 100
  const cgst = Math.round((totalGst / 2) * 100) / 100
  const sgst = Math.round((totalGst - cgst) * 100) / 100
  const total = subtotal + shippingFee

  const sumX = rightX - 190
  y -= 22

  function drawSumRow(label: string, valStr: string) {
    page.drawText(label, { x: sumX, y, size: 9.5, font: fontRegular, color: gray })
    const valW = fontRegular.widthOfTextAtSize(valStr, 9.5)
    page.drawText(valStr, { x: rightX - valW, y, size: 9.5, font: fontRegular, color: black })
    y -= 15
  }

  drawSumRow('Taxable value', `Rs. ${taxableValue.toLocaleString('en-IN')}`)
  drawSumRow('Shipping', shippingFee === 0 ? 'Rs. 0' : `Rs. ${shippingFee.toLocaleString('en-IN')}`)
  drawSumRow('CGST @ 9%', `Rs. ${cgst.toLocaleString('en-IN')}`)
  drawSumRow('SGST @ 9%', `Rs. ${sgst.toLocaleString('en-IN')}`)

  // Divider line above Total: clean 10pt gap below SGST row
  const lineY = y + 4
  page.drawLine({ start: { x: sumX, y: lineY }, end: { x: rightX, y: lineY }, thickness: 1.5, color: black })

  // Total row: placed 20pt below the line so the line never intersects the text
  y = lineY - 20
  page.drawText('Total', { x: sumX, y, size: 12, font: fontBold, color: black })
  const totalValStr = `Rs. ${total.toLocaleString('en-IN')}`
  const totalValW = fontBold.widthOfTextAtSize(totalValStr, 13)
  page.drawText(totalValStr, { x: rightX - totalValW, y, size: 13, font: fontBold, color: black })

  y -= 18
  page.drawText('GST is included in the prices shown.', { x: rightX - 175, y, size: 8.5, font: fontRegular, color: gray })

  // Payment Box
  y -= 35
  const payBoxHeight = 58
  page.drawRectangle({
    x: leftX,
    y: y,
    width: boxWidth,
    height: payBoxHeight,
    borderColor: lightGray,
    borderWidth: 1,
  })

  let pY = y + payBoxHeight - 16
  page.drawText('Payment', { x: leftX + 16, y: pY, size: 10.5, font: fontBold, color: black })
  pY -= 13
  page.drawText(`Method: ${order.payment_method || 'UPI / Cashfree PG'}`, { x: leftX + 16, y: pY, size: 9, font: fontRegular, color: gray })
  pY -= 12
  page.drawText(`Received: ${dateStr}`, { x: leftX + 16, y: pY, size: 9, font: fontRegular, color: gray })
  page.drawText(`Reference: ${order.cashfree_payment_id || order.order_number}`, { x: leftX + 240, y: pY, size: 9, font: fontMono, color: gray })

  // Footer
  y -= 35
  page.drawLine({ start: { x: leftX, y }, end: { x: rightX, y }, thickness: 0.5, color: lightGray })
  y -= 16

  const foot1 = 'Chem Bros · connect@thechemicalbrothers.in · 6374470866 / 6374203953'
  const foot1W = fontRegular.widthOfTextAtSize(foot1, 8.5)
  page.drawText(foot1, { x: (width - foot1W) / 2, y, size: 8.5, font: fontRegular, color: gray })

  y -= 12
  const foot2 = 'Each bottle is hand-poured to order. Thank you for your custom.'
  const foot2W = fontRegular.widthOfTextAtSize(foot2, 8.5)
  page.drawText(foot2, { x: (width - foot2W) / 2, y, size: 8.5, font: fontRegular, color: rgb(0.6, 0.6, 0.6) })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
