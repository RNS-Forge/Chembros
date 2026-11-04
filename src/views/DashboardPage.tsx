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
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  Building,
  Home as HomeIcon,
  Briefcase,
} from 'lucide-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getMyOrdersApi, cancelOrderApi, requestOrderCancelOtpApi } from '../services/api'
import type { Order, UserAddress } from '../types'

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

  // Manage Address & New Address State
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [addressView, setAddressView] = useState<'list' | 'form'>('list')
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Detailed Address Form Fields
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Office' | 'Other'>('Home')
  const [addrFullName, setAddrFullName] = useState('')
  const [addrPhone, setAddrPhone] = useState('') // Main Phone (Required, 10 digits)
  const [addrSecondaryPhone, setAddrSecondaryPhone] = useState('') // Secondary Phone (Optional)
  const [addrHouseNo, setAddrHouseNo] = useState('') // House / Flat No (Required)
  const [addrHouseColor, setAddrHouseColor] = useState('') // House / Building Color
  const [addrStreet, setAddrStreet] = useState('') // Street / Area / Colony (Required)
  const [addrLandmark, setAddrLandmark] = useState('') // Near Place / Landmark (Easy Delivery)
  const [addrCity, setAddrCity] = useState('') // City / Town (Required)
  const [addrDistrict, setAddrDistrict] = useState('') // District (Required)
  const [addrState, setAddrState] = useState('Tamil Nadu') // State (Required)
  const [addrCountry, setAddrCountry] = useState('India') // Country (Required)
  const [addrPincode, setAddrPincode] = useState('') // PIN Code (Required, 6 digits)
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [addrPinLoading, setAddrPinLoading] = useState(false)
  const [addrPinSuccess, setAddrPinSuccess] = useState(false)
  const [addrPinError, setAddrPinError] = useState<string | null>(null)

  // Load and sync addresses for active user
  useEffect(() => {
    if (!user) return
    const storageKey = `chembros_addresses_${user.id || user.email}`
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed)
          return
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved addresses:', e)
    }

    // Initialize with current profile address if available
    if (user.shipping_address || user.phone) {
      const streetParts = user.shipping_address ? user.shipping_address.split(',').map((p: string) => p.trim()) : []
      const initialAddr: UserAddress = {
        id: 'addr_default_1',
        label: 'Home',
        full_name: user.name || 'Primary Client',
        phone: user.phone || '',
        secondary_phone: user.secondary_phone || '',
        house_no: user.house_no || (streetParts.length > 0 ? streetParts[0] : 'Residence'),
        house_color: user.house_color || '',
        landmark: user.landmark || '',
        street: user.shipping_address || (streetParts.length > 1 ? streetParts.slice(1).join(', ') : 'Central Avenue'),
        city: user.city || 'Chennai',
        district: user.district || user.city || 'Chennai',
        state: user.state || 'Tamil Nadu',
        country: user.country || 'India',
        pincode: user.pincode || '600001',
        is_default: true,
        created_at: new Date().toISOString(),
      }
      setAddresses([initialAddr])
      try {
        localStorage.setItem(storageKey, JSON.stringify([initialAddr]))
      } catch {}
    }
  }, [user])

  // Instant Postal PIN Code Lookup
  const handleAddrPinChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setAddrPincode(cleaned)
    setAddrPinError(null)

    if (cleaned.length === 6) {
      setAddrPinLoading(true)
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`)
        const data = await res.json()
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0]
          if (po.District) {
            setAddrDistrict(po.District)
            if (!addrCity) setAddrCity(po.District)
          } else if (po.Division) {
            setAddrDistrict(po.Division)
          }
          if (po.State) {
            setAddrState(po.State)
          }
          setAddrPinSuccess(true)
          setAddrPinError(null)
        } else {
          setAddrPinError('Invalid PIN code.')
          setAddrPinSuccess(false)
        }
      } catch (err) {
        console.warn('Postal PIN lookup error:', err)
      } finally {
        setAddrPinLoading(false)
      }
    } else {
      setAddrPinSuccess(false)
    }
  }

  // Open Add New Address Form
  const handleOpenNewAddress = () => {
    setEditingAddressId(null)
    setAddrLabel('Home')
    setAddrFullName(user?.name || '')
    setAddrPhone(user?.phone || '')
    setAddrSecondaryPhone(user?.secondary_phone || '')
    setAddrHouseNo('')
    setAddrHouseColor('')
    setAddrStreet('')
    setAddrLandmark('')
    setAddrCity(user?.city || '')
    setAddrDistrict(user?.district || user?.city || '')
    setAddrState(user?.state || 'Tamil Nadu')
    setAddrCountry(user?.country || 'India')
    setAddrPincode(user?.pincode || '')
    setAddrIsDefault(addresses.length === 0)
    setAddrPinError(null)
    setAddrPinSuccess(false)
    setAddressView('form')
    setError(null)
    setSuccess(null)
  }

  // Open Edit Address Form
  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id)
    setAddrLabel((addr.label as any) || 'Home')
    setAddrFullName(addr.full_name || '')
    setAddrPhone(addr.phone || '')
    setAddrSecondaryPhone(addr.secondary_phone || '')
    setAddrHouseNo(addr.house_no || '')
    setAddrHouseColor(addr.house_color || '')
    setAddrStreet(addr.street || '')
    setAddrLandmark(addr.landmark || '')
    setAddrCity(addr.city || '')
    setAddrDistrict(addr.district || '')
    setAddrState(addr.state || 'Tamil Nadu')
    setAddrCountry(addr.country || 'India')
    setAddrPincode(addr.pincode || '')
    setAddrIsDefault(!!addr.is_default)
    setAddrPinError(null)
    setAddrPinSuccess(false)
    setAddressView('form')
    setError(null)
    setSuccess(null)
  }

  // Delete an Address
  const handleDeleteAddress = async (id: string) => {
    if (!user) return
    const storageKey = `chembros_addresses_${user.id || user.email}`
    const target = addresses.find((a) => a.id === id)
    const updated = addresses.filter((a) => a.id !== id)

    if (target?.is_default && updated.length > 0) {
      updated[0].is_default = true
      const def = updated[0]
      const compositeAddress = [
        `House No: ${def.house_no}`,
        def.house_color ? `Building Color: ${def.house_color}` : null,
        def.street,
        def.landmark ? `Near / Landmark: ${def.landmark}` : null,
        def.city,
        def.district,
        def.state,
        def.country,
        `PIN: ${def.pincode}`,
      ].filter(Boolean).join(', ')

      await updateProfile({
        phone: def.phone,
        secondary_phone: def.secondary_phone,
        shipping_address: compositeAddress,
        city: def.city,
        district: def.district,
        state: def.state,
        country: def.country,
        pincode: def.pincode,
        house_no: def.house_no,
        house_color: def.house_color,
        landmark: def.landmark,
      })
    }

    setAddresses(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {}
    setSuccess('Address successfully removed from your account.')
  }

  // Set Address as Default
  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return
    const storageKey = `chembros_addresses_${user.id || user.email}`
    const updated = addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }))
    setAddresses(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {}

    const def = updated.find((a) => a.id === id)
    if (def) {
      const compositeAddress = [
        `House No: ${def.house_no}`,
        def.house_color ? `Building Color: ${def.house_color}` : null,
        def.street,
        def.landmark ? `Near / Landmark: ${def.landmark}` : null,
        def.city,
        def.district,
        def.state,
        def.country,
        `PIN: ${def.pincode}`,
      ].filter(Boolean).join(', ')

      try {
        await updateProfile({
          phone: def.phone,
          secondary_phone: def.secondary_phone,
          shipping_address: compositeAddress,
          city: def.city,
          district: def.district,
          state: def.state,
          country: def.country,
          pincode: def.pincode,
          house_no: def.house_no,
          house_color: def.house_color,
          landmark: def.landmark,
        })
        setSuccess(`Default delivery destination set to ${def.label || 'Address'}.`)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update default address in profile.')
      }
    }
  }

  // Save Address Form (New or Edit)
  const handleSaveAddressForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!addrFullName.trim()) {
      setError('Please provide recipient full name.')
      return
    }
    const cleanPhone = addrPhone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Main Phone number is required (at least 10 digits for courier delivery OTP).')
      return
    }
    if (addrSecondaryPhone.trim()) {
      const cleanSecPhone = addrSecondaryPhone.replace(/\D/g, '')
      if (cleanSecPhone.length < 10) {
        setError('Secondary Phone number must have at least 10 digits if provided.')
        return
      }
    }
    if (!addrHouseNo.trim()) {
      setError('House / Flat / Building No. is required.')
      return
    }
    if (!addrStreet.trim()) {
      setError('Street / Area / Landmark is required.')
      return
    }
    const cleanPin = addrPincode.replace(/\D/g, '')
    if (!cleanPin || cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.')
      return
    }
    if (!addrCity.trim()) {
      setError('City / Town is required.')
      return
    }
    if (!addrDistrict.trim()) {
      setError('District is required.')
      return
    }
    if (!addrState.trim()) {
      setError('State is required.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const shouldBeDefault = addrIsDefault || addresses.length === 0

    const addressRecord: UserAddress = {
      id: editingAddressId || `addr_${Date.now()}`,
      label: addrLabel,
      full_name: addrFullName.trim(),
      phone: cleanPhone,
      secondary_phone: addrSecondaryPhone.trim() ? addrSecondaryPhone.replace(/\D/g, '') : undefined,
      house_no: addrHouseNo.trim(),
      house_color: addrHouseColor.trim() || undefined,
      street: addrStreet.trim(),
      landmark: addrLandmark.trim() || undefined,
      city: addrCity.trim(),
      district: addrDistrict.trim(),
      state: addrState.trim(),
      country: addrCountry.trim() || 'India',
      pincode: cleanPin,
      is_default: shouldBeDefault,
      created_at: new Date().toISOString(),
    }

    let updatedList: UserAddress[]
    if (editingAddressId) {
      updatedList = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return addressRecord
        }
        return shouldBeDefault ? { ...a, is_default: false } : a
      })
    } else {
      updatedList = shouldBeDefault
        ? [...addresses.map((a) => ({ ...a, is_default: false })), addressRecord]
        : [...addresses, addressRecord]
    }

    const storageKey = `chembros_addresses_${user.id || user.email}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList))
    } catch {}

    setAddresses(updatedList)

    if (shouldBeDefault) {
      const compositeAddress = [
        `House No: ${addressRecord.house_no}`,
        addressRecord.house_color ? `Building Color: ${addressRecord.house_color}` : null,
        addressRecord.street,
        addressRecord.landmark ? `Near / Landmark: ${addressRecord.landmark}` : null,
        addressRecord.city,
        addressRecord.district,
        addressRecord.state,
        addressRecord.country,
        `PIN: ${addressRecord.pincode}`,
      ].filter(Boolean).join(', ')

      try {
        await updateProfile({
          phone: addressRecord.phone,
          secondary_phone: addressRecord.secondary_phone,
          shipping_address: compositeAddress,
          city: addressRecord.city,
          district: addressRecord.district,
          state: addressRecord.state,
          country: addressRecord.country,
          pincode: addressRecord.pincode,
          house_no: addressRecord.house_no,
          house_color: addressRecord.house_color,
          landmark: addressRecord.landmark,
        })
      } catch (err: unknown) {
        console.warn('Could not sync default address to backend profile:', err)
      }
    }

    setLoading(false)
    setAddressView('list')
    setEditingAddressId(null)
    setSuccess(editingAddressId ? 'Address updated successfully.' : 'New delivery address added successfully.')
  }

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
  const [cancelOtpStep, setCancelOtpStep] = useState<'request' | 'verify'>('request')
  const [cancelOtpCode, setCancelOtpCode] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelCooldown, setCancelCooldown] = useState(0)
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

  // Handle Order Cancellation with OTP Verification
  useEffect(() => {
    if (cancelCooldown <= 0) return
    const timer = setInterval(() => {
      setCancelCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cancelCooldown])

  const handleStartCancelOrder = (orderId: number | string) => {
    setCancellingOrderId(orderId)
    setCancelOtpStep('request')
    setCancelOtpCode('')
    setCancelReason('')
    setCancelError(null)
  }

  const handleRequestCancelOtp = async () => {
    if (!cancellingOrderId) return
    setCancelLoading(true)
    setCancelError(null)
    try {
      await requestOrderCancelOtpApi(cancellingOrderId)
      setCancelOtpStep('verify')
      setCancelCooldown(45)
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to send cancellation code.')
    } finally {
      setCancelLoading(false)
    }
  }

  const confirmCancelOrder = async (orderId: number | string) => {
    if (cancelOtpStep === 'verify' && cancelOtpCode.trim().length !== 6 && user?.role !== 'admin') {
      setCancelError('Please enter the complete 6-digit cancellation code.')
      return
    }

    setCancelLoading(true)
    setCancelError(null)
    try {
      const res = await cancelOrderApi(orderId, cancelReason, cancelOtpCode.trim() || undefined)
      setOrders((prev) =>
        prev.map((ord) => (String(ord.id) === String(orderId) ? { ...ord, order_status: 'Cancelled' } : ord))
      )
      setSuccess(res.message || 'Order has been cancelled successfully. If paid, your refund will reflect within 3 to 5 business days.')
      setCancellingOrderId(null)
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order.')
    } finally {
      setCancelLoading(false)
    }
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
      <main className="w-full max-w-[1583px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-28 pb-16 flex-1">
        
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
                          const canCancel = !isCancelled && (statusUpper === 'PLACED' || statusUpper === 'PROCESSING' || statusUpper === 'PENDING')
                          
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
                                    onClick={() => handleStartCancelOrder(order.id)}
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

                {/* 4. MANAGE ADDRESS & NEW ADDRESS */}
                {activeTab === 'addresses' && (
                  <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    {/* View 1: Manage Addresses List */}
                    {addressView === 'list' && (
                      <div className="space-y-6">
                        {/* Header with Title & + New Address button */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-black/5">
                          <div>
                            <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                              Manage Addresses
                            </h2>
                            <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                              Detailed delivery locations for courier dispatch and verified OTP delivery.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleOpenNewAddress}
                            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0 self-start sm:self-auto"
                          >
                            <Plus className="w-4 h-4" />
                            <span>New Address</span>
                          </button>
                        </div>

                        {/* Address Cards List */}
                        {addresses.length === 0 ? (
                          <div className="text-center py-12 px-4 border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50">
                            <div className="w-12 h-12 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-500 mx-auto mb-3">
                              <MapPin className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <h4 className="font-['Conquera',sans-serif] text-sm uppercase tracking-wider text-black">
                              No Delivery Addresses Saved
                            </h4>
                            <p className="text-xs text-neutral-500 mt-1 mb-4 max-w-sm mx-auto">
                              Add your primary residence or workplace for rapid 1-click checkout and seamless dispatch.
                            </p>
                            <button
                              type="button"
                              onClick={handleOpenNewAddress}
                              className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add New Address</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                              <div
                                key={addr.id}
                                className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                  addr.is_default
                                    ? 'border-black bg-neutral-50/60 shadow-sm'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                                }`}
                              >
                                <div>
                                  {/* Badge Row */}
                                  <div className="flex items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 text-black border border-black/10 font-semibold">
                                        {addr.label || 'Home'}
                                      </span>
                                      {addr.is_default && (
                                        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black text-white font-semibold">
                                          Default Address
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Recipient Name */}
                                  <h3 className="text-sm font-bold text-black uppercase tracking-wide font-['Cinzel',serif]">
                                    {addr.full_name}
                                  </h3>

                                  {/* Phone Numbers Display: Main vs Secondary */}
                                  <div className="mt-2.5 space-y-1.5 pb-3 border-b border-neutral-100">
                                    <div className="flex items-center gap-2 text-xs">
                                      <Phone className="w-3.5 h-3.5 text-black shrink-0" />
                                      <span className="font-mono font-semibold text-black">+91 {addr.phone}</span>
                                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Main Phone (Required)
                                      </span>
                                    </div>

                                    {addr.secondary_phone && (
                                      <div className="flex items-center gap-2 text-xs">
                                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                        <span className="font-mono text-neutral-600">+91 {addr.secondary_phone}</span>
                                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">
                                          Secondary Phone (Optional)
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Detailed Address Specifics */}
                                  <div className="mt-3 space-y-1 text-xs text-neutral-700 font-['Inter',sans-serif]">
                                    <div className="font-medium text-black">
                                      House / Flat No: <span className="font-semibold">{addr.house_no}</span>
                                    </div>
                                    {addr.house_color && (
                                      <div className="text-[11px] text-neutral-600 italic">
                                        Building Color: <span className="font-medium not-italic text-black">{addr.house_color}</span>
                                      </div>
                                    )}
                                    <div>
                                      Street: <span className="font-medium text-black">{addr.street}</span>
                                    </div>
                                    {addr.landmark && (
                                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 font-medium inline-flex items-center gap-1.5 my-0.5">
                                        <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-700 font-bold">Near / Landmark:</span>
                                        <span>{addr.landmark}</span>
                                      </div>
                                    )}
                                    <div className="text-neutral-600">
                                      {addr.city}, {addr.district}
                                    </div>
                                    <div className="text-neutral-600">
                                      {addr.state}, {addr.country} - <span className="font-mono font-semibold text-black">{addr.pincode}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditAddress(addr)}
                                      className="text-black font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAddress(addr.id)}
                                      className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer text-xs"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>

                                  {!addr.is_default && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetDefaultAddress(addr.id)}
                                      className="text-[11px] font-mono text-neutral-600 hover:text-black uppercase tracking-wider font-semibold cursor-pointer underline"
                                    >
                                      Set as Default
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* View 2: Add / Edit Detailed Address Form */}
                    {addressView === 'form' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-black/5">
                          <div>
                            <h2 className="font-['Conquera',sans-serif] text-base sm:text-lg font-normal tracking-wider uppercase text-black">
                              {editingAddressId ? 'Edit Delivery Address' : 'New Delivery Address'}
                            </h2>
                            <p className="text-xs text-neutral-500 mt-1 font-['FONTSPRING_DEMO_-_Lufga_Medium','Poppins',sans-serif]">
                              Detailed delivery coordinates with house color & secondary phone for precise courier dispatch.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAddressView('list')
                              setEditingAddressId(null)
                              setError(null)
                            }}
                            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Addresses</span>
                          </button>
                        </div>

                        <form onSubmit={handleSaveAddressForm} className="space-y-4">
                          {/* Label Selector: Home / Office / Other */}
                          <div>
                            <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                              Address Label
                            </label>
                            <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                              {(['Home', 'Office', 'Other'] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setAddrLabel(type)}
                                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                    addrLabel === type
                                      ? 'bg-black text-white shadow-xs'
                                      : 'text-neutral-600 hover:text-black'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Contact Details: Full Name, Main Phone, Secondary Phone */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                Recipient Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={addrFullName}
                                onChange={(e) => setAddrFullName(e.target.value)}
                                placeholder="Lord / Lady Sterling"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider">
                                  Main Phone *
                                </label>
                                <span className="text-[9px] font-mono uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                  Required (OTP)
                                </span>
                              </div>
                              <input
                                type="tel"
                                required
                                value={addrPhone}
                                onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210 (10 Digits)"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider">
                                  Secondary Phone
                                </label>
                                <span className="text-[9px] font-mono uppercase text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                  Optional
                                </span>
                              </div>
                              <input
                                type="tel"
                                value={addrSecondaryPhone}
                                onChange={(e) => setAddrSecondaryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Alternate Mobile Number"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>
                          </div>

                          {/* Detailed Structure: House No & House Color */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                House / Flat / Suite No. *
                              </label>
                              <input
                                type="text"
                                required
                                value={addrHouseNo}
                                onChange={(e) => setAddrHouseNo(e.target.value)}
                                placeholder="e.g. Flat 4B, Chembros Residency / Villa No. 12"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                House / Building Color (Visual Landmark)
                              </label>
                              <input
                                type="text"
                                value={addrHouseColor}
                                onChange={(e) => setAddrHouseColor(e.target.value)}
                                placeholder="e.g. White villa with black gate / Grey 4-storey tower"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>
                          </div>

                          {/* Street, Near Place / Landmark & Postal PIN Code */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                Street / Road / Area *
                              </label>
                              <input
                                type="text"
                                required
                                value={addrStreet}
                                onChange={(e) => setAddrStreet(e.target.value)}
                                placeholder="e.g. 2nd Main Road, Sterling Avenue"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider">
                                  Near Place / Landmark
                                </label>
                                <span className="text-[9px] font-mono uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                  Easy Delivery
                                </span>
                              </div>
                              <input
                                type="text"
                                value={addrLandmark}
                                onChange={(e) => setAddrLandmark(e.target.value)}
                                placeholder="e.g. Near Water Tank, Opp. City Mall, Behind Apollo"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>
                          </div>

                          {/* Postal PIN Code */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider">
                                Postal PIN Code * (Auto-fills City & District)
                              </label>
                              {addrPinSuccess && <span className="text-[10px] text-emerald-600 font-mono font-semibold">Verified</span>}
                              {addrPinError && <span className="text-[10px] text-rose-600 font-mono font-semibold">{addrPinError}</span>}
                            </div>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                              <input
                                type="text"
                                maxLength={6}
                                required
                                value={addrPincode}
                                onChange={(e) => handleAddrPinChange(e.target.value)}
                                placeholder="600001"
                                className="w-full pl-10 pr-10 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black font-mono focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                              {addrPinLoading && <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400 animate-spin" />}
                            </div>
                          </div>

                          {/* City, District, State, Country */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                City / Town *
                              </label>
                              <input
                                type="text"
                                required
                                value={addrCity}
                                onChange={(e) => setAddrCity(e.target.value)}
                                placeholder="e.g. Chennai"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                District *
                              </label>
                              <input
                                type="text"
                                required
                                value={addrDistrict}
                                onChange={(e) => setAddrDistrict(e.target.value)}
                                placeholder="e.g. Chennai District"
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
                                value={addrState}
                                onChange={(e) => setAddrState(e.target.value)}
                                placeholder="e.g. Tamil Nadu"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                Country *
                              </label>
                              <input
                                type="text"
                                required
                                value={addrCountry}
                                onChange={(e) => setAddrCountry(e.target.value)}
                                placeholder="India"
                                className="w-full px-3.5 py-3 bg-neutral-50/80 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                            </div>
                          </div>

                          {/* Default Checkbox */}
                          <div className="pt-2">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={addrIsDefault}
                                onChange={(e) => setAddrIsDefault(e.target.checked)}
                                className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black"
                              />
                              <span className="text-xs text-neutral-700 font-medium">
                                Set as default delivery address for rapid 1-click orders
                              </span>
                            </label>
                          </div>

                          {/* Form Action Buttons */}
                          <div className="flex items-center gap-3 pt-3">
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-semibold uppercase tracking-[0.15em] transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Saving Address...</span>
                                </>
                              ) : (
                                <span>{editingAddressId ? 'Update Address' : 'Save New Address'}</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAddressView('list')
                                setEditingAddressId(null)
                                setError(null)
                              }}
                              className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
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

      {/* Cancellation Confirmation Modal with OTP Verification */}
      {cancellingOrderId !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full border border-neutral-200 shadow-2xl text-center space-y-4">
            <div className="w-11 h-11 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-normal font-['Conquera',sans-serif] uppercase tracking-wide text-black">
                {cancelOtpStep === 'request' ? 'Cancel Order?' : 'Verify Cancellation'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {cancelOtpStep === 'request'
                  ? 'To authorize cancellation and initiate your refund, a single-use 6-digit verification code will be dispatched to your registered email.'
                  : `Enter the 6-digit verification code sent to ${user?.email || 'your email'} to finalize cancellation:`}
              </p>
            </div>

            {cancelError && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-mono">
                {cancelError}
              </div>
            )}

            {cancelOtpStep === 'request' ? (
              <div className="space-y-3 pt-2">
                <div>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCancellingOrderId(null)}
                    disabled={cancelLoading}
                    className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    onClick={user?.role === 'admin' ? () => confirmCancelOrder(cancellingOrderId) : handleRequestCancelOtp}
                    disabled={cancelLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{user?.role === 'admin' ? 'Cancel Order' : 'Send Code'}</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={cancelOtpCode}
                    onChange={(e) => setCancelOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCancellingOrderId(null)}
                    disabled={cancelLoading}
                    className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmCancelOrder(cancellingOrderId)}
                    disabled={cancelLoading || cancelOtpCode.length !== 6}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Verify & Cancel</span>
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 pt-1">
                  <button
                    type="button"
                    onClick={() => setCancelOtpStep('request')}
                    className="hover:text-black cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestCancelOtp}
                    disabled={cancelCooldown > 0 || cancelLoading}
                    className="hover:text-black cursor-pointer disabled:opacity-40"
                  >
                    {cancelCooldown > 0 ? `Resend (${cancelCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
