'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  User,
  Camera,
  Lock,
  HelpCircle,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Eye,
  EyeOff,
  Package,
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  XCircle,
  Truck,
  Copy,
  ExternalLink,
} from 'lucide-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getMyOrdersApi } from '../services/api'
import type { Order } from '../types'

export type DashboardTab = 'overview' | 'orders' | 'repurchase' | 'addresses' | 'security' | 'help'

// Extended Order interface to support tracking and flexible status typing
export interface OrderWithTracking extends Omit<Order, 'order_status'> {
  order_status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED' | string
  tracking_id?: string
  courier_partner?: string
  tracking_url?: string
}

interface DashboardPageProps {
  initialTab?: DashboardTab
}

export default function DashboardPage({ initialTab }: DashboardPageProps) {
  const location = useLocation()
  const { user, isAuthenticated, updateProfile, changePassword, logout, setIsAuthModalOpen } = useAuth()
  const { addToCart } = useCart()

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab || 'overview')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile Form States
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [flatBuilding, setFlatBuilding] = useState('')
  const [streetArea, setStreetArea] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('Tamil Nadu')
  const [pincode, setPincode] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // PIN Code API Auto-fill States
  const [isPinLoading, setIsPinLoading] = useState(false)
  const [pinSuccess, setPinSuccess] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  // Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Orders State
  const [orders, setOrders] = useState<OrderWithTracking[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | string | null>(null)
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null)

  // Feedback Alerts
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [addedItemName, setAddedItemName] = useState<string | null>(null)

  // Sync tab from URL query params (e.g. /dashboard?tab=orders or /dashboard?tab=repurchase)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as DashboardTab | null
    if (tabParam && ['overview', 'orders', 'repurchase', 'addresses', 'security', 'help'].includes(tabParam)) {
      setActiveTab(tabParam)
    } else if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [location.search, initialTab])

  // Sync initial user profile
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setCity(user.city || '')
      setStateName(user.state || 'Tamil Nadu')
      setPincode(user.pincode || '')
      setAvatarPreview(user.avatar_url || null)
      if (user.shipping_address) {
        setFlatBuilding(user.shipping_address)
      }
    }
  }, [user])

  // Fetch orders
  useEffect(() => {
    if (!isAuthenticated) {
      setOrdersLoading(false)
      return
    }
    async function loadOrders() {
      try {
        const data = await getMyOrdersApi()
        setOrders(data as OrderWithTracking[])
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setOrdersLoading(false)
      }
    }
    loadOrders()
  }, [isAuthenticated])

  // PIN Code Lookup
  const handlePinCodeChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setPincode(cleaned)
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
          setPinError('Invalid PIN code.')
          setPinSuccess(false)
        }
      } catch (err) {
        console.warn('Postal PIN lookup error:', err)
      } finally {
        setIsPinLoading(false)
      }
    } else {
      setPinSuccess(false)
    }
  }

  // Update Profile and Address
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide your name.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    const fullAddress = [flatBuilding.trim(), streetArea.trim()].filter(Boolean).join(', ')

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        shipping_address: fullAddress || undefined,
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        avatar_url: avatarPreview !== null ? avatarPreview : undefined,
      })
      setSuccess('Your profile details and address have been updated.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update details.')
    } finally {
      setLoading(false)
    }
  }

  // Avatar Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result
        setAvatarPreview(base64)
        setError(null)
        setLoading(true)
        try {
          await updateProfile({ avatar_url: base64 })
          setSuccess('Profile photo updated.')
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Failed to update photo.')
        } finally {
          setLoading(false)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await changePassword(currentPassword, newPassword)
      setSuccess(res.message || 'Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Order Cancellation
  const confirmCancelOrder = (orderId: number | string) => {
    setOrders((prev) =>
      prev.map((ord) => (String(ord.id) === String(orderId) ? { ...ord, order_status: 'Cancelled' } : ord))
    )
    setCancellingOrderId(null)
    setSuccess('Order has been cancelled. If paid, your refund will reflect within 3 to 5 business days.')
  }

  // Copy Tracking ID to Clipboard
  const handleCopyTrackingId = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId)
    setCopiedTrackingId(trackingId)
    setTimeout(() => setCopiedTrackingId(null), 2000)
  }

  // Buy Again handler
  const handleRepurchase = (item: any) => {
    addToCart({
      id: item.product_id || item.name,
      name: item.name,
      price: item.price,
      stock: 50,
      volume_ml: item.volume_ml || 50,
      concentration: 'Extrait de Parfum',
      rating: 5,
    } as any, 1)
    setAddedItemName(item.name)
    setTimeout(() => setAddedItemName(null), 2500)
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFAF9] flex flex-col items-center select-none font-['Inter',sans-serif]">
      <NavBar />

      {/* Main Container - Width and padding match Footer exactly */}
      <main className="w-full max-w-[1583px] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-28 pb-16 flex-1">
        
        {/* Not Logged In */}
        {!isAuthenticated || !user ? (
          <div className="bg-white border border-black/5 rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs space-y-5 my-12">
            <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto">
              <User className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-['Conquera',sans-serif] text-xl font-normal tracking-wider uppercase text-black">
                My Account
              </h2>
              <p className="text-xs text-neutral-500 mt-2 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] leading-relaxed">
                Sign in to check your order status, manage delivery addresses, and view your details.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Account Header */}
            <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-black/10 shrink-0 bg-neutral-100 flex items-center justify-center cursor-pointer group shadow-xs"
                  title="Click to change photo"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold text-black font-['Conquera',sans-serif]">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-lg sm:text-2xl font-normal font-['Conquera',sans-serif] tracking-wider uppercase text-black">
                      {user.name || 'My Profile'}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase bg-black text-white tracking-widest">
                      {user.role === 'admin' ? 'Admin' : 'Verified Member'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">{user.email}</p>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {user.phone ? `Phone: ${user.phone}` : 'No phone number added'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('repurchase')}
                  className="flex-1 lg:flex-initial px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs uppercase font-medium tracking-wider transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Purchase Again</span>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2.5 rounded-full border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-200 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Notification Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {addedItemName && (
              <div className="p-4 bg-black text-white rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Added <strong>{addedItemName}</strong> to your bag.</span>
                </div>
                <Link to="/checkout" className="text-neutral-300 hover:text-white underline font-semibold text-xs uppercase font-mono">
                  Proceed to Checkout &rarr;
                </Link>
              </div>
            )}

            {/* Two-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
              
              {/* Sidebar Menu */}
              <aside className="lg:col-span-3 bg-white border border-black/5 rounded-3xl p-3 sm:p-4 shadow-xs sticky top-28">
                <nav className="flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-none font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif] text-xs uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('overview'); setError(null); setSuccess(null); }}
                    className={`py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3 whitespace-nowrap text-left ${
                      activeTab === 'overview' ? 'bg-black text-white font-semibold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Account Overview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('orders'); setError(null); setSuccess(null); }}
                    className={`py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between whitespace-nowrap text-left ${
                      activeTab === 'orders' ? 'bg-black text-white font-semibold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-black'}`}>
                      {orders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('repurchase'); setError(null); setSuccess(null); }}
                    className={`py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3 whitespace-nowrap text-left ${
                      activeTab === 'repurchase' ? 'bg-black text-white font-semibold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Purchase Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('addresses'); setError(null); setSuccess(null); }}
                    className={`py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3 whitespace-nowrap text-left ${
                      activeTab === 'addresses' ? 'bg-black text-white font-semibold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Saved Addresses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('security'); setError(null); setSuccess(null); }}
                    className={`py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3 whitespace-nowrap text-left ${
                      activeTab === 'security' ? 'bg-black text-white font-semibold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Security and Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('help'); setError(null); setSuccess(null); }}
                    className={`py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3 whitespace-nowrap text-left ${
                      activeTab === 'help' ? 'bg-black text-white font-semibold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Help and Support</span>
                  </button>
                </nav>
              </aside>

              {/* Main Tab Views */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* 1. OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Total Orders</span>
                        <div className="text-2xl font-bold font-mono text-black mt-1">{orders.length}</div>
                        <span className="text-[11px] text-neutral-500 mt-1 block">Delivered across India</span>
                      </div>

                      <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Primary Delivery City</span>
                        <div className="text-sm font-bold text-black mt-1 truncate">
                          {user.city ? `${user.city}, ${user.pincode}` : 'No address saved'}
                        </div>
                        <span className="text-[11px] text-emerald-700 font-mono mt-1 block font-semibold">Ready for 1-Click Checkout</span>
                      </div>

                      <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Account Security</span>
                        <div className="text-sm font-bold text-black mt-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Active and Protected</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 mt-1 block">Standard encryption active</span>
                      </div>
                    </div>

                    {/* Recent Order Card */}
                    <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                      <div className="flex items-center justify-between pb-4 border-b border-black/5">
                        <h2 className="font-['Conquera',sans-serif] text-base font-normal tracking-wider uppercase text-black">
                          Recent Order
                        </h2>
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
                        >
                          <span>View all orders</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {orders.length === 0 ? (
                        <div className="py-8 text-center text-neutral-500 text-xs">
                          <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2 stroke-1" />
                          <p>You have not placed any orders yet.</p>
                          <Link to="/fragrances" className="text-black font-semibold underline mt-1 inline-block">
                            Shop Fragrances
                          </Link>
                        </div>
                      ) : (
                        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-black">Order #{orders[0].order_number}</span>
                              <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {orders[0].payment_status}
                              </span>
                              <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                orders[0].order_status?.toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-black text-white'
                              }`}>
                                {orders[0].order_status}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500">
                              Placed on {new Date(orders[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs font-medium text-black pt-1">
                              {orders[0].items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                            </p>

                            {/* Tracking Details Banner if shipped */}
                            {(orders[0].order_status?.toUpperCase() === 'SHIPPED' || orders[0].tracking_id || orders[0].tracking_number) && (
                              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-700">
                                <Truck className="w-3.5 h-3.5 text-black" />
                                <span>{orders[0].courier_partner || 'Bluedart Express'}:</span>
                                <span className="font-mono font-bold text-black">
                                  {orders[0].tracking_id || orders[0].tracking_number || 'CHEM-TRACK-7890'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-none border-black/5">
                            <span className="text-sm font-bold font-mono text-black">₹{orders[0].total_amount.toLocaleString('en-IN')}</span>
                            <button
                              type="button"
                              onClick={() => handleRepurchase(orders[0].items[0])}
                              className="text-[11px] text-emerald-700 font-mono font-semibold hover:underline flex items-center gap-1 cursor-pointer mt-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Buy Again
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. ORDERS & CANCELLATION */}
                {activeTab === 'orders' && (
                  <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/5">
                      <div>
                        <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                          My Orders
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          Track shipping status, check tracking numbers, or cancel orders before dispatch.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">{orders.length} Orders</span>
                    </div>

                    {ordersLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center text-neutral-400">
                        <Loader2 className="w-6 h-6 animate-spin text-black mb-2" />
                        <p className="text-xs font-mono uppercase tracking-wider">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                        <Package className="w-10 h-10 text-neutral-300 mx-auto stroke-1" />
                        <h4 className="font-['Conquera',sans-serif] text-sm uppercase text-black">No Orders Found</h4>
                        <p className="text-xs text-neutral-500">You haven't ordered anything yet.</p>
                        <Link to="/fragrances" className="inline-block mt-2 px-6 py-2.5 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {orders.map((order) => {
                          const statusUpper = order.order_status?.toUpperCase()
                          const isCancelled = statusUpper === 'CANCELLED'
                          const isDelivered = statusUpper === 'DELIVERED'
                          const isShipped = statusUpper === 'SHIPPED' || isDelivered || Boolean(order.tracking_id || order.tracking_number)
                          const canCancel = !isDelivered && !isCancelled && statusUpper !== 'SHIPPED'
                          
                          // Fallback mock tracking ID for demo until backend supplies it
                          const displayTrackingId = order.tracking_id || order.tracking_number || (isShipped ? `AWB${order.order_number.replace(/\D/g, '') || '987654321'}` : null)
                          const displayCourier = order.courier_partner || 'Bluedart Air'

                          return (
                            <div key={order.id} className="p-5 sm:p-6 rounded-2xl bg-neutral-50/70 border border-black/5 flex flex-col justify-between gap-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-black/5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-black">Order #{order.order_number}</span>
                                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      order.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {order.payment_status}
                                    </span>
                                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      isCancelled ? 'bg-red-100 text-red-800' : 'bg-black text-white'
                                    }`}>
                                      {order.order_status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-500 font-mono">
                                    Date: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>

                                <div className="text-left md:text-right">
                                  <span className="text-[11px] font-mono text-neutral-400 uppercase block">Amount Paid</span>
                                  <span className="text-base font-bold text-black font-mono">
                                    ₹{order.total_amount.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>

                              {/* Tracking Information Box */}
                              {isShipped && displayTrackingId ? (
                                <div className="p-3.5 bg-white rounded-xl border border-neutral-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                      <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-black">{displayCourier}</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase font-semibold">
                                          In Transit
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[11px] text-neutral-500 font-mono">Tracking No:</span>
                                        <span className="text-xs font-mono font-bold text-black select-all">{displayTrackingId}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTrackingId(displayTrackingId)}
                                      className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-[11px] font-mono font-medium text-neutral-700 hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      {copiedTrackingId === displayTrackingId ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          <span className="text-emerald-700">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-neutral-400" />
                                          <span>Copy ID</span>
                                        </>
                                      )}
                                    </button>

                                    <a
                                      href={order.tracking_url || `https://www.bluedart.com/tracking?trackNumber=${displayTrackingId}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                      <span>Track Shipment</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              ) : isCancelled ? (
                                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs text-red-700 flex items-center gap-2">
                                  <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                                  <span>Order has been cancelled. Any refund amount will reflect within 3 to 5 business days.</span>
                                </div>
                              ) : (
                                <div className="p-3 bg-white rounded-xl border border-neutral-200/80 text-xs text-neutral-500 flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-neutral-400 shrink-0" />
                                  <span>Tracking ID will be assigned and updated here once the order is packed and dispatched.</span>
                                </div>
                              )}

                              {/* Items list and actions */}
                              <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {order.items.map((item, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => handleRepurchase(item)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-neutral-200 hover:border-black text-[11px] text-black transition-all cursor-pointer shadow-xs"
                                    >
                                      <RefreshCw className="w-3 h-3 text-neutral-400" />
                                      <span>{item.name} &times; {item.quantity}</span>
                                      <span className="text-[10px] text-emerald-700 font-mono font-semibold pl-1">Buy Again</span>
                                    </button>
                                  ))}
                                </div>

                                {/* Cancel Order Button */}
                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => setCancellingOrderId(order.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancel Order</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. PURCHASE AGAIN */}
                {activeTab === 'repurchase' && (
                  <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/5">
                      <div>
                        <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                          Purchase Again
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          Easily re-order your favorite molecular extraits and past acquisitions in one click.
                        </p>
                      </div>
                      <Link
                        to="/fragrances"
                        className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black flex items-center gap-1"
                      >
                        <span>Explore full catalogue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Previously purchased items */}
                    {orders.length > 0 && orders.some((o) => o.items && o.items.length > 0) ? (
                      <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                          From Your Past Orders
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from(
                            new Map(
                              orders
                                .flatMap((o) => o.items || [])
                                .map((item) => [item.name, item])
                            ).values()
                          ).map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col justify-between gap-3 hover:border-black/20 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-14 bg-white rounded-xl border border-neutral-200 p-1 flex items-center justify-center shrink-0">
                                  <Package className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-['Cinzel',serif] text-xs font-bold text-black truncate">
                                    {item.name}
                                  </h4>
                                  <p className="text-[10px] text-neutral-500 uppercase mt-0.5">
                                    {item.volume_ml || 50}ml Extrait
                                  </p>
                                  <p className="text-xs font-bold font-mono text-black mt-1">
                                    ₹{item.price.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRepurchase(item)}
                                className="w-full py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-[11px] font-mono font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Buy Again</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center max-w-sm mx-auto space-y-3">
                        <Package className="w-10 h-10 text-neutral-300 mx-auto stroke-1" />
                        <h4 className="font-['Conquera',sans-serif] text-sm uppercase text-black">
                          No Past Orders Yet
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Once you place your first order, your past formulations will appear here for instant 1-click reordering.
                        </p>
                        <Link
                          to="/fragrances"
                          className="inline-block mt-2 px-6 py-2.5 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider"
                        >
                          Explore Molecular Series
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SAVED ADDRESSES */}
                {activeTab === 'addresses' && (
                  <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div>
                      <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                        Delivery Address
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Update your primary delivery address and phone number for shipping.
                      </p>
                    </div>

                    <form onSubmit={handleSaveDetails} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            Phone Number (For Delivery OTP) *
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                        </div>
                      </div>

                      {/* PIN Code Lookup */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider">
                            PIN Code (Auto-fills City and State) *
                          </label>
                          {pinSuccess && <span className="text-[10px] text-emerald-600 font-mono font-semibold">✓ Verified PIN</span>}
                          {pinError && <span className="text-[10px] text-rose-600 font-mono font-semibold">{pinError}</span>}
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => handlePinCodeChange(e.target.value)}
                            placeholder="e.g. 641031"
                            className="w-full pl-10 pr-10 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black font-mono focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                          {isPinLoading && <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400 animate-spin" />}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            House, Flat, or Building *
                          </label>
                          <input
                            type="text"
                            value={flatBuilding}
                            onChange={(e) => setFlatBuilding(e.target.value)}
                            placeholder="House No, Apartment Name"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            Street and Area
                          </label>
                          <input
                            type="text"
                            value={streetArea}
                            onChange={(e) => setStreetArea(e.target.value)}
                            placeholder="Street, Landmark"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            City *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            State *
                          </label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            placeholder="State"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 px-8 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-medium uppercase tracking-[0.2em] transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {loading ? 'Saving Address...' : 'Save Address'}
                      </button>
                    </form>
                  </div>
                )}

                {/* 5. SECURITY & PASSWORD */}
                {activeTab === 'security' && (
                  <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
                    <div>
                      <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                        Change Password
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Update your password regularly to keep your account safe.
                      </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black cursor-pointer"
                          >
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black cursor-pointer"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-medium uppercase tracking-[0.2em] transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                )}

                {/* 6. HELP AND SUPPORT */}
                {activeTab === 'help' && (
                  <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div>
                      <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                        Help and Support
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                        Have questions about your order, returns, or shipping? Contact us directly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-neutral-50 border border-black/5 space-y-2">
                        <Mail className="w-5 h-5 text-black" />
                        <h4 className="font-['Conquera',sans-serif] text-xs font-normal tracking-wider uppercase text-black">
                          Email Support
                        </h4>
                        <p className="text-xs text-neutral-500 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          Reach out for order tracking, address changes, and cancellations.
                        </p>
                        <a href="mailto:support@chembros.com" className="inline-block text-xs font-mono font-semibold text-black hover:underline pt-1">
                          support@chembros.com
                        </a>
                      </div>

                      <div className="p-5 rounded-2xl bg-neutral-50 border border-black/5 space-y-2">
                        <Truck className="w-5 h-5 text-black" />
                        <h4 className="font-['Conquera',sans-serif] text-xs font-normal tracking-wider uppercase text-black">
                          Shipping and Delivery
                        </h4>
                        <p className="text-xs text-neutral-500 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                          Orders are dispatched within 24 to 48 hours. Express delivery takes 3 to 5 business days across India.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-xs text-neutral-600 font-mono leading-relaxed">
                      <strong>Cancellation Policy:</strong> Orders can be cancelled at any time prior to shipping dispatch. Refunds are returned to the source payment method within 3 to 5 working days.
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}
      </main>

      {/* Cancellation Confirmation Modal */}
      {cancellingOrderId !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full border border-neutral-200 shadow-2xl text-center space-y-4">
            <div className="w-11 h-11 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-normal font-['Conquera',sans-serif] uppercase tracking-wide text-black">
                Cancel Order?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to cancel this order? If payment was made, your full refund will be processed within 3 to 5 business days.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => confirmCancelOrder(cancellingOrderId)}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
