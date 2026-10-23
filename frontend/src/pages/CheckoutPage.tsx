import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrderApi, verifyOrderPaymentApi } from '../services/api'
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// Define Cashfree JS SDK interface
declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: {
        paymentSessionId: string
        redirectTarget?: '_modal' | '_self' | '_blank'
      }) => Promise<{ error?: { message: string }; paymentDetails?: unknown }>
    }
  }
}

export default function CheckoutPage() {
  const { items, subtotal, shippingFee, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerEmail, setCustomerEmail] = useState(user?.email || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('Tamil Nadu')
  const [pinCode, setPinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Simulation modal state
  const [simulationModal, setSimulationModal] = useState<{
    orderNumber: string
    cfOrderId: string
    sessionId: string
    amount: number
  } | null>(null)

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center">
        <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
          <NavBar />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-['Cinzel',serif] text-2xl font-bold text-black">Your Bag is Empty</h2>
          <p className="text-xs text-neutral-500 mt-2 mb-6">Select from our collection of molecular extraits before proceeding.</p>
          <Link to="/fragrances" className="px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-widest">
            Explore Fragrances
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerEmail || !customerPhone || !address || !city || !pinCode) {
      setError('Please provide all mandatory shipping and contact information.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fullAddress = `${address}, ${city}, ${stateName} - ${pinCode}`
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: fullAddress,
        items: items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          volume_ml: i.product.volume_ml,
        })),
      }

      // Step 1: Initialize Cashfree Order with backend
      const cfOrder = await createOrderApi(orderPayload)

      // Step 2: Check if Cashfree JS SDK is available and session is a live token
      const isSimulated = cfOrder.payment_session_id.startsWith('session_sim_')

      if (window.Cashfree && !isSimulated) {
        // Live / Sandbox Cashfree Modal Drop-in
        const cashfree = window.Cashfree({
          mode: cfOrder.cf_environment === 'PRODUCTION' ? 'production' : 'sandbox',
        })
        const result = await cashfree.checkout({
          paymentSessionId: cfOrder.payment_session_id,
          redirectTarget: '_modal',
        })

        if (result.error) {
          setError(result.error.message || 'Payment processing was cancelled or interrupted.')
          setLoading(false)
          return
        }

        // Verify with backend
        await verifyOrderPaymentApi(cfOrder.order_number, cfOrder.cashfree_order_id)
        clearCart()
        navigate(`/order-confirmation?order_id=${cfOrder.order_number}`)
      } else {
        // Seamless Developer / Sandbox Test Simulator
        setSimulationModal({
          orderNumber: cfOrder.order_number,
          cfOrderId: cfOrder.cashfree_order_id,
          sessionId: cfOrder.payment_session_id,
          amount: cfOrder.total_amount,
        })
        setLoading(false)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment gateway.')
      setLoading(false)
    }
  }

  const handleSimulatedPaymentSuccess = async () => {
    if (!simulationModal) return
    setLoading(true)
    try {
      await verifyOrderPaymentApi(simulationModal.orderNumber, simulationModal.cfOrderId)
      clearCart()
      navigate(`/order-confirmation?order_id=${simulationModal.orderNumber}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setLoading(false)
      setSimulationModal(null)
    }
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1576px] px-6 py-8 flex-1">
        <div className="mb-8">
          <Link
            to="/fragrances"
            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-black transition-colors font-['Inter',sans-serif]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Form: Shipping Details */}
          <div className="lg:col-span-7 bg-neutral-50/60 border border-neutral-200/80 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-black" />
              Direct Atelier Dispatch
            </div>
            <h2 className="text-2xl font-bold font-['Cinzel',serif] text-black">
              Shipping & Recipient Details
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-['Inter',sans-serif]">
              Your order confirmation and tracking dispatches will be sent to your email.
            </p>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCheckout} className="mt-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Sanjay N"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Phone Number (for Courier Tracking) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Address (for SMTP Confirmation) *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="sanjay.n.ihub@snsgroups.com"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Street Address / Apartment *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Suite 402, Chembros Residency, Avinashi Road"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Coimbatore"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="641049"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Payment Gateway Box */}
              <div className="pt-6 border-t border-neutral-200">
                <div className="p-5 bg-white rounded-2xl border border-neutral-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                        Cashfree Payment Gateway
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        UPI (GPay/PhonePe), Credit/Debit Cards, NetBanking
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] tracking-widest font-bold uppercase px-2.5 py-1 rounded bg-neutral-100 text-neutral-800">
                    256-Bit SSL
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-6 bg-black text-white rounded-full text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to Cashfree PG...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Authorize Payment • ₹{total.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary: Items & Totals */}
          <div className="lg:col-span-5 bg-neutral-50/80 border border-neutral-200/80 rounded-3xl p-8 space-y-6">
            <h3 className="font-['Cinzel',serif] text-xl font-bold text-black">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            <div className="divide-y divide-neutral-200 max-h-96 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 bg-white rounded-xl border border-neutral-200 p-1 flex items-center justify-center shrink-0">
                      {product.image_base64 && (
                        <img src={product.image_base64} alt={product.name} className="h-full object-contain" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-['Cinzel',serif] text-xs font-bold text-black">{product.name}</h4>
                      <p className="text-[10px] text-neutral-500 uppercase">{product.concentration} x {quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-black">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>White-Glove Shipping</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-neutral-200">
                <span>Total Due</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 text-[11px] text-neutral-500 space-y-1">
              <p className="font-medium text-black">White-Glove Delivery Guarantee:</p>
              <p>Hand-poured into tamper-evident bespoke packaging with temperature protection.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Cashfree Sandbox Simulator Modal */}
      {simulationModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-neutral-300 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">CASHFREE PG TEST GATEWAY</p>
              <h3 className="text-xl font-bold font-['Cinzel',serif] text-black mt-1">
                Authorize Test Payment
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Order Ref: <strong className="text-black font-mono">#{simulationModal.orderNumber}</strong>
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Transaction Amount:</span>
                <span className="font-bold text-black">₹{simulationModal.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Gateway Session:</span>
                <span className="font-mono text-[10px] text-neutral-700 truncate max-w-[180px]">{simulationModal.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dispatch Notification:</span>
                <span className="text-neutral-700 truncate max-w-[180px]">{customerEmail}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSimulationModal(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSimulatedPaymentSuccess}
                className="flex-1 py-3 px-4 rounded-xl bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Simulate Success
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
