'use client'
import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import type { Order } from '../types'
import { getMyOrdersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Package, Truck, Loader2, User } from 'lucide-react'

export default function MyOrdersPage() {
  const { isAuthenticated, user, setIsAuthModalOpen } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      try {
        const data = await getMyOrdersApi()
        setOrders(data)
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [isAuthenticated])

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1200px] px-6 py-12 flex-1">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 font-['Inter',sans-serif]">
            CLIENT PORTAL
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-['Cinzel',serif] text-black mt-2">
            Acquisitions & Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-2 font-['Inter',sans-serif]">
            Review your historical bespoke fragrance orders, live courier progress, and receipts.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto">
              <User className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">
              Sign In to View Orders
            </h3>
            <p className="text-xs text-neutral-500">
              Access your orders securely with a one-time passcode sent directly to your email via Gmail SMTP.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Sign In with Email OTP
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
            <p className="text-xs tracking-widest uppercase">Retrieving Orders for {user?.email}...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <Package className="w-12 h-12 text-neutral-400 mx-auto stroke-1" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">
              No Acquisitions Found
            </h3>
            <p className="text-xs text-neutral-500">
              You have not placed any fragrance orders yet under <strong className="text-black">{user?.email}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => (
              <div key={o.id} className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                      Order #{o.order_number}
                    </span>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Placed on {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        o.payment_status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.payment_status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-black text-white">
                      {o.order_status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Formulations</h4>
                    <div className="divide-y divide-neutral-200 bg-white rounded-2xl border border-neutral-200 px-4 py-1">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-['Cinzel',serif] font-bold text-black">{item.name}</p>
                            <p className="text-neutral-500 text-[10px]">Qty: {item.quantity} â€¢ {item.volume_ml || 50}ml</p>
                          </div>
                          <span className="font-semibold text-black">
                            â‚¹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Dispatch Details</h4>
                    <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-xs space-y-2">
                      <p className="text-neutral-700 leading-relaxed">{o.shipping_address}</p>
                      <p className="text-neutral-500 text-[11px]">Contact: {o.customer_name} ({o.customer_phone})</p>
                      {o.tracking_number && (
                        <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 text-black font-mono">
                          <Truck className="w-4 h-4 text-neutral-600" />
                          <span>Tracking: {o.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs border-t border-neutral-200">
                  <span className="text-neutral-500">Cashfree PG Transaction</span>
                  <span className="text-sm font-bold text-black">Total Paid: â‚¹{o.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
