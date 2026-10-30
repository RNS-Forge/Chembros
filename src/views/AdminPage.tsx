'use client'
import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import type { Product, Order, AdminStats } from '../types'
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
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  ShieldCheck,
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
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
} from 'lucide-react'

export default function AdminPage() {
  const { user, isAdmin, setIsAuthModalOpen, loginWithPassword, logout } = useAuth()
  const [inlineEmail, setInlineEmail] = useState('')
  const [inlinePassword, setInlinePassword] = useState('')
  const [inlineLoading, setInlineLoading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Product Editing / Creation state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    subtitle: '',
    price: 4500,
    original_price: 5000,
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
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  // Orders filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    loadAllAdminData()
  }, [isAdmin, orderStatusFilter, orderSearch])

  async function loadAllAdminData() {
    setLoading(true)
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        getAdminStatsApi(),
        getProductsApi(),
        getAdminOrdersApi(orderStatusFilter, orderSearch),
      ])
      setStats(statsData)
      setProducts(productsData)
      setOrders(ordersData)
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err)
    } finally {
      setLoading(false)
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
        setSaveFeedback(`Product "${productForm.name}" added to catalog.`)
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

  // Quick Price Save
  const handleQuickPriceSave = async (id: number | string) => {
    const newPrice = priceEdits[String(id)]
    if (newPrice === undefined) return
    try {
      await updateProductPriceApi(id, newPrice)
      setSaveFeedback(`Price for product #${id} updated to ₹${newPrice}.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update price')
    }
  }

  // Update Order Status (triggers customer email via Gmail SMTP!)
  const handleOrderStatusChange = async (orderId: number, newStatus: string, trackingNumber?: string) => {
    try {
      await updateAdminOrderStatusApi(orderId, newStatus, trackingNumber)
      setSaveFeedback(`Order #${orderId} status set to "${newStatus}" & customer notified via email.`)
      loadAllAdminData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status')
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      subtitle: 'EXTRAIT DE PARFUM // 50 ML',
      price: 4800,
      original_price: 5400,
      stock: 40,
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

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setProductForm({
      name: p.name,
      subtitle: p.subtitle || '',
      price: p.price,
      original_price: p.original_price || p.price,
      stock: p.stock,
      category: p.category,
      fragrance_family: p.fragrance_family,
      concentration: p.concentration,
      volume_ml: p.volume_ml,
      top_notes: p.top_notes || '',
      heart_notes: p.heart_notes || '',
      base_notes: p.base_notes || '',
      description: p.description || '',
      image_base64: p.image_base64 || '',
      is_trending: p.is_trending,
      is_featured: p.is_featured,
    })
    setIsAddModalOpen(true)
  }

  const handleInlineAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setInlineLoading(true)
    setInlineError(null)
    try {
      await loginWithPassword(inlineEmail.trim(), inlinePassword)
    } catch (err: unknown) {
      setInlineError(err instanceof Error ? err.message : 'Invalid administrator credentials.')
    } finally {
      setInlineLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center">
        <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
          <NavBar />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md my-8">
          <div className="w-full bg-white border border-neutral-200 rounded-3xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-black border border-neutral-300">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-400">
                CHEM BROS
              </p>
              <h2 className="font-['Cinzel',serif] text-2xl font-bold text-black mt-1">
                Administrator Portal
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your administrative credentials to manage inventory, catalog formulations, and order fulfillment.
              </p>
            </div>

            {inlineError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{inlineError}</span>
              </div>
            )}

            <form onSubmit={handleInlineAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={inlineEmail}
                    onChange={(e) => setInlineEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={inlinePassword}
                    onChange={(e) => setInlinePassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inlineLoading}
                className="w-full py-3.5 px-4 bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {inlineLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Sign In as Administrator
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-4 text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hover:text-black underline underline-offset-4 cursor-pointer"
              >
                Sign In with Email OTP instead
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading && !stats) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs uppercase tracking-widest font-['Inter',sans-serif]">Loading Chembros Control Console...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Top Floating Navigation */}
      <div className="w-full flex justify-center pt-8 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <NavBar />
      </div>

      <main className="w-full max-w-[1576px] px-6 py-8 flex-1">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-black" />
              Administrative Operations Console
            </div>
            <h1 className="text-3xl font-bold font-['Cinzel',serif] text-black mt-1">
              Chembros Control Center
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-xs text-neutral-500">
                Signed in as: <strong className="text-black">{user?.email}</strong>
              </p>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                title="End Administrative Session"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Navigation Tabs & Logout */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-neutral-100 p-1.5 rounded-full border border-neutral-200 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'products' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Catalog & Stocks ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'orders' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Orders & Shipments ({orders.length})
              </button>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Sign Out from Chembros"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveFeedback && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveFeedback}</span>
            </div>
            <button onClick={() => setSaveFeedback(null)} className="cursor-pointer text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Total Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-2xl font-bold font-['Poppins',sans-serif] text-black">
                  ₹{stats?.total_revenue?.toLocaleString('en-IN') || 0}
                </p>
                <p className="text-[11px] text-neutral-500">{stats?.paid_orders || 0} Paid transactions</p>
              </div>

              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Customer Orders</span>
                  <ShoppingBag className="w-4 h-4 text-black" />
                </div>
                <p className="text-2xl font-bold font-['Poppins',sans-serif] text-black">
                  {stats?.total_orders || 0}
                </p>
                <p className="text-[11px] text-neutral-500">Cashfree PG authorized</p>
              </div>

              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Catalog Extraits</span>
                  <Package className="w-4 h-4 text-black" />
                </div>
                <p className="text-2xl font-bold font-['Poppins',sans-serif] text-black">
                  {stats?.total_products || products.length}
                </p>
                <p className="text-[11px] text-neutral-500">Stored in Supabase DB</p>
              </div>

              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Low Stock Warnings</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold font-['Poppins',sans-serif] text-amber-700">
                  {stats?.low_stock_count || 0}
                </p>
                <p className="text-[11px] text-neutral-500">Stock &le; 10 units</p>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Cinzel',serif] text-lg font-bold text-black">
                  Recent Dispatches
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-neutral-600 hover:text-black font-semibold underline underline-offset-4 cursor-pointer"
                >
                  View All Orders
                </button>
              </div>

              <div className="divide-y divide-neutral-200 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-mono font-bold text-black">#{o.order_number}</p>
                      <p className="text-neutral-500 text-[11px]">{o.customer_name} • {o.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-black">₹{o.total_amount.toLocaleString('en-IN')}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                        {o.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & STOCK MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-['Cinzel',serif] text-black">
                  Fragrance Formulations & Stock Controls
                </h2>
                <p className="text-xs text-neutral-500">
                  Update inventory counts, prices in real-time, or decant new flacons into the catalog.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add New Fragrance
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6">Flacon</th>
                      <th className="py-4 px-4">Fragrance</th>
                      <th className="py-4 px-4">Family / Notes</th>
                      <th className="py-4 px-4">Price (₹)</th>
                      <th className="py-4 px-4">Stock Units</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="w-14 h-16 bg-neutral-100 rounded-xl border border-neutral-200 p-1 flex items-center justify-center">
                            {p.image_base64 ? (
                              <img src={p.image_base64} alt={p.name} className="h-full object-contain" />
                            ) : (
                              <span className="text-[9px] text-neutral-400 font-mono">BOTTLE</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-['Cinzel',serif] font-bold text-sm text-black">{p.name}</p>
                          <p className="text-[10px] text-neutral-500 uppercase">{p.subtitle || `${p.concentration} // ${p.volume_ml}ml`}</p>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 mb-1">
                            {p.fragrance_family}
                          </span>
                          <p className="text-[11px] text-neutral-500 truncate">{p.top_notes || p.description}</p>
                        </td>

                        {/* Price Inline Edit */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">₹</span>
                            <input
                              type="number"
                              defaultValue={p.price}
                              onChange={(e) =>
                                setPriceEdits((prev) => ({ ...prev, [String(p.id)]: Number(e.target.value) }))
                              }
                              className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            {priceEdits[String(p.id)] !== undefined && priceEdits[String(p.id)] !== p.price && (
                              <button
                                onClick={() => handleQuickPriceSave(p.id)}
                                className="p-1 bg-black text-white rounded hover:bg-neutral-800 cursor-pointer"
                                title="Save Price"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Stock Inline Edit */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              defaultValue={p.stock}
                              onChange={(e) =>
                                setStockEdits((prev) => ({ ...prev, [String(p.id)]: Number(e.target.value) }))
                              }
                              className={`w-16 px-2 py-1 border rounded text-xs font-semibold focus:outline-none ${
                                p.stock <= 10
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-neutral-50 border-neutral-300 text-black'
                              }`}
                            />
                            {stockEdits[String(p.id)] !== undefined && stockEdits[String(p.id)] !== p.stock && (
                              <button
                                onClick={() => handleQuickStockSave(p.id)}
                                className="p-1 bg-black text-white rounded hover:bg-neutral-800 cursor-pointer"
                                title="Save Stock"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & SHIPMENTS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-['Cinzel',serif] text-black">
                  Customer Orders & Fulfillment
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage statuses. Updating order status automatically emails customer via Gmail SMTP.
                </p>
              </div>

              {/* Status and search filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order or customer..."
                    className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-full text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-full text-xs font-medium text-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="all">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-12 text-center bg-neutral-50 rounded-3xl border border-neutral-200 text-neutral-500 text-xs">
                  No orders match the selected criteria.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-6 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-black">#{o.order_number}</span>
                        <span className="text-xs text-neutral-500 ml-3">
                          {new Date(o.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {o.payment_status} (Cashfree)
                        </span>

                        <select
                          value={o.order_status}
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value, o.tracking_number)}
                          className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Customer</span>
                        <p className="font-semibold text-black mt-0.5">{o.customer_name}</p>
                        <p className="text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          {o.customer_email}
                        </p>
                        <p className="text-neutral-500">{o.customer_phone}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Destination Address</span>
                        <p className="text-neutral-700 mt-0.5 leading-relaxed">{o.shipping_address}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Items Ordered</span>
                        <div className="mt-1 space-y-1">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-neutral-700">
                              <span>{it.name} x {it.quantity}</span>
                              <span className="font-semibold text-black">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-black">
                            <span>Total</span>
                            <span>₹{o.total_amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT FRAGRANCE WITH BASE64 IMAGE UPLOAD */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-neutral-200 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h3 className="font-['Cinzel',serif] text-xl font-bold text-black">
                  {editingProduct ? 'Edit Fragrance Formulation' : 'Decant New Fragrance'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="cursor-pointer text-neutral-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="mt-6 space-y-5 text-xs">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Flacon Artwork (Stored as Base64 in Database) *
                  </label>
                  <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-300">
                    <div className="w-24 h-28 bg-white rounded-xl border border-neutral-200 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      {productForm.image_base64 ? (
                        <img src={productForm.image_base64} alt="Preview" className="max-h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-mono text-center">NO IMAGE</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-full text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-neutral-500">
                        Select any PNG, JPG, or SVG image. It will be encoded to Base64 and stored directly in Supabase DB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Fragrance Name *
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
                      Subtitle / Origin
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
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
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                    >
                      <option value="Woody">Woody</option>
                      <option value="Amber / Oriental">Amber / Oriental</option>
                      <option value="Floral">Floral</option>
                      <option value="Fresh / Citrus">Fresh / Citrus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Concentration
                    </label>
                    <input
                      type="text"
                      value={productForm.concentration}
                      onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                      placeholder="30% Pure Extrait"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
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
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Top Notes (Opening)
                  </label>
                  <input
                    type="text"
                    value={productForm.top_notes}
                    onChange={(e) => setProductForm({ ...productForm, top_notes: e.target.value })}
                    placeholder="Bergamot, Pink Pepper, Saffron"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Heart Notes (Identity)
                  </label>
                  <input
                    type="text"
                    value={productForm.heart_notes}
                    onChange={(e) => setProductForm({ ...productForm, heart_notes: e.target.value })}
                    placeholder="Madurai Sambac Jasmine, Cashmeran, Rose Absolute"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Base Notes (Longevity)
                  </label>
                  <input
                    type="text"
                    value={productForm.base_notes}
                    onChange={(e) => setProductForm({ ...productForm, base_notes: e.target.value })}
                    placeholder="Virginian Cedarwood, Grey Ambergris, Cetalox"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Description & Chemistry Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Artisanal olfactory breakdown..."
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-semibold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                  >
                    {editingProduct ? 'Save Changes' : 'Decant Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
