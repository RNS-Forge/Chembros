'use client'
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import bottleImg from '../assets/bottle.png'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrderApi, verifyOrderPaymentApi, updateProfileApi } from '../services/api'
import {
  
  Lock,
  CreditCard,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  
  Plus,
  Sparkles,
  Phone,
  User as UserIcon,
  Mail,
  Home
} from 'lucide-react'

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
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Address choice: 'saved' | 'new'
  const hasSavedAddress = Boolean(user && user.shipping_address && user.shipping_address.trim().length > 0)
  const [addressChoice, setAddressChoice] = useState<'saved' | 'new'>(hasSavedAddress ? 'saved' : 'new')

  // Customer Contact & Shipping Details
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerEmail, setCustomerEmail] = useState(user?.email || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState(user?.shipping_address || '')
  const [city, setCity] = useState(user?.city || '')
  const [stateName, setStateName] = useState(user?.state || 'Tamil Nadu')
  const [pinCode, setPinCode] = useState(user?.pincode || '')

  // Option to update user's profile with the new address
  const [saveAsDefault, setSaveAsDefault] = useState(false)

  // Loading & Feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync state if user loads after mount
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name)
      if (user.email) setCustomerEmail(user.email)
      if (user.phone) setCustomerPhone(user.phone)
      if (user.shipping_address) {
        setAddress(user.shipping_address)
        setCity(user.city || '')
        setStateName(user.state || 'Tamil Nadu')
        setPinCode(user.pincode || '')
        setAddressChoice('saved')
      }
    }
  }, [user])

  // Simulation modal state for Cashfree sandbox
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

    // Active delivery address resolution
    const finalName = addressChoice === 'saved' && user?.name ? user.name : customerName.trim()
    const finalEmail = user?.email || customerEmail.trim()
    const finalPhone = addressChoice === 'saved' && user?.phone ? user.phone : customerPhone.trim()
    const finalAddress = addressChoice === 'saved' && user?.shipping_address ? user.shipping_address : address.trim()
    const finalCity = addressChoice === 'saved' && user?.city ? user.city : (city.trim() || 'Coimbatore')
    const finalState = addressChoice === 'saved' && user?.state ? user.state : (stateName.trim() || 'Tamil Nadu')
    const finalPin = addressChoice === 'saved' && user?.pincode ? user.pincode : pinCode.trim()

    if (!finalName || !finalEmail || !finalPhone || !finalAddress || !finalCity || !finalPin) {
      setError('Please provide all mandatory shipping and contact details.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // If user opted to save the new address as default
      if (isAuthenticated && addressChoice === 'new' && saveAsDefault) {
        try {
          await updateProfileApi({
            name: finalName,
            phone: finalPhone,
            shipping_address: finalAddress,
            city: finalCity,
            state: finalState,
            pincode: finalPin,
          })
        } catch (profileErr) {
          console.warn('Could not update profile address default:', profileErr)
        }
      }

      const formattedShippingAddress = `${finalAddress}, ${finalCity}, ${finalState} - ${finalPin}`

      // Create order in backend
      const orderRes = await createOrderApi({
        customer_name: finalName,
        customer_email: finalEmail,
        customer_phone: finalPhone,
        shipping_address: formattedShippingAddress,
        items: items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          volume_ml: i.product.volume_ml,
        })),
      })

      // Try Cashfree JS SDK modal checkout
      let cashfreeLoaded = false
      if (typeof window.Cashfree === 'function') {
        try {
          const cashfree = window.Cashfree({
            mode: orderRes.cf_environment === 'PRODUCTION' ? 'production' : 'sandbox',
          })
          cashfreeLoaded = true
          await cashfree.checkout({
            paymentSessionId: orderRes.payment_session_id,
            redirectTarget: '_modal',
          })

          // Verify order payment on modal close
          const verifyRes = await verifyOrderPaymentApi(orderRes.order_number, orderRes.cashfree_order_id)
          clearCart()
          navigate(`/order-confirmation?order_number=${verifyRes.order_number}&status=${verifyRes.status}`)
          return
        } catch (cfErr) {
          console.warn('Cashfree SDK modal was dismissed or unmounted, launching seamless verification modal:', cfErr)
        }
      }

      // If Cashfree SDK not present or in sandbox testing environment:
      if (!cashfreeLoaded || orderRes.cf_environment === 'SANDBOX') {
        setSimulationModal({
          orderNumber: orderRes.order_number,
          cfOrderId: orderRes.cashfree_order_id,
          sessionId: orderRes.payment_session_id,
          amount: orderRes.total_amount,
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not initialize order with payment gateway.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Cashfree sandbox simulated success
  const handleSimulatedPaymentSuccess = async () => {
    if (!simulationModal) return
    setLoading(true)
    try {
      const verifyRes = await verifyOrderPaymentApi(simulationModal.orderNumber, simulationModal.cfOrderId)
      clearCart()
      navigate(`/order-confirmation?order_number=${verifyRes.order_number}&status=${verifyRes.status}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center font-['Inter',sans-serif]">
      {/* Sticky Luxury Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1400px] px-6 py-10 flex-1">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/fragrances"
            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-black" />
            <span>256-Bit Encrypted Order Terminal</span>
          </div>
        </div>

        {/* Not Logged In Callout */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-black shrink-0" />
              <div>
                <p className="text-xs font-semibold text-black">Have a Chembros account?</p>
                <p className="text-[11px] text-neutral-500">Sign in to automatically load your saved delivery details for 1-click checkout.</p>
              </div>
            </div>
            <Link
              to="/login?redirect=/checkout"
              className="px-4 py-2 bg-black text-white rounded-full text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors shrink-0"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Main Grid: Checkout Details + Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Form: Delivery Address & Payment */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="font-['Cinzel',serif] text-3xl font-bold text-black tracking-wide">
                Secure Checkout
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {isAuthenticated
                  ? 'Your saved delivery profile is ready. Confirm details to complete your order.'
                  : 'Enter your shipping details below for white-glove courier dispatch.'}
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-6">
              {/* SAVED VS NEW ADDRESS SELECTOR (When Logged In with Saved Address) */}
              {isAuthenticated && user?.shipping_address && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      Delivery Destination
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved Profile Active
                    </span>
                  </div>

                  {/* Option A: Saved Address Card */}
                  <div
                    onClick={() => setAddressChoice('saved')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      addressChoice === 'saved'
                        ? 'border-black bg-neutral-50 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          addressChoice === 'saved' ? 'border-black' : 'border-neutral-300'
                        }`}>
                          {addressChoice === 'saved' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-black">{user.name || 'Saved Contact'}</span>
                            <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 text-[9px] uppercase font-bold tracking-widest rounded">
                              Default Saved Address
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 mt-1 font-medium leading-relaxed">
                            {user.shipping_address}
                          </p>
                          {(user.city || user.state || user.pincode) && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {[user.city, user.state].filter(Boolean).join(', ')}{user.pincode ? ` â€” ${user.pincode}` : ''}
                            </p>
                          )}
                          {user.phone && (
                            <p className="text-xs text-neutral-500 mt-1 font-mono">
                              Phone: {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <Home className="w-5 h-5 text-neutral-400 shrink-0" />
                    </div>
                  </div>

                  {/* Option B: Add / Use New Address */}
                  <div
                    onClick={() => setAddressChoice('new')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      addressChoice === 'new'
                        ? 'border-black bg-neutral-50 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        addressChoice === 'new' ? 'border-black' : 'border-neutral-300'
                      }`}>
                        {addressChoice === 'new' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                      <span className="text-xs font-semibold text-black">
                        Deliver to a Different / New Address
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              )}

              {/* NEW / GUEST ADDRESS INPUT FIELDS */}
              {(!isAuthenticated || !user?.shipping_address || addressChoice === 'new') && (
                <div className="space-y-4 pt-2">
                  <div className="border-t border-neutral-200 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      {isAuthenticated ? 'Enter New Delivery Address' : 'Shipping & Recipient Details'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        Recipient Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Street Address & Locality *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Apartment, Studio, Floor, Street, Locality"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="400001"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {isAuthenticated && (
                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black"
                      />
                      <span className="text-xs text-neutral-700">
                        Save this address as my new primary delivery destination
                      </span>
                    </label>
                  )}
                </div>
              )}

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
                        UPI (GPay / PhonePe), Credit / Debit Cards, NetBanking
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] tracking-widest font-bold uppercase px-2.5 py-1 rounded bg-neutral-100 text-neutral-800">
                    256-Bit SSL
                  </span>
                </div>
              </div>

              {/* Final 1-Click Order Placement Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-6 bg-black text-white rounded-full text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {addressChoice === 'saved' && isAuthenticated
                      ? `Confirm & Pay â‚¹${total.toLocaleString('en-IN')}`
                      : `Authorize Payment â€¢ â‚¹${total.toLocaleString('en-IN')}`}
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
                      <img src={product.image_base64 || (bottleImg as any)?.src || bottleImg} alt={product.name} className="h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-['Cinzel',serif] text-xs font-bold text-black">{product.name}</h4>
                      <p className="text-[10px] text-neutral-500 uppercase">{product.concentration} x {quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-black">
                    â‚¹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>â‚¹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>White-Glove Shipping</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `â‚¹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-neutral-200">
                <span>Total Due</span>
                <span>â‚¹{total.toLocaleString('en-IN')}</span>
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
                <span className="font-bold text-black">â‚¹{simulationModal.amount.toLocaleString('en-IN')}</span>
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
