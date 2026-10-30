export interface Product {
  id: number | string
  slug?: string
  code?: string
  name: string
  subtitle?: string
  price: number
  original_price?: number
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
  created_at?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: number
  email: string
  name?: string
  role: 'user' | 'admin'
  phone?: string
  shipping_address?: string
  city?: string
  state?: string
  pincode?: string
  avatar_url?: string
  is_active?: boolean
  created_at?: string
  orders_count?: number
  total_spent?: number
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
  order_status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
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
