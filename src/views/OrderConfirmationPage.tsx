'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import type { Order } from '../types'
import { getOrderByNumberApi } from '../services/api'
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Loader2,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react'

// Cleans corrupted characters (like ±) and normalizes hyphens/digits
function cleanText(text?: string): string {
  if (!text) return ''
  return text
    .replace(/[±]/g, '-')
    .replace(/\u00B1/g, '-')
    .replace(/Â±/g, '-')
    .replace(/\s*-\s*([0-9]{6})/g, ' - $1')
}

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams()
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>()
  const orderNumber =
    paramOrderNumber ||
    searchParams.get('order_id') ||
    searchParams.get('orderNumber') ||
    searchParams.get('order_number')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedTrack, setCopiedTrack] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setLoading(false)
        return
      }
      try {
        const data = await getOrderByNumberApi(orderNumber)
        setOrder(data)
      } catch (err) {
        console.error('Failed to load order receipt:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [orderNumber])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs uppercase tracking-widest font-mono">
          Loading Order Confirmation...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white text-black flex flex-col items-center select-none font-sans">
      {/* Top Floating Navigation */}
      <NavBar />

      <main className="w-full max-w-[1583px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-28 pb-16 flex-1 flex flex-col items-center">
        
        {/* Success Announcement Header */}
        <div className="text-center space-y-3 mb-6 max-w-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 block mb-1">
              PAYMENT VERIFIED
            </span>
            <h1 className="text-2xl sm:text-4xl font-normal font-['Montserrat',sans-serif] uppercase tracking-wide text-black">
              Order Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-sans leading-relaxed">
              Thank you for your purchase. We have sent your order confirmation receipt to{' '}
              <strong className="text-black font-semibold font-mono">
                {cleanText(order?.customer_email) || 'your email'}
              </strong>.
            </p>
          </div>
        </div>

        {/* Final Sale / No Cancellation Notice */}
        <div className="w-full max-w-xl mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-center space-y-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-800 font-bold block">
            Non-Cancellable & Non-Refundable
          </span>
          <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
            Your order is locked for packaging and dispatch immediately. As per our luxury fragrance hygiene policy, all sales are final with no cancellation or refund option.
          </p>
        </div>

        {order ? (
          <div className="w-full bg-[#FAF9F6] border border-black/5 rounded-[32px] sm:rounded-[40px] p-6 sm:p-9 lg:p-12 space-y-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            
            {/* Order Number and Status Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  Order Number
                </span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-black mt-0.5">
                  #{cleanText(order.order_number)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-100 text-emerald-800 font-semibold">
                  Payment: {cleanText(order.payment_status)}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-black text-white">
                  Status: {cleanText(order.order_status)}
                </span>
              </div>
            </div>

            {/* 4-Stage Live Delivery Tracker */}
            <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-black">
                  Delivery Timeline
                </h3>
                <span className="text-[11px] font-mono text-neutral-400 uppercase">
                  Estimated 3 to 5 Days
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  {
                    title: 'Order Placed',
                    icon: CheckCircle2,
                    active: true,
                  },
                  {
                    title: 'Processing',
                    icon: CreditCard,
                    active: order.payment_status === 'PAID',
                  },
                  {
                    title: 'Shipped',
                    icon: Truck,
                    active: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.order_status),
                  },
                  {
                    title: 'Delivered',
                    icon: Package,
                    active: order.order_status === 'Delivered',
                  },
                ].map((st, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                        st.active ? 'bg-black text-white shadow-xs' : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      <st.icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider ${
                        st.active ? 'text-black font-semibold' : 'text-neutral-400'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Waybill / Courier Tracking details */}
              {(order.tracking_number || (order as any).tracking_id) && (
                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                        Courier Tracking Number
                      </div>
                      <div className="text-sm font-mono font-bold text-black tracking-wider">
                        {cleanText(order.tracking_number || (order as any).tracking_id)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(cleanText(order.tracking_number || (order as any).tracking_id || ''))
                      setCopiedTrack(true)
                      setTimeout(() => setCopiedTrack(false), 2000)
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTrack ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Items Ordered List */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-semibold text-black uppercase tracking-wider">
                Items in This Order
              </h3>
              <div className="divide-y divide-neutral-100 bg-white rounded-3xl border border-black/5 px-6 py-2 shadow-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-['Montserrat',sans-serif] text-sm uppercase text-black tracking-wide">
                        {cleanText(item.name)}
                      </p>
                      <p className="text-neutral-500 font-mono text-[11px] mt-0.5">
                        Quantity: {item.quantity} · {item.volume_ml ? `${item.volume_ml}ml` : 'Extrait'}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-black text-sm">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address and Total Payment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-black/5 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                  Delivery Address
                </span>
                <p className="text-black font-semibold text-sm font-sans">
                  {cleanText(order.customer_name)}
                </p>
                <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed font-sans">
                  {cleanText(order.shipping_address)}
                </p>
                {order.customer_phone && (
                  <p className="text-neutral-500 font-mono pt-1">
                    Phone: {cleanText(order.customer_phone)}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 bg-white p-6 rounded-3xl border border-black/5 shadow-xs">
                <div className="flex justify-between text-neutral-600 font-sans">
                  <span>Subtotal</span>
                  <span className="font-mono text-black font-medium">
                    ₹{order.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 font-sans">
                  <span>Shipping</span>
                  <span className="font-mono text-emerald-700 font-medium">
                    {order.shipping_fee === 0 ? 'Complimentary' : `₹${order.shipping_fee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-black text-base pt-3 border-t border-neutral-100 font-sans">
                  <span>Total Paid</span>
                  <span className="font-mono text-lg">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 bg-[#FAF9F6] border border-black/5 rounded-3xl p-8 max-w-md w-full font-sans">
            <p className="text-xs font-mono text-neutral-500 uppercase">
              No matching order record was found.
            </p>
            <Link
              to="/fragrances"
              className="inline-block mt-4 px-6 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all"
            >
              Return to Store
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <Link
            to="/dashboard"
            className="w-full sm:flex-1 py-4 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white rounded-2xl text-xs font-medium uppercase tracking-[0.2em] text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer font-sans"
          >
            <span>View in My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/fragrances"
            className="w-full sm:flex-1 py-4 px-6 bg-white border border-neutral-300 hover:border-black active:scale-[0.99] text-black rounded-2xl text-xs font-medium uppercase tracking-[0.2em] text-center transition-all cursor-pointer shadow-xs font-sans"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}