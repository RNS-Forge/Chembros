import type { Product, Order, User, AdminStats } from '../types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://chembros-server.onrender.com').replace(/\/+$/, '')

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('chembros_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers as Record<string, string>),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return response.json()
}

// ----------------- Auth Endpoints -----------------

export async function loginRequestApi(email: string, password: string): Promise<{ status: string; message: string; email: string }> {
  return request<{ status: string; message: string; email: string }>('/api/auth/login-request', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function verifyLoginOtpApi(email: string, otp_code: string): Promise<{ access_token: string; user: User }> {
  return request<{ access_token: string; user: User }>('/api/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code }),
  })
}

export async function registerRequestApi(data: {
  name: string
  email: string
  password: string
  phone?: string
  shipping_address?: string
  city?: string
  state?: string
  pincode?: string
}): Promise<{ status: string; message: string; email: string }> {
  return request<{ status: string; message: string; email: string }>('/api/auth/register-request', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function verifyRegisterOtpApi(data: {
  name: string
  email: string
  password: string
  phone?: string
  shipping_address?: string
  city?: string
  state?: string
  pincode?: string
  otp_code: string
}): Promise<{ access_token: string; user: User }> {
  return request<{ access_token: string; user: User }>('/api/auth/verify-register-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProfileApi(data: {
  name?: string
  phone?: string
  shipping_address?: string
  city?: string
  state?: string
  pincode?: string
  avatar_url?: string
}): Promise<User> {
  return request<User>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function changePasswordApi(current_password: string, new_password: string): Promise<{ status: string; message: string }> {
  return request<{ status: string; message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  })
}

export async function loginApi(email: string, password: string): Promise<{ access_token: string; user: User }> {
  return request<{ access_token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerApi(data: {
  name: string
  email: string
  password: string
  phone?: string
  shipping_address?: string
  city?: string
  state?: string
  pincode?: string
}): Promise<{ access_token: string; user: User }> {
  return request<{ access_token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function sendOtpApi(email: string): Promise<{ status: string; message: string; dev_code?: string }> {
  return request<{ status: string; message: string; dev_code?: string }>('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyOtpApi(email: string, otp_code: string, name?: string): Promise<{ access_token: string; user: User }> {
  return request<{ access_token: string; user: User }>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code, name }),
  })
}

export async function adminLoginApi(email: string, password: string): Promise<{ access_token: string; user: User }> {
  return loginApi(email, password)
}

export async function getMeApi(): Promise<User> {
  return request<User>('/api/auth/me')
}

// ----------------- Products Endpoints -----------------

export interface ProductQueryParams {
  search?: string
  family?: string
  category?: string
  min_price?: number
  max_price?: number
  sort_by?: string
}

export async function getProductsApi(params: ProductQueryParams = {}): Promise<Product[]> {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.family && params.family !== 'all') query.append('family', params.family)
  if (params.category && params.category !== 'all') query.append('category', params.category)
  if (params.min_price !== undefined) query.append('min_price', params.min_price.toString())
  if (params.max_price !== undefined) query.append('max_price', params.max_price.toString())
  if (params.sort_by) query.append('sort_by', params.sort_by)

  const queryString = query.toString()
  return request<Product[]>(`/api/products${queryString ? `?${queryString}` : ''}`)
}

export async function getTrendingProductsApi(limit: number = 8): Promise<Product[]> {
  return request<Product[]>(`/api/products/trending?limit=${limit}`)
}

export async function getProductDetailApi(productId: number | string): Promise<Product> {
  return request<Product>(`/api/products/${productId}`)
}

export async function getProductRecommendationsApi(productId: number | string, limit: number = 4): Promise<Product[]> {
  return request<Product[]>(`/api/products/${productId}/recommendations?limit=${limit}`)
}

export async function getFilterMetaApi(): Promise<{ families: string[]; categories: string[]; min_price: number; max_price: number }> {
  return request<{ families: string[]; categories: string[]; min_price: number; max_price: number }>('/api/products/filters/meta')
}

// ----------------- Orders Endpoints -----------------

export interface CreateOrderPayload {
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  items: {
    product_id: number | string
    name: string
    price: number
    quantity: number
    volume_ml?: number
  }[]
}

export async function createOrderApi(payload: CreateOrderPayload): Promise<{
  order_number: string
  cashfree_order_id: string
  payment_session_id: string
  total_amount: number
  cf_environment: string
}> {
  return request('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function verifyOrderPaymentApi(order_number: string, cashfree_order_id?: string): Promise<{
  status: string
  message: string
  order_number: string
  total_amount: number
}> {
  return request('/api/orders/verify', {
    method: 'POST',
    body: JSON.stringify({ order_number, cashfree_order_id }),
  })
}

export async function getMyOrdersApi(): Promise<Order[]> {
  return request<Order[]>('/api/orders/my-orders')
}

export async function getOrderByNumberApi(orderNumber: string): Promise<Order> {
  return request<Order>(`/api/orders/${orderNumber}`)
}

// ----------------- Admin Endpoints -----------------

export async function getAdminStatsApi(): Promise<AdminStats> {
  return request<AdminStats>('/api/admin/stats')
}

export async function createAdminProductApi(product: Partial<Product>): Promise<Product> {
  return request<Product>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export async function updateAdminProductApi(productId: number | string, product: Partial<Product>): Promise<Product> {
  return request<Product>(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}

export async function updateProductStockApi(productId: number | string, stock: number): Promise<Product> {
  return request<Product>(`/api/admin/products/${productId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  })
}

export async function updateProductPriceApi(productId: number | string, price: number, original_price?: number): Promise<Product> {
  return request<Product>(`/api/admin/products/${productId}/price`, {
    method: 'PATCH',
    body: JSON.stringify({ price, original_price }),
  })
}

export async function deleteAdminProductApi(productId: number | string): Promise<{ status: string; message: string }> {
  return request(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  })
}

export async function getAdminOrdersApi(statusFilter?: string, search?: string): Promise<Order[]> {
  const query = new URLSearchParams()
  if (statusFilter && statusFilter !== 'all') query.append('status_filter', statusFilter)
  if (search) query.append('search', search)
  const qs = query.toString()
  return request<Order[]>(`/api/admin/orders${qs ? `?${qs}` : ''}`)
}

export async function updateAdminOrderStatusApi(orderId: number, order_status: string, tracking_number?: string): Promise<Order> {
  return request<Order>(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ order_status, tracking_number }),
  })
}
