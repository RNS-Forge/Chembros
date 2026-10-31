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
  Minus,
  Trash2,
  Sparkles,
  Phone,
  User as UserIcon,
  Mail,
  Home,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Truck,
  Check
} from 'lucide-react'

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
  const { items, subtotal, shippingFee, total, clearCart, updateQuantity, removeFromCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const hasSavedAddress = Boolean(user?.shipping_address && user.shipping_address.trim().length > 0)
  const [useNewAddress, setUseNewAddress] = useState(!hasSavedAddress)
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  // Customer Contact
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerEmail, setCustomerEmail] = useState(user?.email || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')

  // Granular Delivery Address
  const [flatBuilding, setFlatBuilding] = useState('')
  const [streetArea, setStreetArea] = useState('')
  const [landmark, setLandmark] = useState('')
  const [city, setCity] = useState(user?.city || '')
  const [stateName, setStateName] = useState(user?.state || '')
  const [pinCode, setPinCode] = useState(user?.pincode || '')

  // PIN code autofill lookup states
  const [isPinLoading, setIsPinLoading] = useState(false)
  const [pinSuccess, setPinSuccess] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate user data if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name)
      if (user.email) setCustomerEmail(user.email)
      if (user.phone) setCustomerPhone(user.phone)
      if (user.shipping_address) {
        setFlatBuilding(user.shipping_address)
        setCity(user.city || '')
        setStateName(user.state || 'Tamil Nadu')
        setPinCode(user.pincode || '')
        setUseNewAddress(false)
      }
    }
  }, [user])

  // Instant Postal PIN Code Lookup (India Post API)
  const handlePinCodeChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setPinCode(cleaned)
    setPinError(null)

    if (cleaned.length === 6) {
      setIsPinLoading(true)
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`)
        const data = await res.json()

        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0]
          setCity(po.District || po.Division || '')
          setStateName(po.State || '')
          setPinSuccess(true)
          setPinError(null)
        } else {
          setPinError('Invalid PIN code. Please verify.')
          setPinSuccess(false)
        }
      } catch (err) {
        console.warn('PIN API lookup failed, falling back to manual entry:', err)
      } finally {
        setIsPinLoading(false)
      }
    } else {
      setPinSuccess(false)
    }
  }

  const [simulationModal, setSimulationModal] = useState<{
    orderNumber: string
    cfOrderId: string
    sessionId: string
    amount: number
  } | null>(null)

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#FAFAF9] flex flex-col items-center">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-28 sm:pt-36">
          <div className="w-16 h-16 rounded-full bg-neutral-200/60 flex items-center justify-center text-black mb-4">
            <Lock className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="font-['Conquera',sans-serif] text-xl sm:text-2xl font-normal tracking-wider uppercase text-black">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-neutral-500 mt-2 mb-6 max-w-xs font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
            Select from our molecular extrait formulations before proceeding to checkout.
          </p>
          <Link
            to="/fragrances"
            className="px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs uppercase tracking-widest font-medium transition-all active:scale-95 shadow-md"
          >
            Explore Fragrances
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalName = !useNewAddress && user?.name ? user.name : customerName.trim()
    const finalEmail = user?.email || customerEmail.trim()
    const finalPhone = !useNewAddress && user?.phone ? user.phone : customerPhone.trim()
    
    // Construct verified address string
    let finalAddress = ''
    if (!useNewAddress && user?.shipping_address) {
      finalAddress = user.shipping_address
    } else {
      const parts = [flatBuilding.trim(), streetArea.trim(), landmark.trim() ? `Near ${landmark.trim()}` : '']
      finalAddress = parts.filter(Boolean).join(', ')
    }

    const finalCity = !useNewAddress && user?.city ? user.city : city.trim()
    const finalState = !useNewAddress && user?.state ? user.state : stateName.trim()
    const finalPin = !useNewAddress && user?.pincode ? user.pincode : pinCode.trim()

    if (!finalName || !finalEmail || !finalPhone || !finalAddress || !finalCity || !finalPin || finalPin.length !== 6) {
      setError('Please provide a complete address with a valid 6-digit PIN code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isAuthenticated && useNewAddress && saveAsDefault) {
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

          const verifyRes = await verifyOrderPaymentApi(orderRes.order_number, orderRes.cashfree_order_id)
          clearCart()
          navigate(`/order-confirmation?order_number=${verifyRes.order_number}&status=${verifyRes.status}`)
          return
        } catch (cfErr) {
          console.warn('Cashfree modal closed:', cfErr)
        }
      }

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
    <div className="w-full min-h-screen bg-[#FAFAF9] flex flex-col items-center">
      <NavBar />

      <main className="w-full max-w-[1583px] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-28 pb-16 flex-1">
        {/* Navigation Breadcrumb Bar */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <Link
            to="/fragrances"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to collection</span>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
            <Lock className="w-3 h-3 text-neutral-600" />
            <span>256-Bit Encrypted Checkout</span>
          </div>
        </div>

        {/* Guest Auth Banner */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 sm:p-5 bg-white border border-black/5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="text-xs font-semibold text-black">Already have an account?</p>
                <p className="text-[11px] text-neutral-500">Sign in to load your saved delivery addresses in 1 click.</p>
              </div>
            </div>
            <Link
              to="/login?redirect=/checkout"
              className="px-5 py-2 bg-black text-white rounded-full text-xs uppercase tracking-wider font-medium text-center shrink-0 hover:bg-neutral-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Mobile Collapsible Order Summary */}
        <div className="lg:hidden mb-6 bg-white border border-black/5 rounded-2xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black">
              <span>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              {mobileSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <span className="text-sm font-bold text-black font-mono">₹{total.toLocaleString('en-IN')}</span>
          </button>

          {mobileSummaryOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-black/5 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs py-2 border-b border-neutral-100 last:border-none">
                  <span className="text-neutral-700 font-medium">
                    {product.name} <span className="text-neutral-400 font-mono">× {quantity}</span>
                  </span>
                  <span className="font-mono text-black font-semibold">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-2 text-xs text-neutral-500 space-y-1">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-medium">{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7:5 Ratio Grid: Left Shipping Form & Right Bag Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          
          {/* LEFT COLUMN: Shipping & Payment Form */}
          <div className="lg:col-span-7 bg-white border border-black/5 rounded-3xl p-5 sm:p-7 md:p-9 shadow-xs space-y-6">
            
            {/* Step 1: Contact Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                1. Delivery & Contact
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                Guaranteed Dispatch
              </span>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-6">
              
              {/* SAVED ADDRESS PROFILE OPTION */}
              {isAuthenticated && user?.shipping_address && !useNewAddress && (
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-black bg-neutral-50/70 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center mt-0.5">
                        <div className="w-2.5 h-2.5 bg-black rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black uppercase tracking-wider">{user.name || 'Recipient'}</span>
                          <span className="px-2 py-0.5 bg-black text-white text-[9px] uppercase font-mono tracking-widest rounded-full">
                            Saved Primary
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 mt-1.5 font-medium leading-relaxed">
                          {user.shipping_address}
                        </p>
                        {(user.city || user.state || user.pincode) && (
                          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                            {[user.city, user.state].filter(Boolean).join(', ')}{user.pincode ? ` - ${user.pincode}` : ''}
                          </p>
                        )}
                        {user.phone && (
                          <p className="text-xs text-neutral-500 mt-1 font-mono">
                            Phone: {user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Home className="w-4 h-4 text-neutral-400" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="mt-4 pt-3 border-t border-black/5 text-[11px] font-mono tracking-wider uppercase text-neutral-700 hover:text-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enter a different delivery address</span>
                  </button>
                </div>
              )}

              {/* GRANULAR ADDRESS FIELDS WITH AUTOFILL */}
              {(useNewAddress || !isAuthenticated || !user?.shipping_address) && (
                <div className="space-y-4">
                  {isAuthenticated && user?.shipping_address && (
                    <div className="flex items-center justify-between pb-2 border-b border-black/5">
                      <span className="text-xs font-semibold text-black uppercase tracking-wider">New Shipping Details</span>
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(false)}
                        className="text-[11px] font-mono text-neutral-500 hover:text-black underline cursor-pointer"
                      >
                        Use saved profile
                      </button>
                    </div>
                  )}

                  {/* Recipient Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Gowtham A"
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        Phone Number (For Delivery OTP) *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        Email Address (For Invoicing & Tracking) *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Postal PIN Code with Real-Time Validation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider">
                        Postal PIN Code (Auto-fills City & State) *
                      </label>
                      {pinSuccess && (
                        <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" /> Valid Indian PIN
                        </span>
                      )}
                      {pinError && (
                        <span className="text-[10px] text-rose-600 font-mono font-semibold">
                          {pinError}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => handlePinCodeChange(e.target.value)}
                        placeholder="e.g. 641031"
                        className="w-full pl-10 pr-10 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black font-mono focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                      {isPinLoading && (
                        <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400 animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* House / Flat & Street */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        Flat, House No., Building *
                      </label>
                      <input
                        type="text"
                        required
                        value={flatBuilding}
                        onChange={(e) => setFlatBuilding(e.target.value)}
                        placeholder="e.g. Penthouse 4B, Emerald Heights"
                        className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        Street, Sector, Area *
                      </label>
                      <input
                        type="text"
                        required
                        value={streetArea}
                        onChange={(e) => setStreetArea(e.target.value)}
                        placeholder="e.g. Narasimhanaickenpalayam"
                        className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  {/* Landmark, City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Near Metro Station"
                        className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Coimbatore"
                        className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Tamil Nadu"
                        className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  {isAuthenticated && (
                    <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black accent-black"
                      />
                      <span className="text-xs text-neutral-700">
                        Save this address as my primary default delivery destination
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Step 2: Payment Gateway Options */}
              <div className="pt-4 border-t border-black/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Conquera',sans-serif] text-sm font-normal tracking-wider uppercase text-black">
                    2. Payment Method
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">INSTANT DISPATCH</span>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black border border-black/5 shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-black uppercase tracking-wider">
                        Cashfree Payments Gateway
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        UPI (GPay / PhonePe / Paytm), Credit / Debit Cards, NetBanking
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              </div>

              {/* CTA Placement */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{total.toLocaleString('en-IN')} & Place Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-neutral-500" /> Free Dispatch Across India
                </span>
                <span>•</span>
                <span>3–5 Days Express Delivery</span>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Desktop & Tablet Bag Summary */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="font-['Conquera',sans-serif] text-base font-normal tracking-wider uppercase text-black">
                Bag Summary
              </h3>
              <span className="text-xs font-mono text-neutral-400">
                {items.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </div>

            {/* Scrollable Items List */}
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-13 h-15 bg-neutral-50 rounded-xl border border-black/5 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={product.image_base64 || (bottleImg as any)?.src || bottleImg}
                        alt={product.name}
                        className="h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-['Conquera',sans-serif] text-xs font-normal tracking-wide text-black uppercase truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">
                        {product.volume_ml ? `${product.volume_ml}ml` : 'Extrait'}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="inline-flex items-center border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                            aria-label={`Decrease quantity of ${product.name}`}
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-2 text-xs font-mono font-semibold text-black min-w-[20px] text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                            aria-label={`Increase quantity of ${product.name}`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-black font-mono block">
                      ₹{(product.price * quantity).toLocaleString('en-IN')}
                    </span>
                    {quantity > 1 && (
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        ₹{product.price.toLocaleString('en-IN')} ea
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-black/5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-black">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Dispatch</span>
                <span className="font-medium text-emerald-700">
                  {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-black/5">
                <span>Total Due</span>
                <span className="font-mono text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Courier Dispatch Assurance Badge */}
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-neutral-600 shrink-0 border border-black/5">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Insured express delivery with temperature-controlled transit packaging.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Cashfree Sandbox Simulator Modal */}
      {simulationModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full border border-neutral-200 shadow-2xl text-center space-y-4">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CreditCard className="w-5 h-5" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">SANDBOX GATEWAY</p>
              <h3 className="text-lg font-normal font-['Conquera',sans-serif] uppercase tracking-wide text-black mt-1">
                Authorize Payment
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                Order Ref: #{simulationModal.orderNumber}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Total:</span>
                <span className="font-bold font-mono text-black">₹{simulationModal.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Recipient:</span>
                <span className="text-neutral-700 truncate max-w-[170px] font-mono text-[11px]">{customerEmail}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSimulationModal(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSimulatedPaymentSuccess}
                className="flex-1 py-3 px-4 rounded-xl bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Authorize</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}