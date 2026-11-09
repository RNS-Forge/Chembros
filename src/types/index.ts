export interface Product {
  id: number | string
  slug?: string
  code?: string
  name: string
  subtitle?: string
  price: number
  original_price?: number
  delivery_fee?: number
  stock: number
  category: string
  fragrance_family: string
  concentration: string
  volume_ml: number
  longevity?: string
  gender?: string
  is_archive?: boolean
  top_notes?: string
  heart_notes?: string
  base_notes?: string
  description?: string
  image_base64?: string
  rating: number
  reviews_count: number
  is_trending: boolean
  is_featured: boolean
  sales_count: number
  sort_order?: number
  created_at?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface UserAddress {
  id: string
  label?: string // e.g. "Home", "Office", "Other"
  full_name: string
  house_no: string // House / Flat No. (Required)
  house_color?: string // House / Building Color (Visual Landmark)
  street: string // Street / Area / Colony (Required)
  landmark?: string // Near Place / Famous Landmark (For easy courier delivery)
  city: string // City / Town (Required)
  district: string // District (Required)
  state: string // State (Required)
  country: string // Country (Required, default "India")
  pincode: string // Postal PIN Code (Required, 6 digits)
  phone: string // Main Phone Number (Required, 10 digits - For delivery OTP & courier)
  secondary_phone?: string // Secondary Phone Number (Optional alternate contact)
  is_default?: boolean
  created_at?: string
}

export interface User {
  id: number
  email: string
  name?: string
  role: 'user' | 'admin'
  phone?: string // Main phone
  secondary_phone?: string // Secondary phone (optional)
  shipping_address?: string
  house_no?: string
  house_color?: string
  landmark?: string
  city?: string
  district?: string
  state?: string
  country?: string
  pincode?: string
  avatar_url?: string
  is_active?: boolean
  created_at?: string
  orders_count?: number
  total_spent?: number
  saved_addresses?: UserAddress[]
}

export interface AdminLogItem {
  id: string
  timestamp: string
  action: string
  category: 'ORDER' | 'AUTH' | 'USER' | 'CATALOG' | 'SYSTEM'
  details: string
  user_email?: string
  status: 'SUCCESS' | 'WARNING' | 'INFO' | 'ERROR'
}

export interface OrderItem {
  product_id: number
  name: string
  subtitle?: string
  price: number
  quantity: number
  volume_ml?: number
  image_base64?: string
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  items: OrderItem[]
  subtotal: number
  shipping_fee: number
  total_amount: number
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  order_status: 'Awaiting Payment' | 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  tracking_number?: string
  created_at: string
}

export interface AdminStats {
  total_revenue: number
  total_orders: number
  paid_orders: number
  total_products: number
  low_stock_count: number
  recent_orders: {
    id: number
    order_number: string
    customer_name: string
    customer_email: string
    total_amount: number
    payment_status: string
    order_status: string
    created_at: string
  }[]
}

export interface CustomerReview {
  id: string | number
  product_id?: number
  product_name?: string
  product_slug?: string
  author?: string
  author_name?: string
  location?: string
  rating: number
  date?: string
  created_at?: string
  title: string
  comment: string
  longevity?: string
  sillage?: string
}

export interface CreateReviewInput {
  author_name: string
  location?: string
  rating: number
  title: string
  comment: string
  longevity?: string
  sillage?: string
}

export interface LocationDeliveryRate {
  id: string
  name: string
  states: string
  fee: number
}

export interface PlatformSettings {
  // 1. Payment Methods Permissions
  enable_online_payment: boolean
  enable_cod: boolean
  enforce_online_only: boolean
  cod_handling_fee: number
  cod_max_order_limit: number

  // 2. Cart Limits
  max_cart_value: number

  // 3. Shipping & Delivery Controls (Admin Configured)
  enable_delivery_methods: boolean
  default_delivery_fee: number
  enable_free_shipping: boolean
  free_shipping_threshold: number
  default_courier: string
  estimated_delivery_days: string
  same_day_dispatch_cutoff: string
  enable_express_dispatch: boolean
  express_dispatch_fee: number
  require_dispatch_tracking: boolean
  auto_email_dispatch: boolean
  location_delivery_rates?: LocationDeliveryRate[]

  // 4. Checkout Flow & Client Permissions
  allow_guest_checkout: boolean
  enable_coupons?: boolean
  allow_client_cancellation?: boolean

  // Storefront & Catalog (Preserved for internal compatibility)
  enable_customer_reviews?: boolean
  allow_guest_reviews?: boolean
  show_stock_scarcity?: boolean
  show_trending_badges?: boolean
  enable_video_stories?: boolean
  maintenance_mode?: boolean
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  // Payment
  enable_online_payment: true,
  enable_cod: false,
  enforce_online_only: true,
  cod_handling_fee: 0,
  cod_max_order_limit: 15000,

  // Cart Limits
  max_cart_value: 50000,

  // Shipping Dispatch
  enable_delivery_methods: false,
  default_delivery_fee: 100,
  enable_free_shipping: true,
  free_shipping_threshold: 1500,
  default_courier: 'Blue Dart Express',
  estimated_delivery_days: '2-4 Business Days',
  same_day_dispatch_cutoff: '02:00 PM IST',
  enable_express_dispatch: false,
  express_dispatch_fee: 100,
  require_dispatch_tracking: true,
  auto_email_dispatch: true,
  location_delivery_rates: [
    { id: 'loc-tn', name: 'Tamil Nadu (Local Zone)', states: 'Tamil Nadu, TN, Pondicherry, PY', fee: 60 },
    { id: 'loc-south', name: 'South India Zone', states: 'Kerala, Karnataka, Andhra Pradesh, Telangana', fee: 80 },
    { id: 'loc-default', name: 'Rest of India (National Standard)', states: 'All Other States', fee: 100 },
  ],

  // Checkout & Accounts
  allow_guest_checkout: true,
  enable_coupons: true,
  allow_client_cancellation: false,

  // Storefront & Catalog
  enable_customer_reviews: true,
  allow_guest_reviews: false,
  show_stock_scarcity: true,
  show_trending_badges: true,
  enable_video_stories: true,
  maintenance_mode: false,
}
