'use client'
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import type { Product, Order, AdminStats, User, AdminLogItem, PlatformSettings } from '../types'
import { DEFAULT_PLATFORM_SETTINGS } from '../types'
import {
  getAdminStatsApi,
  getProductsApi,
  createAdminProductApi,
  updateAdminProductApi,
  updateProductStockApi,
  updateProductPriceApi,
  deleteAdminProductApi,
  getAdminOrdersApi,
  updateAdminOrderStatusApi,
  getAdminUsersApi,
  updateAdminUserStatusApi,
  updateAdminUserRoleApi,
  getAdminLogsApi,
  getCachedAdminLogsSync,
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import { usePlatformSettings } from '../context/PlatformSettingsContext'
import {
  ShieldCheck,
  Truck,
  Check,
  Copy,
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  CheckCircle2,
  Search,
  Loader2,
  X,
  Mail,
  Lock,
  AlertCircle,
  LogOut,
  Users,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  KeyRound,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  MapPin,
  ExternalLink,
  Settings as SettingsIcon,
  CreditCard,
  Banknote,
  Sliders,
  DollarSign,
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react'

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, isAdmin, isLoading: authLoading, logout, updateProfile, changePassword } = useAuth()
  const { settings, updateSettings, resetSettings } = usePlatformSettings()

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'logs' | 'settings' | 'profile'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLogItem[]>(() => getCachedAdminLogsSync() || [])
  const [loading, setLoading] = useState(true)

  // Feedback notifications
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  // Column Search toggles (matching Image 2)
  const [productColSearch, setProductColSearch] = useState(false)
  const [orderColSearch, setOrderColSearch] = useState(false)
  const [userColSearch, setUserColSearch] = useState(false)
  const [logColSearch, setLogColSearch] = useState(false)

  // Column filter state for Products
  const [prodFilters, setProdFilters] = useState({
    name: '',
    family: '',
    price: '',
    origPrice: '',
    deliveryFee: '',
    stock: '',
    margin: '',
  })

  // Column filter state for Orders
  const [orderFilters, setOrderFilters] = useState({
    orderNumber: '',
    date: '',
    customer: '',
    destination: '',
    subtotal: '',
    deliveryFee: '',
    total: '',
    payment: '',
    status: '',
  })

  // Column filter state for Users
  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    date: '',
    role: '',
    status: '',
  })

  // Column filter state for Logs
  const [logFilters, setLogFilters] = useState({
    date: '',
    category: '',
    action: '',
    details: '',
    email: '',
    status: '',
  })

  // Users filter & search
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all')

  // Logs filter
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('ALL')

  // Orders filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')

  // Product Editing / Creation state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    subtitle: '',
    price: 4500,
    original_price: 5000,
    delivery_fee: 0,
    stock: 50,
    category: 'Extrait de Parfum',
    fragrance_family: 'Woody',
    concentration: '30% Pure Extrait',
    volume_ml: 50,
    top_notes: '',
    heart_notes: '',
    base_notes: '',
    description: '',
    image_base64: '',
    is_trending: false,
    is_featured: false,
  })

  // Quick edits on products table
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({})
  const [origPriceEdits, setOrigPriceEdits] = useState<Record<string, number>>({})
  const [deliveryFeeEdits, setDeliveryFeeEdits] = useState<Record<string, number>>({})

  // Shipping Dispatch Modal state
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null)
  const [dispatchForm, setDispatchForm] = useState({
    courier: 'Blue Dart Express',
    tracking_number: '',
    status: 'Shipped' as 'Shipped' | 'Delivered',
    dispatch_notes: '',
  })
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null)

  // Full-Page Profile & Master Security form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    secondary_phone: user?.secondary_phone || '',
    avatar_url: user?.avatar_url || '',
    headquarters: 'Madurai & Chennai Studio Atelier',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Platform Settings & Permissions Form State
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(settings || DEFAULT_PLATFORM_SETTINGS)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Sync profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        secondary_phone: user.secondary_phone || '',
        avatar_url: user.avatar_url || '',
      }))
    }
  }, [user])

  // Sync settings form when settings loaded
  useEffect(() => {
    if (settings) {
      setSettingsForm(settings)
    }
  }, [settings])

  // Auto-redirect to unified client sign-in if not an authorized administrator
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login?redirect=/admin', { replace: true })
    }
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    loadAllAdminData()

    // Listen to real-time product updates
    const handleProductsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<Product[]>
      if (Array.isArray(customEvent.detail)) {
        setProducts(customEvent.detail)
      }
    }
    window.addEventListener('chembros:products-updated', handleProductsUpdated)
    return () => {
      window.removeEventListener('chembros:products-updated', handleProductsUpdated)
    }
  }, [isAdmin])

  // Filter orders without refetching the entire admin dashboard
  useEffect(() => {
    if (!isAdmin) return
    let isCancelled = false
    getAdminOrdersApi(orderStatusFilter, orderSearch)
      .then((ordersData) => {
        if (!isCancelled) setOrders(ordersData)
      })
      .catch((err) => console.warn('Failed to filter orders:', err))

    return () => {
      isCancelled = true
    }
  }, [isAdmin, orderStatusFilter, orderSearch])

  async function loadAllAdminData() {
    setLoading(true)
    try {
      // Prioritize essential overview data for instantaneous rendering
      const [statsData, productsData, ordersData] = await Promise.all([
        getAdminStatsApi(),
        getProductsApi(),
        getAdminOrdersApi(orderStatusFilter, orderSearch),
      ])
      setStats(statsData)
      setProducts(productsData)
      setOrders(ordersData)
      // Render overview immediately without waiting on secondary audit logs
      setLoading(false)

      // Fetch users and audit logs concurrently without blocking viewport
      Promise.all([
        getAdminUsersApi().catch(() => []),
        getAdminLogsApi().catch(() => []),
      ]).then(([usersData, logsData]) => {
        setAdminUsers(usersData)
        setAdminLogs(logsData)
      })
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err)
      setLoading(false)
    }
  }

  // Export functions (CSV, TSV clipboard, and PDF printable window)
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((val) => {
            const str = String(val ?? '').replace(/"/g, '""')
            return `"${str}"`
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setSaveFeedback(`Exported ${rows.length} rows to ${filename}.csv successfully.`)
  }

  const copyTableDataToClipboard = (headers: string[], rows: (string | number)[][], label: string) => {
    const tsvContent = [
      headers.join('\t'),
      ...rows.map((row) => row.map((val) => String(val ?? '').replace(/\t/g, ' ')).join('\t')),
    ].join('\n')

    navigator.clipboard
      .writeText(tsvContent)
      .then(() => {
        setSaveFeedback(`${label} table data copied to clipboard. Ready to paste in Excel.`)
      })
      .catch(() => {
        setSaveFeedback('Clipboard copy permission denied.')
      })
  }

  const exportToPdfPrintable = (title: string, headers: string[], rows: (string | number)[][]) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to export printable PDF.')
      return
    }
    const tableHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Chembros Haute Parfumerie</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 28px; color: #111; margin: 0; }
            .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
            h1 { font-family: Georgia, serif; font-size: 20px; letter-spacing: 2px; margin: 0 0 4px 0; text-transform: uppercase; }
            .meta { font-size: 11px; color: #666; margin: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
            th { background: #f4effc; color: #3d2757; border: 1px solid #dcd5e8; padding: 8px 10px; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
            td { border: 1px solid #e5e5e5; padding: 8px 10px; vertical-align: top; }
            tr:nth-child(even) { background: #faf9fd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Chembros Haute Parfumerie</h1>
            <p class="meta">${title} · Laboratory Master Export · Generated on ${new Date().toLocaleString('en-IN')}</p>
          </div>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(tableHtml)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 350)
  }

  // Profile Save handler
  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileFeedback(null)
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        secondary_phone: profileForm.secondary_phone,
        avatar_url: profileForm.avatar_url,
      })
      setProfileFeedback({
        type: 'success',
        message: 'Master administrator dossier and contact details saved successfully.',
      })
      setSaveFeedback('Administrator profile details updated.')
    } catch (err: unknown) {
      setProfileFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update administrator profile.',
      })
    } finally {
      setProfileSaving(false)
    }
  }

  // Password Change handler
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Current master password is required.' })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'New password must contain at least 8 characters.' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password confirmation does not match.' })
      return
    }
    setPasswordSaving(true)
    setPasswordFeedback(null)
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordFeedback({
        type: 'success',
        message: 'Master administrator password updated successfully.',
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaveFeedback('Master administrator password changed.')
    } catch (err: unknown) {
      setPasswordFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update master password. Verify current credentials.',
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  // Platform Settings Save Handler
  const handleSavePlatformSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSettingsSaving(true)
    setSettingsFeedback(null)
    try {
      await updateSettings(settingsForm)
      setSettingsFeedback({
        type: 'success',
        message: 'Platform settings, shipping dispatch rules, and payment permissions updated successfully.',
      })
      setSaveFeedback('Platform permissions synchronized.')
    } catch (err: unknown) {
      setSettingsFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update platform settings.',
      })
    } finally {
      setSettingsSaving(false)
    }
  }

  // Reset Platform Settings to Defaults
  const handleResetPlatformSettings = async () => {
    if (!confirm('Are you sure you want to restore all platform settings and permissions to factory defaults?')) return
    setSettingsSaving(true)
    try {
      const restored = await resetSettings()
      setSettingsForm(restored)
      setSettingsFeedback({
        type: 'success',
        message: 'Platform settings restored to laboratory defaults.',
      })
      setSaveFeedback('Platform settings restored to defaults.')
    } catch (err: unknown) {
      setSettingsFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to reset settings.',
      })
    } finally {
      setSettingsSaving(false)
    }
  }

  // Deactivate or activate user account
  const handleToggleUserStatus = async (targetUser: User) => {
    const nextStatus = !targetUser.is_active
    const actionName = nextStatus ? 'activate' : 'deactivate'
    if (!confirm(`Are you sure you want to ${actionName} account for ${targetUser.name || targetUser.email}?`)) return

    try {
      await updateAdminUserStatusApi(targetUser.id, nextStatus)
      setSaveFeedback(`User #${targetUser.id} (${targetUser.email}) successfully ${actionName}d.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  // Toggle user role
  const handleToggleUserRole = async (targetUser: User) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change permission level for ${targetUser.email} to ${nextRole === 'admin' ? 'Master Admin' : 'Member'}?`)) return

    try {
      await updateAdminUserRoleApi(targetUser.id, nextRole)
      setSaveFeedback(`User #${targetUser.id} role updated to ${nextRole}.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user role')
    }
  }

  // Handle Base64 Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProductForm((prev) => ({ ...prev, image_base64: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Save new or edited product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await updateAdminProductApi(editingProduct.id, productForm)
        setSaveFeedback(`Product "${productForm.name}" updated successfully.`)
      } else {
        await createAdminProductApi(productForm)
        setSaveFeedback(`Product "${productForm.name}" added to catalog successfully.`)
      }
      setIsAddModalOpen(false)
      setEditingProduct(null)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save fragrance')
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: number | string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}" from the catalog?`)) return
    try {
      await deleteAdminProductApi(id)
      setSaveFeedback(`Product "${name}" deleted.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  // Quick Stock Save
  const handleQuickStockSave = async (id: number | string) => {
    const newStock = stockEdits[String(id)]
    if (newStock === undefined) return
    try {
      await updateProductStockApi(id, newStock)
      setSaveFeedback(`Stock for product #${id} updated to ${newStock}.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update stock')
    }
  }

  // Quick Price & MRP Save per product
  const handleQuickPriceSave = async (id: number | string) => {
    const newPrice = priceEdits[String(id)]
    const newOrigPrice = origPriceEdits[String(id)]
    const newDeliveryFee = deliveryFeeEdits[String(id)]
    if (newPrice === undefined && newOrigPrice === undefined && newDeliveryFee === undefined) return

    const targetProduct = products.find((p) => String(p.id) === String(id))
    const finalPrice = newPrice !== undefined ? newPrice : (targetProduct?.price ?? 0)
    const finalOrigPrice = newOrigPrice !== undefined ? newOrigPrice : (targetProduct?.original_price ?? finalPrice)
    const finalDeliveryFee = newDeliveryFee !== undefined ? newDeliveryFee : (targetProduct?.delivery_fee ?? 0)

    try {
      await updateProductPriceApi(id, finalPrice, finalOrigPrice, finalDeliveryFee)
      setProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? { ...item, price: finalPrice, original_price: finalOrigPrice, delivery_fee: finalDeliveryFee }
            : item
        )
      )
      setSaveFeedback(`Pricing & delivery fee for "${targetProduct?.name || `#${id}`}" updated.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update product pricing')
    }
  }

  // Quick Delivery Fee Save per product
  const handleQuickDeliveryFeeSave = async (id: number | string) => {
    const newFee = deliveryFeeEdits[String(id)]
    if (newFee === undefined) return
    const targetProduct = products.find((p) => String(p.id) === String(id))
    const curPrice = priceEdits[String(id)] ?? targetProduct?.price ?? 0
    const curOrig = origPriceEdits[String(id)] ?? targetProduct?.original_price ?? curPrice
    try {
      await updateProductPriceApi(id, curPrice, curOrig, newFee)
      setProducts((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? { ...item, delivery_fee: newFee } : item))
      )
      setSaveFeedback(`Delivery fee for "${targetProduct?.name || `#${id}`}" set to ₹${newFee}.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update delivery fee')
    }
  }

  // Update Order Status
  const handleOrderStatusChange = async (orderId: number, newStatus: string, trackingNumber?: string) => {
    if (newStatus === 'Shipped') {
      const order = orders.find((o) => o.id === orderId)
      if (order) {
        openDispatchModal(order)
        return
      }
    }
    try {
      await updateAdminOrderStatusApi(orderId, newStatus, trackingNumber)
      setSaveFeedback(`Order #${orderId} status set to "${newStatus}" & customer notified via email.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status')
    }
  }

  // Open Dispatch Shipment Modal
  const openDispatchModal = (order: Order) => {
    const existingTracking = order.tracking_number || ''
    let initialCourier = settings?.default_courier || 'Blue Dart Express'
    let initialTrackingNumber = existingTracking

    if (existingTracking.includes(' - ')) {
      const parts = existingTracking.split(' - ')
      initialCourier = parts[0]
      initialTrackingNumber = parts.slice(1).join(' - ')
    }

    setDispatchModalOrder(order)
    setDispatchForm({
      courier: initialCourier,
      tracking_number: initialTrackingNumber,
      status: (order.order_status === 'Delivered' ? 'Delivered' : 'Shipped') as 'Shipped' | 'Delivered',
      dispatch_notes: 'Packed securely in protective packaging.',
    })
  }

  // Confirm Dispatch Shipment
  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dispatchModalOrder) return
    if (settings.require_dispatch_tracking && !dispatchForm.tracking_number.trim()) {
      alert('Consignment AWB tracking number is required for dispatch as per platform settings.')
      return
    }

    setDispatchLoading(true)
    const combinedTracking = dispatchForm.tracking_number.trim()
      ? `${dispatchForm.courier} - ${dispatchForm.tracking_number.trim()}`
      : dispatchForm.courier

    try {
      await updateAdminOrderStatusApi(dispatchModalOrder.id, dispatchForm.status, combinedTracking)
      setSaveFeedback(
        `Shipment for Order #${dispatchModalOrder.order_number} marked ${dispatchForm.status}. Client has received delivery tracking notification.`
      )
      setDispatchModalOrder(null)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to dispatch shipment')
    } finally {
      setDispatchLoading(false)
    }
  }

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      subtitle: '',
      price: 4500,
      original_price: 5000,
      delivery_fee: 0,
      stock: 50,
      category: 'Extrait de Parfum',
      fragrance_family: 'Woody',
      concentration: '30% Pure Extrait',
      volume_ml: 50,
      top_notes: '',
      heart_notes: '',
      base_notes: '',
      description: '',
      image_base64: '',
      is_trending: false,
      is_featured: false,
    })
    setIsAddModalOpen(true)
  }

  // Open Edit Product Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      subtitle: product.subtitle || '',
      price: product.price,
      original_price: product.original_price || product.price,
      delivery_fee: product.delivery_fee ?? 0,
      stock: product.stock,
      category: product.category,
      fragrance_family: product.fragrance_family,
      concentration: product.concentration,
      volume_ml: product.volume_ml,
      top_notes: product.top_notes || '',
      heart_notes: product.heart_notes || '',
      base_notes: product.base_notes || '',
      description: product.description || '',
      image_base64: product.image_base64 || '',
      is_trending: Boolean(product.is_trending),
      is_featured: Boolean(product.is_featured),
    })
    setIsAddModalOpen(true)
  }

  // Copy tracking number helper
  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking).then(() => {
      setCopiedTrackingId(tracking)
      setTimeout(() => setCopiedTrackingId(null), 2500)
    })
  }

  // Real-time filtered products
  const filteredProducts = products.filter((p) => {
    if (!productColSearch) return true
    const matchName = !prodFilters.name || (p.name + ' ' + (p.subtitle || '')).toLowerCase().includes(prodFilters.name.toLowerCase().trim())
    const matchFamily = !prodFilters.family || (p.fragrance_family + ' ' + (p.top_notes || '')).toLowerCase().includes(prodFilters.family.toLowerCase().trim())
    const matchPrice = !prodFilters.price || String(p.price).includes(prodFilters.price.trim())
    const matchOrigPrice = !prodFilters.origPrice || String(p.original_price || p.price).includes(prodFilters.origPrice.trim())
    const matchFee = !prodFilters.deliveryFee || String(p.delivery_fee ?? 0).includes(prodFilters.deliveryFee.trim())
    const matchStock = !prodFilters.stock || String(p.stock).includes(prodFilters.stock.trim())
    return matchName && matchFamily && matchPrice && matchOrigPrice && matchFee && matchStock
  })

  // Real-time filtered orders
  const filteredOrders = orders.filter((o) => {
    const s = orderSearch.toLowerCase().trim()
    const globalMatch =
      !s ||
      o.order_number.toLowerCase().includes(s) ||
      o.customer_name.toLowerCase().includes(s) ||
      o.customer_email.toLowerCase().includes(s) ||
      (o.shipping_address || '').toLowerCase().includes(s)

    const statusMatch = orderStatusFilter === 'all' || o.order_status === orderStatusFilter

    if (!orderColSearch) return globalMatch && statusMatch

    const matchNum = !orderFilters.orderNumber || o.order_number.toLowerCase().includes(orderFilters.orderNumber.toLowerCase().trim())
    const matchDate = !orderFilters.date || new Date(o.created_at).toLocaleDateString().includes(orderFilters.date.trim())
    const matchCustomer = !orderFilters.customer || (o.customer_name + ' ' + o.customer_email + ' ' + o.customer_phone).toLowerCase().includes(orderFilters.customer.toLowerCase().trim())
    const matchDest = !orderFilters.destination || (o.shipping_address || '').toLowerCase().includes(orderFilters.destination.toLowerCase().trim())
    const matchSubtotal = !orderFilters.subtotal || String(o.subtotal).includes(orderFilters.subtotal.trim())
    const matchFee = !orderFilters.deliveryFee || String(o.shipping_fee).includes(orderFilters.deliveryFee.trim())
    const matchTotal = !orderFilters.total || String(o.total_amount).includes(orderFilters.total.trim())
    const matchPayment = !orderFilters.payment || o.payment_status.toLowerCase().includes(orderFilters.payment.toLowerCase().trim())
    const matchStatus = !orderFilters.status || o.order_status.toLowerCase().includes(orderFilters.status.toLowerCase().trim())

    return globalMatch && statusMatch && matchNum && matchDate && matchCustomer && matchDest && matchSubtotal && matchFee && matchTotal && matchPayment && matchStatus
  })

  // Real-time filtered users
  const filteredUsers = adminUsers.filter((u) => {
    const s = userSearch.toLowerCase().trim()
    const globalMatch =
      !s ||
      (u.name || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.phone || '').includes(s) ||
      (u.city || '').toLowerCase().includes(s)

    const statusMatch =
      userStatusFilter === 'all'
        ? true
        : userStatusFilter === 'active'
        ? u.is_active !== false
        : u.is_active === false

    if (!userColSearch) return globalMatch && statusMatch

    const matchName = !userFilters.name || (u.name || '').toLowerCase().includes(userFilters.name.toLowerCase().trim())
    const matchEmail = !userFilters.email || (u.email || '').toLowerCase().includes(userFilters.email.toLowerCase().trim())
    const matchPhone = !userFilters.phone || ((u.phone || '') + ' ' + (u.secondary_phone || '')).includes(userFilters.phone.trim())
    const matchLoc = !userFilters.location || ((u.city || '') + ' ' + (u.state || '')).toLowerCase().includes(userFilters.location.toLowerCase().trim())
    const matchDate = !userFilters.date || (u.created_at ? new Date(u.created_at).toLocaleDateString().includes(userFilters.date.trim()) : true)
    const matchRole = !userFilters.role || (u.role || '').toLowerCase().includes(userFilters.role.toLowerCase().trim())
    const matchStat = !userFilters.status || (u.is_active === false ? 'deactivated' : 'active').includes(userFilters.status.toLowerCase().trim())

    return globalMatch && statusMatch && matchName && matchEmail && matchPhone && matchLoc && matchDate && matchRole && matchStat
  })

  // Real-time filtered logs
  const filteredLogs = adminLogs.filter((l) => {
    const catMatch = logCategoryFilter === 'ALL' || l.category === logCategoryFilter
    if (!logColSearch) return catMatch

    const matchDate = !logFilters.date || new Date(l.timestamp).toLocaleDateString().includes(logFilters.date.trim())
    const matchCat = !logFilters.category || l.category.toLowerCase().includes(logFilters.category.toLowerCase().trim())
    const matchAction = !logFilters.action || l.action.toLowerCase().includes(logFilters.action.toLowerCase().trim())
    const matchDetails = !logFilters.details || l.details.toLowerCase().includes(logFilters.details.toLowerCase().trim())
    const matchEmail = !logFilters.email || (l.user_email || '').toLowerCase().includes(logFilters.email.toLowerCase().trim())
    const matchStat = !logFilters.status || l.status.toLowerCase().includes(logFilters.status.toLowerCase().trim())

    return catMatch && matchDate && matchCat && matchAction && matchDetails && matchEmail && matchStat
  })

  if (authLoading || (loading && !products.length && !stats)) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-4xl space-y-6 animate-pulse">
          <div className="h-14 bg-neutral-200/60 rounded-2xl w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-neutral-200/60 rounded-2xl" />
            <div className="h-28 bg-neutral-200/60 rounded-2xl" />
            <div className="h-28 bg-neutral-200/60 rounded-2xl" />
            <div className="h-28 bg-neutral-200/60 rounded-2xl" />
          </div>
          <div className="h-64 bg-neutral-200/60 rounded-2xl w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-black flex flex-col font-sans">
      {/* =========================================================================
          TOP FULL-WIDTH SEGMENTED NAVIGATION BAR (Admin Only, per sketch reference)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs w-full">
        <div className="w-full flex flex-col lg:flex-row items-stretch justify-between">
          
          {/* Brand Identity Slot */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b lg:border-b-0 lg:border-r border-neutral-200 shrink-0 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <span className="font-['Cinzel',serif] font-bold text-sm tracking-wider text-black">
                CHEM BROS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black text-white text-[9px] font-mono tracking-widest uppercase">
                ADMIN CONSOLE
              </span>
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <Link
                to="/"
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[10px] font-mono uppercase tracking-wider"
              >
                Storefront
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-mono uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* All Admin Pages Navigation Options (Divided by vertical lines) */}
          <nav className="flex items-stretch overflow-x-auto divide-x divide-neutral-200 text-xs font-mono uppercase tracking-wider flex-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-black text-white font-semibold shadow-inner'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-5 py-3.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-black text-white font-semibold shadow-inner'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catalog ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-3.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-black text-white font-semibold shadow-inner'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-black text-white font-semibold shadow-inner'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clients ({adminUsers.length})</span>
            </button>



            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-3.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#4a2e70] text-white font-semibold shadow-inner'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings & Permissions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-3.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-black text-white font-semibold shadow-inner'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Utility Navigation Slots (Divided by vertical lines) */}
          <div className="hidden lg:flex items-stretch divide-x divide-neutral-200 border-l border-neutral-200 shrink-0 text-xs font-mono uppercase tracking-wider">
            <Link
              to="/"
              className="px-5 py-3.5 text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Return to Chembros Customer Storefront"
            >
              <span>&larr;</span> Storefront
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-5 py-3.5 text-red-600 hover:text-white hover:bg-red-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-medium"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Top Header Information Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-mono tracking-widest uppercase">
                Laboratory Operations
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Atelier Console · Master Admin Session
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Cinzel',serif] tracking-tight mt-2 text-black">
              Chembros Admin Panel
            </h1>
          </div>
          <div className="text-xs font-mono text-neutral-500">
            Active Workspace: <strong className="text-black uppercase">{activeTab}</strong>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {saveFeedback && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{saveFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveFeedback(null)}
              className="cursor-pointer text-emerald-600 hover:text-emerald-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 1: OVERVIEW & ANALYTICS
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Total Revenue</span>
                  <TrendingUp className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-black">
                  ₹{stats?.total_revenue ? stats.total_revenue.toLocaleString('en-IN') : '0'}
                </div>
                <p className="text-[10px] text-neutral-500 font-mono">Verified Cashfree settlements</p>
              </div>

              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-black">{stats?.total_orders || 0}</div>
                <p className="text-[10px] text-emerald-600 font-mono font-medium">
                  {stats?.paid_orders || 0} Paid & Dispatched
                </p>
              </div>

              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Catalog Products</span>
                  <Package className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-black">{stats?.total_products || products.length}</div>
                <p className="text-[10px] text-neutral-500 font-mono">Active Products</p>
              </div>

              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Low Stock Warnings</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-600">
                  {stats?.low_stock_count || products.filter((p) => p.stock <= 10).length}
                </div>
                <p className="text-[10px] text-neutral-500 font-mono">Low Stock Alerts (Under 10 units)</p>
              </div>
            </div>

            {/* Quick Overview Navigation Banner */}
            <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                  Laboratory Quick Actions & Management
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Access catalog price and delivery fee controls, customer order fulfillment, or update master admin credentials.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 bg-[#4a2e70] text-white hover:bg-[#3b245e] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Platform Permissions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Manage Products
                </button>
              </div>
            </div>

            {/* Recent Orders in Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Cinzel',serif] text-lg font-bold text-black uppercase tracking-wider">
                  Recent Studio Orders
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-neutral-600 hover:text-black font-semibold underline underline-offset-4 cursor-pointer"
                >
                  View All Orders ({orders.length})
                </button>
              </div>

              {orders.slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-black">#{o.order_number}</span>
                      <span className="text-xs text-neutral-500">{o.customer_name}</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(o.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {o.items?.length || 0} items · Subtotal ₹{o.subtotal.toLocaleString('en-IN')} · Delivery ₹{o.shipping_fee} · Total ₹{o.total_amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {o.payment_status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {o.order_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: CATALOG & PRODUCTS TABLE (Design per Image 2)
           ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Toolbar (Image 2 style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2">
              <div>
                <h2 className="text-lg font-bold text-[#3d2757] font-sans flex items-center gap-2">
                  <span>Fragrance Catalog</span>
                  <span className="text-xs px-2 py-0.5 bg-[#f4effc] text-[#4a2e70] rounded-full border border-[#dcd0ee] font-mono">
                    {filteredProducts.length}
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage pricing, delivery fees, fragrance notes, and stock levels.
                </p>
              </div>

              {/* Right Action Buttons Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={loadAllAdminData}
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Refresh Products"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToPdfPrintable(
                      'Products Catalog',
                      ['ID', 'Fragrance', 'Family', 'Price (₹)', 'MRP (₹)', 'Delivery Fee (₹)', 'Stock'],
                      filteredProducts.map((p) => [
                        p.id,
                        `${p.name} (${p.volume_ml}ml)`,
                        p.fragrance_family,
                        `₹${p.price}`,
                        `₹${p.original_price || p.price}`,
                        `₹${p.delivery_fee ?? 0}`,
                        p.stock,
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to PDF</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToCsv(
                      'chembros_products',
                      ['Product ID', 'Name', 'Subtitle', 'Family', 'Price', 'MRP', 'Delivery Fee', 'Stock', 'Volume ML'],
                      filteredProducts.map((p) => [
                        p.id,
                        p.name,
                        p.subtitle || '',
                        p.fragrance_family,
                        p.price,
                        p.original_price || p.price,
                        p.delivery_fee ?? 0,
                        p.stock,
                        p.volume_ml,
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to Excel</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyTableDataToClipboard(
                      ['ID', 'Name', 'Family', 'Price', 'MRP', 'Delivery Fee', 'Stock'],
                      filteredProducts.map((p) => [
                        p.id,
                        p.name,
                        p.fragrance_family,
                        p.price,
                        p.original_price || p.price,
                        p.delivery_fee ?? 0,
                        p.stock,
                      ]),
                      'Products'
                    )
                  }
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Copy Table Data to Clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-4 py-2 bg-[#4a2e70] hover:bg-[#3b245e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fragrance</span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">Column Search</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={productColSearch}
                    onClick={() => setProductColSearch(!productColSearch)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      productColSearch ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        productColSearch ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f4effc] border-b border-[#e2dcee] text-[#3d2757] font-semibold text-xs">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product</th>
                      <th className="py-3 px-4 font-semibold">Fragrance</th>
                      <th className="py-3 px-4 font-semibold">Family / Notes</th>
                      <th className="py-3 px-4 font-semibold">Selling Price (₹)</th>
                      <th className="py-3 px-4 font-semibold">Original MRP (₹)</th>
                      <th className="py-3 px-4 font-semibold">Delivery Fee (₹)</th>
                      <th className="py-3 px-4 font-semibold">Stock</th>
                      <th className="py-3 px-4 font-semibold">Margin</th>
                      <th className="py-3 px-4 font-semibold text-right">Edit</th>
                    </tr>

                    {productColSearch && (
                      <tr className="bg-[#faf8fd] border-b border-neutral-200 text-neutral-700 font-normal">
                        <th className="py-2 px-4"></th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={prodFilters.name}
                              onChange={(e) => setProdFilters({ ...prodFilters, name: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={prodFilters.family}
                              onChange={(e) => setProdFilters({ ...prodFilters, family: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={prodFilters.price}
                              onChange={(e) => setProdFilters({ ...prodFilters, price: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={prodFilters.origPrice}
                              onChange={(e) => setProdFilters({ ...prodFilters, origPrice: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={prodFilters.deliveryFee}
                              onChange={(e) => setProdFilters({ ...prodFilters, deliveryFee: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={prodFilters.stock}
                              onChange={(e) => setProdFilters({ ...prodFilters, stock: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4"></th>
                        <th className="py-2 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setProdFilters({
                                name: '',
                                family: '',
                                price: '',
                                origPrice: '',
                                deliveryFee: '',
                                stock: '',
                                margin: '',
                              })
                            }
                            className="text-[10px] text-neutral-400 hover:text-black font-semibold uppercase"
                          >
                            Reset
                          </button>
                        </th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-neutral-500">
                          No fragrances match the specified criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const curPrice = priceEdits[String(p.id)] !== undefined ? priceEdits[String(p.id)] : p.price
                        const curOrig =
                          origPriceEdits[String(p.id)] !== undefined
                            ? origPriceEdits[String(p.id)]
                            : p.original_price || p.price
                        const curDeliveryFee =
                          deliveryFeeEdits[String(p.id)] !== undefined
                            ? deliveryFeeEdits[String(p.id)]
                            : p.delivery_fee ?? 0

                        const hasPriceChange =
                          (priceEdits[String(p.id)] !== undefined && priceEdits[String(p.id)] !== p.price) ||
                          (origPriceEdits[String(p.id)] !== undefined &&
                            origPriceEdits[String(p.id)] !== (p.original_price || p.price)) ||
                          (deliveryFeeEdits[String(p.id)] !== undefined &&
                            deliveryFeeEdits[String(p.id)] !== (p.delivery_fee ?? 0))

                        const discountPercent =
                          curOrig > curPrice ? Math.round(((curOrig - curPrice) / curOrig) * 100) : 0

                        return (
                          <tr key={p.id} className="hover:bg-[#faf8fd] transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-12 h-14 bg-neutral-100 rounded-lg border border-neutral-200 p-1 flex items-center justify-center overflow-hidden">
                                {p.image_base64 ? (
                                  <img src={p.image_base64} alt={p.name} className="h-full object-contain" />
                                ) : (
                                  <span className="text-[9px] text-neutral-400 font-mono">BOTTLE</span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-['Cinzel',serif] font-bold text-xs text-black">{p.name}</p>
                              <p className="text-[10px] text-neutral-500 uppercase">
                                {p.subtitle || `${p.concentration} // ${p.volume_ml}ml`}
                              </p>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f4effc] text-[#4a2e70] border border-[#e2dcee] mb-1">
                                {p.fragrance_family}
                              </span>
                              <p className="text-[10px] text-neutral-500 truncate">{p.top_notes || p.description}</p>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="text-neutral-500 font-mono text-xs">₹</span>
                                <input
                                  type="number"
                                  value={curPrice}
                                  onChange={(e) =>
                                    setPriceEdits((prev) => ({ ...prev, [String(p.id)]: Number(e.target.value) }))
                                  }
                                  className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold text-black focus:outline-none focus:border-[#4a2e70]"
                                />
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="text-neutral-500 font-mono text-xs">₹</span>
                                <input
                                  type="number"
                                  value={curOrig}
                                  onChange={(e) =>
                                    setOrigPriceEdits((prev) => ({ ...prev, [String(p.id)]: Number(e.target.value) }))
                                  }
                                  className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold text-neutral-700 focus:outline-none focus:border-[#4a2e70]"
                                />
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="text-neutral-500 font-mono text-xs">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={curDeliveryFee}
                                  onChange={(e) =>
                                    setDeliveryFeeEdits((prev) => ({
                                      ...prev,
                                      [String(p.id)]: Math.max(0, Number(e.target.value)),
                                    }))
                                  }
                                  className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold text-black focus:outline-none focus:border-[#4a2e70]"
                                />
                                {deliveryFeeEdits[String(p.id)] !== undefined &&
                                  deliveryFeeEdits[String(p.id)] !== (p.delivery_fee ?? 0) && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickDeliveryFeeSave(p.id)}
                                      className="p-1 bg-[#4a2e70] text-white rounded hover:bg-[#3b245e] cursor-pointer shadow-2xs"
                                      title="Save Delivery Fee"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                  )}
                              </div>
                              <span className="text-[9px] text-neutral-400 block mt-0.5">
                                {curDeliveryFee === 0 ? 'Free Shipping' : 'Fixed Shipping'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  defaultValue={p.stock}
                                  onChange={(e) =>
                                    setStockEdits((prev) => ({ ...prev, [String(p.id)]: Number(e.target.value) }))
                                  }
                                  className={`w-14 px-2 py-1 border rounded text-xs font-semibold focus:outline-none ${
                                    p.stock <= 10
                                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                                      : 'bg-neutral-50 border-neutral-300 text-black'
                                  }`}
                                />
                                {stockEdits[String(p.id)] !== undefined && stockEdits[String(p.id)] !== p.stock && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockSave(p.id)}
                                    className="p-1 bg-black text-white rounded hover:bg-neutral-800 cursor-pointer shadow-2xs"
                                    title="Save Stock"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {discountPercent > 0 ? (
                                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                                  {discountPercent}% OFF
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px]">
                                  Standard
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {hasPriceChange && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickPriceSave(p.id)}
                                    className="px-2.5 py-1 bg-[#4a2e70] hover:bg-[#3b245e] text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Save Pricing & Delivery Fee Changes"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 text-neutral-600 hover:text-[#4a2e70] hover:bg-[#f4effc] rounded transition-colors cursor-pointer"
                                  title="Edit Fragrance Details"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ORDERS & FULFILLMENT TABLE (Design per Image 2)
           ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2">
              <div>
                <h2 className="text-lg font-bold text-[#3d2757] font-sans flex items-center gap-2">
                  <span>Customer Orders & Shipments</span>
                  <span className="text-xs px-2 py-0.5 bg-[#f4effc] text-[#4a2e70] rounded-full border border-[#dcd0ee] font-mono">
                    {filteredOrders.length}
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Inspect client orders, dispatch couriers, and track fulfillment status.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium text-black focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  type="button"
                  onClick={loadAllAdminData}
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Refresh Orders"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToPdfPrintable(
                      'Customer Orders',
                      ['Order #', 'Date', 'Customer', 'Subtotal (₹)', 'Delivery Fee (₹)', 'Total (₹)', 'Payment', 'Status'],
                      filteredOrders.map((o) => [
                        o.order_number,
                        new Date(o.created_at).toLocaleDateString(),
                        `${o.customer_name} (${o.customer_phone})`,
                        `₹${o.subtotal}`,
                        `₹${o.shipping_fee}`,
                        `₹${o.total_amount}`,
                        o.payment_status,
                        o.order_status,
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to PDF</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToCsv(
                      'chembros_orders',
                      ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Phone', 'Address', 'Subtotal', 'Delivery Fee', 'Total', 'Payment Status', 'Order Status', 'Tracking'],
                      filteredOrders.map((o) => [
                        o.order_number,
                        new Date(o.created_at).toISOString(),
                        o.customer_name,
                        o.customer_email,
                        o.customer_phone,
                        o.shipping_address,
                        o.subtotal,
                        o.shipping_fee,
                        o.total_amount,
                        o.payment_status,
                        o.order_status,
                        o.tracking_number || '',
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to Excel</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyTableDataToClipboard(
                      ['Order #', 'Date', 'Customer', 'Total', 'Payment', 'Status'],
                      filteredOrders.map((o) => [
                        o.order_number,
                        new Date(o.created_at).toLocaleDateString(),
                        o.customer_name,
                        o.total_amount,
                        o.payment_status,
                        o.order_status,
                      ]),
                      'Orders'
                    )
                  }
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Copy Orders Data to Clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">Column Search</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={orderColSearch}
                    onClick={() => setOrderColSearch(!orderColSearch)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      orderColSearch ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        orderColSearch ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#f4effc] border-b border-[#e2dcee] text-[#3d2757] font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5 font-bold">Order #</th>
                      <th className="py-4 px-5 font-bold">Date & Time</th>
                      <th className="py-4 px-5 font-bold">Customer Details</th>
                      <th className="py-4 px-5 font-bold">Shipping Address</th>
                      <th className="py-4 px-5 font-bold">Subtotal</th>
                      <th className="py-4 px-5 font-bold">Delivery</th>
                      <th className="py-4 px-5 font-bold">Total</th>
                      <th className="py-4 px-5 font-bold">Payment</th>
                      <th className="py-4 px-5 font-bold">Order Status</th>
                      <th className="py-4 px-5 font-bold text-right">Action</th>
                    </tr>

                    {orderColSearch && (
                      <tr className="bg-[#faf8fd] border-b border-neutral-200 text-neutral-700 font-normal">
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.orderNumber}
                              onChange={(e) => setOrderFilters({ ...orderFilters, orderNumber: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.date}
                              onChange={(e) => setOrderFilters({ ...orderFilters, date: e.target.value })}
                              placeholder="Search date..."
                              className="w-full pl-7 pr-7 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                            <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute right-2 pointer-events-none" />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.customer}
                              onChange={(e) => setOrderFilters({ ...orderFilters, customer: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.destination}
                              onChange={(e) => setOrderFilters({ ...orderFilters, destination: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.subtotal}
                              onChange={(e) => setOrderFilters({ ...orderFilters, subtotal: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.deliveryFee}
                              onChange={(e) => setOrderFilters({ ...orderFilters, deliveryFee: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.total}
                              onChange={(e) => setOrderFilters({ ...orderFilters, total: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.payment}
                              onChange={(e) => setOrderFilters({ ...orderFilters, payment: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={orderFilters.status}
                              onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setOrderFilters({
                                orderNumber: '',
                                date: '',
                                customer: '',
                                destination: '',
                                subtotal: '',
                                deliveryFee: '',
                                total: '',
                                payment: '',
                                status: '',
                              })
                            }
                            className="text-[10px] text-neutral-400 hover:text-black font-semibold uppercase"
                          >
                            Reset
                          </button>
                        </th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-neutral-500">
                          No orders match the specified criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#faf8fd] transition-colors border-b border-neutral-100">
                          <td className="py-4 px-5 font-mono font-bold text-sm text-black whitespace-nowrap">
                            #{o.order_number}
                          </td>
                          <td className="py-4 px-5 text-xs text-neutral-600 whitespace-nowrap">
                            <span className="font-medium text-neutral-800 block">
                              {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-sm text-neutral-900">{o.customer_name}</p>
                            <p className="text-xs text-neutral-500 font-mono">{o.customer_email}</p>
                            <p className="text-xs text-neutral-500 font-mono">{o.customer_phone}</p>
                          </td>
                          <td className="py-4 px-5 max-w-sm text-xs text-neutral-600" title={o.shipping_address}>
                            <p className="line-clamp-2 leading-relaxed">{o.shipping_address}</p>
                          </td>
                          <td className="py-4 px-5 font-mono text-sm text-neutral-700 whitespace-nowrap">
                            ₹{o.subtotal?.toLocaleString('en-IN') ?? 0}
                          </td>
                          <td className="py-4 px-5 font-mono text-xs font-semibold whitespace-nowrap">
                            {o.shipping_fee === 0 ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Free</span>
                            ) : (
                              <span className="text-[#4a2e70]">₹{o.shipping_fee}</span>
                            )}
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-sm text-black whitespace-nowrap">
                            ₹{o.total_amount?.toLocaleString('en-IN') ?? 0}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                                o.payment_status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.payment_status}
                            </span>
                            <span className="block text-[9px] text-neutral-400 font-mono mt-0.5">
                              {(o as any).payment_method || 'Cashfree'}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <select
                                value={o.order_status}
                                onChange={(e) => handleOrderStatusChange(o.id, e.target.value, o.tracking_number)}
                                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer transition-colors"
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => openDispatchModal(o)}
                                className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                                  o.order_status === 'Shipped' || o.tracking_number
                                    ? 'bg-[#4a2e70] text-white hover:bg-[#3b245e]'
                                    : 'bg-black text-white hover:bg-neutral-800'
                                }`}
                                title={o.order_status === 'Shipped' ? 'Update Tracking Details' : 'Dispatch Courier'}
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {o.tracking_number && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                                <span className="truncate max-w-[130px]">{o.tracking_number}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTracking(o.tracking_number!)}
                                  className="text-neutral-400 hover:text-black cursor-pointer"
                                  title="Copy Tracking ID"
                                >
                                  {copiedTrackingId === o.tracking_number ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openDispatchModal(o)}
                              className="p-1.5 text-neutral-600 hover:text-[#4a2e70] hover:bg-[#f4effc] rounded transition-colors cursor-pointer"
                              title="Edit Shipment & Tracking"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: CLIENTS & USERS TABLE (Design per Image 2)
           ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2">
              <div>
                <h2 className="text-lg font-bold text-[#3d2757] font-sans flex items-center gap-2">
                  <span>Customers & User Accounts</span>
                  <span className="text-xs px-2 py-0.5 bg-[#f4effc] text-[#4a2e70] rounded-full border border-[#dcd0ee] font-mono">
                    {filteredUsers.length}
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Registered clients, contact addresses, permission levels, and access controls.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium text-black focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="deactivated">Deactivated Only</option>
                </select>

                <button
                  type="button"
                  onClick={loadAllAdminData}
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Refresh Users"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToPdfPrintable(
                      'Registered Customers',
                      ['ID', 'Name', 'Email', 'Main Phone', 'Secondary Phone', 'City', 'Role', 'Status'],
                      filteredUsers.map((u) => [
                        u.id,
                        u.name || 'Customer',
                        u.email,
                        u.phone || '-',
                        u.secondary_phone || '-',
                        u.city || '-',
                        u.role,
                        u.is_active !== false ? 'Active' : 'Deactivated',
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to PDF</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToCsv(
                      'chembros_clients',
                      ['User ID', 'Name', 'Email', 'Phone', 'Secondary Phone', 'City', 'State', 'Pincode', 'Role', 'Status', 'Registered Date'],
                      filteredUsers.map((u) => [
                        u.id,
                        u.name || '',
                        u.email,
                        u.phone || '',
                        u.secondary_phone || '',
                        u.city || '',
                        u.state || '',
                        u.pincode || '',
                        u.role,
                        u.is_active !== false ? 'Active' : 'Deactivated',
                        u.created_at || '',
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to Excel</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyTableDataToClipboard(
                      ['ID', 'Name', 'Email', 'Phone', 'City', 'Role', 'Status'],
                      filteredUsers.map((u) => [
                        u.id,
                        u.name || 'Client',
                        u.email,
                        u.phone || '-',
                        u.city || '-',
                        u.role,
                        u.is_active !== false ? 'Active' : 'Deactivated',
                      ]),
                      'Clients'
                    )
                  }
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Copy Client Data to Clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">Column Search</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={userColSearch}
                    onClick={() => setUserColSearch(!userColSearch)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      userColSearch ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        userColSearch ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f4effc] border-b border-[#e2dcee] text-[#3d2757] font-semibold text-xs">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Customer</th>
                      <th className="py-3 px-4 font-semibold">Email Address</th>
                      <th className="py-3 px-4 font-semibold">Phone (Main & Alternate)</th>
                      <th className="py-3 px-4 font-semibold">Location / Delivery City</th>
                      <th className="py-3 px-4 font-semibold">Registered At</th>
                      <th className="py-3 px-4 font-semibold">Role</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Edit</th>
                    </tr>

                    {userColSearch && (
                      <tr className="bg-[#faf8fd] border-b border-neutral-200 text-neutral-700 font-normal">
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.name}
                              onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.email}
                              onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.phone}
                              onChange={(e) => setUserFilters({ ...userFilters, phone: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.location}
                              onChange={(e) => setUserFilters({ ...userFilters, location: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.date}
                              onChange={(e) => setUserFilters({ ...userFilters, date: e.target.value })}
                              placeholder="Search date..."
                              className="w-full pl-7 pr-7 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                            <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute right-2 pointer-events-none" />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.role}
                              onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={userFilters.status}
                              onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setUserFilters({
                                name: '',
                                email: '',
                                phone: '',
                                location: '',
                                date: '',
                                role: '',
                                status: '',
                              })
                            }
                            className="text-[10px] text-neutral-400 hover:text-black font-semibold uppercase"
                          >
                            Reset
                          </button>
                        </th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-neutral-500">
                          No registered clients match the specified criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isActive = u.is_active !== false
                        return (
                          <tr key={u.id} className="hover:bg-[#faf8fd] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {u.avatar_url ? (
                                  <img
                                    src={u.avatar_url}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-2xs shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#f4effc] border border-[#e2dcee] flex items-center justify-center font-bold text-[#4a2e70] uppercase font-['Cinzel',serif] text-xs shrink-0">
                                    {u.name ? u.name.charAt(0) : 'C'}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-black text-xs font-['Cinzel',serif]">
                                    {u.name || 'Customer'}
                                  </p>
                                  <span className="text-[10px] text-neutral-400 font-mono">ID #{u.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-neutral-700">{u.email}</td>
                            <td className="py-3 px-4">
                              <p className="font-mono text-xs text-black">{u.phone || '-'}</p>
                              {u.secondary_phone && (
                                <p className="font-mono text-[10px] text-neutral-400">Alt: {u.secondary_phone}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-neutral-600">
                              {u.city ? `${u.city}, ${u.state || 'India'}` : '-'}
                            </td>
                            <td className="py-3 px-4 text-[11px] text-neutral-500 font-mono whitespace-nowrap">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggleUserRole(u)}
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                  u.role === 'admin'
                                    ? 'bg-[#4a2e70] text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                                title="Click to change privilege role"
                              >
                                {u.role === 'admin' ? 'Master Admin' : 'Member'}
                              </button>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isActive
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                              >
                                {isActive ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                                    isActive
                                      ? 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                                      : 'text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={isActive ? 'Deactivate account access' : 'Reactivate account access'}
                                >
                                  {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserRole(u)}
                                  className="p-1.5 text-neutral-600 hover:text-[#4a2e70] hover:bg-[#f4effc] rounded transition-colors cursor-pointer"
                                  title="Edit privileges"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: LABORATORY AUDIT LOGS (Design per Image 2)
           ======================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2">
              <div>
                <h2 className="text-lg font-bold text-[#3d2757] font-sans flex items-center gap-2">
                  <span>Laboratory Activity & Security Logs</span>
                  <span className="text-xs px-2 py-0.5 bg-[#f4effc] text-[#4a2e70] rounded-full border border-[#dcd0ee] font-mono">
                    {filteredLogs.length}
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Chronological trail of administrative actions, catalog updates, and authentication events.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium text-black focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ORDER">Orders</option>
                  <option value="CATALOG">Catalog</option>
                  <option value="AUTH">Authentication</option>
                  <option value="USER">User Controls</option>
                  <option value="SYSTEM">System</option>
                </select>

                <button
                  type="button"
                  onClick={loadAllAdminData}
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToPdfPrintable(
                      'Laboratory Audit Logs',
                      ['Timestamp', 'Category', 'Action', 'Details', 'Initiator', 'Status'],
                      filteredLogs.map((l) => [
                        new Date(l.timestamp).toLocaleString(),
                        l.category,
                        l.action,
                        l.details,
                        l.user_email || 'System',
                        l.status,
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to PDF</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportToCsv(
                      'chembros_audit_logs',
                      ['Log ID', 'Timestamp', 'Category', 'Action', 'Details', 'Initiator Email', 'Status'],
                      filteredLogs.map((l) => [
                        l.id,
                        l.timestamp,
                        l.category,
                        l.action,
                        l.details,
                        l.user_email || '',
                        l.status,
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 border border-[#6b4c9a] text-[#4a2e70] hover:bg-[#f8f5fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6b4c9a]" />
                  <span>Export to Excel</span>
                  <ChevronDown className="w-3 h-3 text-[#6b4c9a]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyTableDataToClipboard(
                      ['Timestamp', 'Category', 'Action', 'Details', 'Initiator', 'Status'],
                      filteredLogs.map((l) => [
                        new Date(l.timestamp).toLocaleString(),
                        l.category,
                        l.action,
                        l.details,
                        l.user_email || 'System',
                        l.status,
                      ]),
                      'Audit Logs'
                    )
                  }
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                  title="Copy Audit Logs to Clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">Column Search</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={logColSearch}
                    onClick={() => setLogColSearch(!logColSearch)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      logColSearch ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        logColSearch ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f4effc] border-b border-[#e2dcee] text-[#3d2757] font-semibold text-xs">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Timestamp</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Action</th>
                      <th className="py-3 px-4 font-semibold">Details Narrative</th>
                      <th className="py-3 px-4 font-semibold">Initiator / Email</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>

                    {logColSearch && (
                      <tr className="bg-[#faf8fd] border-b border-neutral-200 text-neutral-700 font-normal">
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={logFilters.date}
                              onChange={(e) => setLogFilters({ ...logFilters, date: e.target.value })}
                              placeholder="Search date..."
                              className="w-full pl-7 pr-7 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                            <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute right-2 pointer-events-none" />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={logFilters.category}
                              onChange={(e) => setLogFilters({ ...logFilters, category: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={logFilters.action}
                              onChange={(e) => setLogFilters({ ...logFilters, action: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={logFilters.details}
                              onChange={(e) => setLogFilters({ ...logFilters, details: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={logFilters.email}
                              onChange={(e) => setLogFilters({ ...logFilters, email: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                        <th className="py-2 px-4">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={logFilters.status}
                              onChange={(e) => setLogFilters({ ...logFilters, status: e.target.value })}
                              placeholder="Search..."
                              className="w-full pl-7 pr-2 py-1 bg-white border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                            />
                          </div>
                        </th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          No laboratory logs match the specified filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((l) => (
                        <tr key={l.id} className="hover:bg-[#faf8fd] transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                            {new Date(l.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f4effc] text-[#4a2e70] border border-[#e2dcee]">
                              {l.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-black text-xs font-mono">{l.action}</td>
                          <td className="py-3 px-4 max-w-md text-xs text-neutral-700">{l.details}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                            {l.user_email || 'System Dispatcher'}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                                l.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : l.status === 'WARNING'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : l.status === 'ERROR'
                                  ? 'bg-red-50 text-red-800 border border-red-200'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: SETTINGS & PERMISSIONS (Operations & Controls)
           ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header with Title and Save Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold font-['Cinzel',serif] text-black uppercase tracking-wide flex items-center gap-2">
                  <span>Platform Settings & Operational Permissions</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure client payment methods, cart order thresholds, dispatch courier partners, delivery charges, and checkout access.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetPlatformSettings}
                  disabled={settingsSaving}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Reset to factory laboratory defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePlatformSettings()}
                  disabled={settingsSaving}
                  className="px-5 py-2 bg-[#4a2e70] hover:bg-[#3b245e] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {settingsSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Feedback Alert Toast */}
            {settingsFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs border ${
                  settingsFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {settingsFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{settingsFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsFeedback(null)}
                  className="cursor-pointer text-neutral-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSavePlatformSettings} className="space-y-8">
              {/* SECTION 1: PAYMENT METHOD CONTROLS */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#f4effc] border border-[#e2dcee] flex items-center justify-center text-[#4a2e70]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                      1. Payment Method Permissions
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Enable or disable payment options visible to clients at checkout.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Toggle 1: Online Pre-Payment */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black uppercase tracking-wider text-[11px]">
                          Online Pre-Payment (Cashfree PG)
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          UPI / Cards
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Accept instant client payments via UPI (GPay, PhonePe, Paytm), Credit & Debit cards, and NetBanking.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.enable_online_payment}
                      onClick={() =>
                        setSettingsForm({ ...settingsForm, enable_online_payment: !settingsForm.enable_online_payment })
                      }
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settingsForm.enable_online_payment ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settingsForm.enable_online_payment ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Cash on Delivery */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black uppercase tracking-wider text-[11px]">
                          Cash on Delivery (Doorstep Collection)
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                          COD
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Allow customers to place orders without upfront charge and pay cash or UPI directly upon courier delivery.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.enable_cod}
                      onClick={() => setSettingsForm({ ...settingsForm, enable_cod: !settingsForm.enable_cod })}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settingsForm.enable_cod ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settingsForm.enable_cod ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* COD Sub-settings if enabled */}
                  {settingsForm.enable_cod && (
                    <>
                      <div>
                        <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                          COD Handling Surcharge (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settingsForm.cod_handling_fee}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, cod_handling_fee: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Optional handling fee added to COD orders (default ₹0).
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                          COD Maximum Order Limit (₹)
                        </label>
                        <input
                          type="number"
                          min="1000"
                          step="500"
                          value={settingsForm.cod_max_order_limit}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, cod_max_order_limit: Math.max(1000, Number(e.target.value)) })
                          }
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Orders exceeding this amount require online payment (default ₹15,000).
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 2: CART & ORDER VALUE CONTROLS */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#f4effc] border border-[#e2dcee] flex items-center justify-center text-[#4a2e70]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                      2. Cart & Order Value Controls
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Enforce laboratory purchase caps and maximum cart acquisition value.
                    </p>
                  </div>
                </div>

                <div className="max-w-md text-xs">
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Maximum Cart Order Limit (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={settingsForm.max_cart_value || 0}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, max_cart_value: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1.5">
                    Orders with subtotal exceeding this amount cannot be checked out (set to 0 to permit unlimited cart acquisitions).
                  </p>
                </div>
              </div>

              {/* SECTION 3: DELIVERY METHODS & SHIPPING DISPATCH CONTROLS */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#f4effc] border border-[#e2dcee] flex items-center justify-center text-[#4a2e70]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                      3. Delivery Methods & Shipping Controls
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Configure delivery method options, courier partner, default delivery charge, and location-based rates.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Toggle: Enable Delivery Method Selection */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-4 md:col-span-2 lg:col-span-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black uppercase tracking-wider text-[11px]">
                          Enable Delivery Method Selection
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          {settingsForm.enable_delivery_methods !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        When enabled, clients can view and select delivery methods (Standard vs Express Priority). When disabled, only standard delivery is used.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.enable_delivery_methods !== false}
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          enable_delivery_methods: !(settingsForm.enable_delivery_methods !== false),
                        })
                      }
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settingsForm.enable_delivery_methods !== false ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settingsForm.enable_delivery_methods !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Primary Dispatch Courier Partner */}
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Primary Dispatch Courier Partner *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.default_courier}
                      onChange={(e) => setSettingsForm({ ...settingsForm, default_courier: e.target.value })}
                      placeholder="e.g. Blue Dart Express"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-black focus:outline-none focus:border-[#4a2e70]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Official carrier shown on customer checkout, telemetry, and tax invoices.</p>
                  </div>

                  {/* Default Delivery Charge */}
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Default Delivery Charge (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.default_delivery_fee}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, default_delivery_fee: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Base shipping charge applied when order is below complimentary threshold.</p>
                  </div>

                  {/* Estimated Transit Timeline */}
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Estimated Transit Timeline *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.estimated_delivery_days}
                      onChange={(e) => setSettingsForm({ ...settingsForm, estimated_delivery_days: e.target.value })}
                      placeholder="e.g. 2-4 Business Days"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-black focus:outline-none focus:border-[#4a2e70]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Displayed to clients on checkout and confirmation receipts.</p>
                  </div>

                  {/* Toggle: Enable Free Shipping */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-black uppercase tracking-wider text-[11px] block">
                        Complimentary Free Shipping
                      </span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Waive standard shipping fees when subtotal meets threshold.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.enable_free_shipping}
                      onClick={() =>
                        setSettingsForm({ ...settingsForm, enable_free_shipping: !settingsForm.enable_free_shipping })
                      }
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settingsForm.enable_free_shipping ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settingsForm.enable_free_shipping ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Free Shipping Order Minimum */}
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Free Shipping Order Minimum (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={settingsForm.free_shipping_threshold}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, free_shipping_threshold: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Cart orders reaching this amount receive complimentary shipping.</p>
                  </div>

                  {/* Express Priority Air Dispatch Toggle & Fee */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-black uppercase tracking-wider text-[11px] block">
                        Express Priority Air Dispatch
                      </span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Offer optional expedited transit option at checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.enable_express_dispatch}
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          enable_express_dispatch: !settingsForm.enable_express_dispatch,
                        })
                      }
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settingsForm.enable_express_dispatch ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settingsForm.enable_express_dispatch ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Express Dispatch Fee */}
                  {settingsForm.enable_express_dispatch && (
                    <div>
                      <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Express Priority Extra Surcharge (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settingsForm.express_dispatch_fee}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, express_dispatch_fee: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Added to order when customer selects Express Priority Dispatch.</p>
                    </div>
                  )}
                </div>

                {/* Sub-block: Location-Based Delivery Charges */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-black uppercase tracking-wider text-[11px] block">
                        Location-Based Delivery Charges (Regional Shipping Zones)
                      </span>
                      <p className="text-[10px] text-neutral-500">
                        Customize delivery charge variations for specific client destinations and state postal zones.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(settingsForm.location_delivery_rates || DEFAULT_PLATFORM_SETTINGS.location_delivery_rates || []).map((loc, idx) => (
                      <div key={loc.id || idx} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-black uppercase">{loc.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase">Zone {idx + 1}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 line-clamp-1">{loc.states}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs font-semibold text-neutral-600">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={loc.fee}
                            onChange={(e) => {
                              const newFee = Math.max(0, Number(e.target.value))
                              const updatedRates = [
                                ...(settingsForm.location_delivery_rates || DEFAULT_PLATFORM_SETTINGS.location_delivery_rates || []),
                              ]
                              updatedRates[idx] = { ...updatedRates[idx], fee: newFee }
                              setSettingsForm({ ...settingsForm, location_delivery_rates: updatedRates })
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: CHECKOUT FLOW & CLIENT ACCESS (ONLY GUEST CHECKOUT) */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#f4effc] border border-[#e2dcee] flex items-center justify-center text-[#4a2e70]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                      4. Checkout Flow & Client Permissions
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Configure guest checkout access. When disabled, clients must sign in or register before checking out.
                    </p>
                  </div>
                </div>

                <div className="max-w-xl text-xs">
                  {/* Allow Guest Checkout - ONLY OPTION */}
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black uppercase tracking-wider text-xs">
                          Allow Guest Checkout
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            settingsForm.allow_guest_checkout
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {settingsForm.allow_guest_checkout ? 'Guest Access Allowed' : 'Sign-In Required'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                        When disabled, clients must sign in or register before checking out. When enabled, clients may complete orders without creating an account.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.allow_guest_checkout}
                      onClick={() =>
                        setSettingsForm({ ...settingsForm, allow_guest_checkout: !settingsForm.allow_guest_checkout })
                      }
                      className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settingsForm.allow_guest_checkout ? 'bg-[#4a2e70]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                          settingsForm.allow_guest_checkout ? 'translate-x-5.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Primary Save Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-neutral-50 border border-neutral-200 rounded-3xl gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-black">
                    Commit Platform Permissions & Logistics
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Changes take effect across customer checkout, shipping calculations, and order creation immediately.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="px-6 py-3 bg-[#4a2e70] hover:bg-[#3b245e] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  {settingsSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Permissions...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Platform Permissions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 7: FULL-PAGE PROFILE & MASTER SECURITY
           ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-['Cinzel',serif] text-black uppercase tracking-wide">
                Administrator Profile & Master Security Dossier
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Manage your master profile credentials, emergency studio contact lines, and authentication password on this dedicated page.
              </p>
            </div>

            {profileFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs border ${
                  profileFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {profileFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{profileFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileFeedback(null)}
                  className="cursor-pointer text-neutral-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {passwordFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs border ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordFeedback(null)}
                  className="cursor-pointer text-neutral-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form 1: Master Profile Dossier */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#f4effc] border border-[#e2dcee] flex items-center justify-center text-[#4a2e70]">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                      Personal & Studio Information
                    </h3>
                    <p className="text-[11px] text-neutral-500">Public atelier presence and contact details</p>
                  </div>
                </div>

                <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                      Administrator Avatar Portrait
                    </label>
                    <div className="flex items-center gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border-2 border-[#4a2e70] flex items-center justify-center text-white shrink-0">
                        {profileForm.avatar_url ? (
                          <img src={profileForm.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold font-['Cinzel',serif]">
                            {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'A'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={profileForm.avatar_url}
                          onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                          placeholder="https://example.com/admin-avatar.jpg"
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1">Paste HTTPS direct image URL for profile portrait</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Full Legal / Administrator Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Chembros Administrator"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Master Administrator Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
                        className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-600 font-mono cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Master email linked to Supabase authentication</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Main Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Used for courier dispatch OTP</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Secondary Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={profileForm.secondary_phone}
                        onChange={(e) => setProfileForm({ ...profileForm, secondary_phone: e.target.value })}
                        placeholder="9876500000"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Alternate atelier contact</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Studio Headquarters Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.headquarters}
                      onChange={(e) => setProfileForm({ ...profileForm, headquarters: e.target.value })}
                      placeholder="Madurai & Chennai Studio Laboratory"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                    />
                  </div>

                  <div className="p-3 bg-[#f4effc] border border-[#e2dcee] rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#4a2e70]">Master Administrator Clearance</p>
                      <p className="text-[10px] text-neutral-600">Full write permission to catalog, pricing, dispatch, and users</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-[#4a2e70] shrink-0" />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-3 px-4 bg-[#4a2e70] hover:bg-[#3b245e] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {profileSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Dossier...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Form 2: Master Password & Security Controls */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-black uppercase tracking-wide">
                      Master Password & Security
                    </h3>
                    <p className="text-[11px] text-neutral-500">Update master admin authentication credentials</p>
                  </div>
                </div>

                <form onSubmit={handleChangeAdminPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Current Master Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter existing password"
                        className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-black cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      New Master Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-black cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Confirm New Master Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-type new password"
                        className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-black cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2 text-[11px] text-neutral-600">
                    <p className="font-semibold text-black uppercase tracking-wider text-[10px]">Master Security Policy:</p>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Minimum 8 characters length</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Synchronized across Supabase and session store</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Immediately invalidates compromised older tokens</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full py-3 px-4 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Update Master Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 1: SHIPPING DISPATCH & TRACKING
           ======================================================== */}
        {dispatchModalOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-neutral-200 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h3 className="font-['Cinzel',serif] text-lg font-bold text-black uppercase">
                    Dispatch Shipment & Delivery Tracking
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Order #{dispatchModalOrder.order_number} • Total ₹{dispatchModalOrder.total_amount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-neutral-500">
                  <span>Customer:</span>
                  <span className="font-semibold text-black">{dispatchModalOrder.customer_name}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-500">
                  <span>Contact:</span>
                  <span className="font-mono text-black">{dispatchModalOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between items-start text-neutral-500 pt-1 border-t border-neutral-200">
                  <span className="shrink-0 mr-2">Shipping Address:</span>
                  <span className="text-right text-neutral-800 leading-snug">{dispatchModalOrder.shipping_address}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Courier / Delivery Partner *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {[
                      'Blue Dart Express',
                      'Delhivery',
                      'DTDC Express',
                      'India Post Speed',
                      'FedEx Priority',
                      'White-Glove Courier',
                    ].map((courierName) => (
                      <button
                        key={courierName}
                        type="button"
                        onClick={() => setDispatchForm((prev) => ({ ...prev, courier: courierName }))}
                        className={`px-3 py-2 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          dispatchForm.courier === courierName
                            ? 'bg-[#4a2e70] text-white border-[#4a2e70] font-semibold shadow-2xs'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {courierName}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    value={dispatchForm.courier}
                    onChange={(e) => setDispatchForm((prev) => ({ ...prev, courier: e.target.value }))}
                    placeholder="Enter custom carrier"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-[#4a2e70]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Consignment AWB / Tracking Number {settings.require_dispatch_tracking ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    required={settings.require_dispatch_tracking}
                    value={dispatchForm.tracking_number}
                    onChange={(e) => setDispatchForm((prev) => ({ ...prev, tracking_number: e.target.value }))}
                    placeholder="e.g. BD-8921094821 / DEL-7892104"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-[#4a2e70]"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {settings.auto_email_dispatch
                      ? 'This tracking code is automatically dispatched to the client via order notification email.'
                      : 'Tracking code recorded in database.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Fulfillment Status *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDispatchForm((prev) => ({ ...prev, status: 'Shipped' }))}
                      className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        dispatchForm.status === 'Shipped'
                          ? 'bg-[#4a2e70] text-white border-[#4a2e70]'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Shipped (In Transit)
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchForm((prev) => ({ ...prev, status: 'Delivered' }))}
                      className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        dispatchForm.status === 'Delivered'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Delivered to Client
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setDispatchModalOrder(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dispatchLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#4a2e70] hover:bg-[#3b245e] text-white font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {dispatchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Notification...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        <span>Confirm Dispatch</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 2: ADD / EDIT FRAGRANCE (With Delivery Fee Input)
           ======================================================== */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-neutral-200 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h3 className="font-['Cinzel',serif] text-xl font-bold text-black">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="cursor-pointer text-neutral-400 hover:text-black p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Product Image *
                  </label>
                  <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-300">
                    <div className="w-20 h-24 bg-white rounded-xl border border-neutral-200 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      {productForm.image_base64 ? (
                        <img src={productForm.image_base64} alt="Preview" className="max-h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-mono text-center">NO IMAGE</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-neutral-500">
                        Select a JPG, PNG, or WebP image. Will be uploaded and saved to the product catalog.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Molecule J"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Short Description / Tagline
                    </label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      placeholder="MADURAI // 50 ML"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4a2e70] uppercase tracking-wider mb-1">
                      Delivery Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.delivery_fee}
                      onChange={(e) =>
                        setProductForm({ ...productForm, delivery_fee: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full px-3 py-2 bg-[#faf8fd] border border-[#dcd0ee] rounded-xl font-semibold text-[#4a2e70]"
                    />
                    <span className="text-[9px] text-neutral-400 block mt-0.5">0 = Complimentary</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Stock (Units) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Fragrance Family
                    </label>
                    <select
                      value={productForm.fragrance_family}
                      onChange={(e) => setProductForm({ ...productForm, fragrance_family: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                    >
                      <option value="Woody">Woody</option>
                      <option value="Amber / Oriental">Amber / Oriental</option>
                      <option value="Floral">Floral</option>
                      <option value="Fresh / Citrus">Fresh / Citrus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Fragrance Type (e.g. Eau de Parfum)
                    </label>
                    <input
                      type="text"
                      value={productForm.concentration}
                      onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                      placeholder="30% Pure Extrait"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Volume (ML)
                    </label>
                    <input
                      type="number"
                      value={productForm.volume_ml}
                      onChange={(e) => setProductForm({ ...productForm, volume_ml: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Top Notes
                  </label>
                  <input
                    type="text"
                    value={productForm.top_notes}
                    onChange={(e) => setProductForm({ ...productForm, top_notes: e.target.value })}
                    placeholder="Bergamot, Pink Pepper, Saffron"
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Heart / Middle Notes
                  </label>
                  <input
                    type="text"
                    value={productForm.heart_notes}
                    onChange={(e) => setProductForm({ ...productForm, heart_notes: e.target.value })}
                    placeholder="Madurai Sambac Jasmine, Cashmeran, Rose Absolute"
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Base Notes
                  </label>
                  <input
                    type="text"
                    value={productForm.base_notes}
                    onChange={(e) => setProductForm({ ...productForm, base_notes: e.target.value })}
                    placeholder="Virginian Cedarwood, Grey Ambergris, Cetalox"
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter complete product description..."
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div className="flex gap-4 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#4a2e70] hover:bg-[#3b245e] text-white font-semibold uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

    </div>
  )
}
