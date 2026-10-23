import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import type { Order } from '../types'
import { getOrderByNumberApi } from '../services/api'
import { CheckCircle2, Package, Truck, Clock, ArrowRight, Loader2 } from 'lucide-react'

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

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
        console.error('Failed to load confirmed order:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderNumber])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs uppercase tracking-widest">Generating Bespoke Order Receipt...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-3xl px-6 py-12 flex-1">
        {/* Success Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 font-['Inter',sans-serif]">
              ACQUISITION CONFIRMED
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-['Cinzel',serif] text-black mt-1">
              Your Flacon is Being Decanted
            </h1>
            <p className="text-xs text-neutral-600 mt-2 font-['Inter',sans-serif] max-w-md mx-auto leading-relaxed">
              An official order receipt and tracking updates have been dispatched to{' '}
              <strong className="text-black font-semibold">{order?.customer_email || 'your email'}</strong> via Gmail SMTP.
            </p>
          </div>
        </div>

        {order ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 space-y-8 shadow-sm">
            {/* Order Ref & Payment Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Order Identifier</span>
                <p className="text-lg font-bold font-mono text-black mt-0.5">#{order.order_number}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {order.payment_status} (Cashfree)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black text-white">
                  {order.order_status}
                </span>
              </div>
            </div>

            {/* Tracking Progress */}
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-6">
                Fulfillment Timeline
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { title: 'Placed', icon: CheckCircle2, active: true },
                  { title: 'Processing', icon: Clock, active: ['Processing', 'Shipped', 'Delivered'].includes(order.order_status) },
                  { title: 'Shipped', icon: Truck, active: ['Shipped', 'Delivered'].includes(order.order_status) },
                  { title: 'Delivered', icon: Package, active: order.order_status === 'Delivered' },
                ].map((st, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                        st.active ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      <st.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-medium ${st.active ? 'text-black' : 'text-neutral-400'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
                Selected Extraits
              </h3>
              <div className="divide-y divide-neutral-200 bg-white rounded-2xl border border-neutral-200 px-5 py-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-['Cinzel',serif] font-bold text-black text-sm">{item.name}</p>
                      <p className="text-neutral-500 text-[11px]">Quantity: {item.quantity} • {item.volume_ml || 50}ml</p>
                    </div>
                    <span className="font-semibold text-black">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Financial Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">White-Glove Destination</span>
                <p className="text-black font-medium mt-1 leading-relaxed">{order.shipping_address}</p>
                <p className="text-neutral-500 mt-1">Recipient: {order.customer_name} ({order.customer_phone})</p>
              </div>

              <div className="space-y-1.5 md:text-right">
                <div className="flex justify-between md:justify-end md:gap-8 text-neutral-600">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8 text-neutral-600">
                  <span>White-Glove Shipping:</span>
                  <span>{order.shipping_fee === 0 ? 'Complimentary' : `₹${order.shipping_fee}`}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8 font-bold text-black text-base pt-2 border-t border-neutral-200">
                  <span>Total Paid:</span>
                  <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500 text-xs">
            Order identifier is missing or invalid.
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/my-orders"
            className="px-8 py-3.5 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-widest text-center hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
          >
            Track in My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/fragrances"
            className="px-8 py-3.5 bg-neutral-100 text-black rounded-full text-xs font-semibold uppercase tracking-widest text-center hover:bg-neutral-200 transition-all"
          >
            Explore More Formulations
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
