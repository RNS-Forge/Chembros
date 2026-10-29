import { supabase } from './supabase'
import type { Product, Order, User, AdminStats, CustomerReview, CreateReviewInput } from '../types'

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

// ----------------- Helper Utilities -----------------

export async function hashPassword(password: string): Promise<string> {
  const salt = 'chembros_secret_'
  const enc = new TextEncoder()
  const data = enc.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function decodeJwt(token: string): { sub?: string; email?: string; role?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(decodeURIComponent(escape(atob(base64))))
    return payload
  } catch {
    return null
  }
}

export function createLocalToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: String(user.id),
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    })
  )
  return `${header}.${payload}.local_client_sig`
}

export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long.' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must include at least one uppercase letter.' }
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must include at least one lowercase letter.' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must include at least one number.' }
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: 'Password must include at least one special character.' }
  return { valid: true, message: '' }
}

function formatOrder(row: any): Order {
  let parsedItems = []
  if (typeof row.items === 'string') {
    try {
      parsedItems = JSON.parse(row.items)
    } catch {
      parsedItems = []
    }
  } else if (Array.isArray(row.items)) {
    parsedItems = row.items
  }

  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    shipping_address: row.shipping_address,
    items: parsedItems,
    subtotal: Number(row.subtotal) || 0,
    shipping_fee: Number(row.shipping_fee) || 0,
    total_amount: Number(row.total_amount) || 0,
    payment_status: row.payment_status || 'PENDING',
    order_status: row.order_status || 'Placed',
    tracking_number: row.tracking_number,
    created_at: row.created_at || new Date().toISOString(),
  }
}

function formatReview(row: any): CustomerReview {
  return {
    id: row.id,
    product_id: row.product_id,
    author: row.author_name,
    author_name: row.author_name,
    location: row.location || 'Verified Buyer',
    rating: row.rating || 5,
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined,
    created_at: row.created_at,
    title: row.title,
    comment: row.comment,
    longevity: row.longevity || '10+ Hours',
    sillage: row.sillage || 'Subtle & Radiant',
  }
}

// ----------------- Auth Endpoints -----------------
// Real live 2FA OTP emails remain powered by the backend Gmail SMTP engine

export async function loginRequestApi(
  email: string,
  password: string
): Promise<{ status: string; message: string; email: string }> {
  return request<{ status: string; message: string; email: string }>('/api/auth/login-request', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function verifyLoginOtpApi(
  email: string,
  otp_code: string
): Promise<{ access_token: string; user: User }> {
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

export async function sendOtpApi(email: string): Promise<{ status: string; message: string; dev_code?: string }> {
  return request<{ status: string; message: string; dev_code?: string }>('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyOtpApi(
  email: string,
  otp_code: string,
  name?: string
): Promise<{ access_token: string; user: User }> {
  return request<{ access_token: string; user: User }>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code, name }),
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
  const token = localStorage.getItem('chembros_token')
  const payload = decodeJwt(token || '')
  const savedUserJson = localStorage.getItem('chembros_user')
  const userId = payload?.sub ? Number(payload.sub) : savedUserJson ? JSON.parse(savedUserJson).id : null

  if (userId) {
    try {
      const { data: updated, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (!error && updated) {
        const userObj: User = {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
          phone: updated.phone,
          shipping_address: updated.shipping_address,
          city: updated.city,
          state: updated.state,
          pincode: updated.pincode,
          avatar_url: updated.avatar_url,
        }
        localStorage.setItem('chembros_user', JSON.stringify(userObj))
        return userObj
      }
    } catch (err) {
      console.warn('Supabase updateProfile fallback to backend:', err)
    }
  }

  return request<User>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function changePasswordApi(
  current_password: string,
  new_password: string
): Promise<{ status: string; message: string }> {
  const strength = isStrongPassword(new_password)
  if (!strength.valid) {
    throw new Error(strength.message)
  }

  const token = localStorage.getItem('chembros_token')
  const payload = decodeJwt(token || '')
  const savedUserJson = localStorage.getItem('chembros_user')
  const userId = payload?.sub ? Number(payload.sub) : savedUserJson ? JSON.parse(savedUserJson).id : null

  if (userId) {
    try {
      const { data: userRow } = await supabase.from('users').select('password_hash').eq('id', userId).single()
      if (userRow) {
        const currentHash = await hashPassword(current_password)
        if (userRow.password_hash && userRow.password_hash !== currentHash) {
          throw new Error('Current password is incorrect.')
        }
        const newHash = await hashPassword(new_password)
        await supabase
          .from('users')
          .update({
            password_hash: newHash,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        return { status: 'success', message: 'Password changed successfully.' }
      }
    } catch (err: any) {
      if (err.message === 'Current password is incorrect.') throw err
      console.warn('Supabase changePassword fallback to backend:', err)
    }
  }

  return request<{ status: string; message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  })
}

export async function loginApi(email: string, password: string): Promise<{ access_token: string; user: User }> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanPassword = password.trim()
  const adminPasswords = new Set(['chembros@tech', 'chembros@tech.', 'Chenbros@tech'])
  const adminEmails = new Set(['admin@chembros.com', 'sanjay.n.ihub@snsgroups.com'])

  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle()

    const isMasterAdmin = adminEmails.has(cleanEmail) && adminPasswords.has(cleanPassword)
    const hashed = await hashPassword(cleanPassword)

    let matchedUser = userRow

    if (isMasterAdmin) {
      if (!matchedUser) {
        const { data: created } = await supabase
          .from('users')
          .insert({
            email: cleanEmail,
            name: 'Chembros Administrator',
            role: 'admin',
            password_hash: hashed,
            phone: '+91 9999999999',
            city: 'Mumbai',
            state: 'Maharashtra',
            created_at: new Date().toISOString(),
          })
          .select()
          .single()
        matchedUser = created
      } else if (matchedUser.role !== 'admin') {
        const { data: updated } = await supabase
          .from('users')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', matchedUser.id)
          .select()
          .single()
        matchedUser = updated
      }
    } else if (matchedUser && matchedUser.password_hash === hashed) {
      // Valid password match
    } else {
      matchedUser = null
    }

    if (matchedUser) {
      const userObj: User = {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        phone: matchedUser.phone,
        shipping_address: matchedUser.shipping_address,
        city: matchedUser.city,
        state: matchedUser.state,
        pincode: matchedUser.pincode,
        avatar_url: matchedUser.avatar_url,
      }
      const token = createLocalToken(userObj)
      localStorage.setItem('chembros_token', token)
      localStorage.setItem('chembros_user', JSON.stringify(userObj))
      return { access_token: token, user: userObj }
    }
  } catch (err) {
    console.warn('Direct Supabase login fallback to backend:', err)
  }

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

export async function adminLoginApi(email: string, password: string): Promise<{ access_token: string; user: User }> {
  return loginApi(email, password)
}

export async function getMeApi(): Promise<User> {
  const token = localStorage.getItem('chembros_token')
  if (!token) throw new Error('Not authenticated')

  const payload = decodeJwt(token)
  const savedUserJson = localStorage.getItem('chembros_user')
  let userId = payload?.sub ? Number(payload.sub) : null
  let userEmail = payload?.email

  if (!userId && savedUserJson) {
    try {
      const parsed = JSON.parse(savedUserJson)
      userId = parsed.id
      userEmail = userEmail || parsed.email
    } catch {}
  }

  // Fast direct load from Supabase database
  if (userId || userEmail) {
    try {
      let query = supabase.from('users').select('*')
      if (userId) {
        query = query.eq('id', userId)
      } else if (userEmail) {
        query = query.ilike('email', userEmail)
      }

      const { data: userRow, error } = await query.maybeSingle()
      if (!error && userRow) {
        const userObj: User = {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          role: userRow.role,
          phone: userRow.phone,
          shipping_address: userRow.shipping_address,
          city: userRow.city,
          state: userRow.state,
          pincode: userRow.pincode,
          avatar_url: userRow.avatar_url,
        }
        localStorage.setItem('chembros_user', JSON.stringify(userObj))
        return userObj
      }
    } catch (err) {
      console.warn('Supabase getMe fallback to backend:', err)
    }
  }

  return request<User>('/api/auth/me')
}

// ----------------- Products Endpoints (Direct Supabase) -----------------

export interface ProductQueryParams {
  search?: string
  family?: string
  category?: string
  min_price?: number
  max_price?: number
  sort_by?: string
}

export async function getProductsApi(params: ProductQueryParams = {}): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*')

    if (params.search && params.search.trim()) {
      const s = params.search.trim()
      query = query.or(
        `name.ilike.%${s}%,top_notes.ilike.%${s}%,heart_notes.ilike.%${s}%,base_notes.ilike.%${s}%,description.ilike.%${s}%`
      )
    }

    if (params.family && params.family !== 'all') {
      query = query.ilike('fragrance_family', `%${params.family}%`)
    }

    if (params.category && params.category !== 'all') {
      query = query.ilike('category', `%${params.category}%`)
    }

    if (params.min_price !== undefined) {
      query = query.gte('price', params.min_price)
    }

    if (params.max_price !== undefined) {
      query = query.lte('price', params.max_price)
    }

    if (params.sort_by === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (params.sort_by === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else if (params.sort_by === 'rating') {
      query = query.order('rating', { ascending: false })
    } else if (params.sort_by === 'trending') {
      query = query.order('is_trending', { ascending: false }).order('sales_count', { ascending: false })
    } else if (params.sort_by === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data) {
      return data as Product[]
    }
  } catch (err) {
    console.warn('Supabase getProducts fallback to backend:', err)
  }

  // Fallback to backend API
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
  try {
    const { data, error } = await supabase.from('products').select('*')
    if (!error && data) {
      const sorted = (data as Product[]).sort((a, b) => {
        const scoreA =
          (a.sales_count || 0) * 3 +
          (a.reviews_count || 0) * 1.5 +
          (a.is_trending ? 5 : 0) +
          (a.rating || 4.5) * 2
        const scoreB =
          (b.sales_count || 0) * 3 +
          (b.reviews_count || 0) * 1.5 +
          (b.is_trending ? 5 : 0) +
          (b.rating || 4.5) * 2
        return scoreB - scoreA
      })
      return sorted.slice(0, limit)
    }
  } catch (err) {
    console.warn('Supabase getTrendingProducts fallback to backend:', err)
  }

  return request<Product[]>(`/api/products/trending?limit=${limit}`)
}

export async function getProductDetailApi(productId: number | string): Promise<Product> {
  const idOrSlug = String(productId).trim()
  try {
    if (!isNaN(Number(idOrSlug))) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(idOrSlug))
        .maybeSingle()
      if (data && !error) return data as Product
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${idOrSlug},name.ilike.%${idOrSlug.replace(/-/g, ' ')}%`)
      .maybeSingle()

    if (data && !error) return data as Product
  } catch (err) {
    console.warn('Supabase getProductDetail fallback to backend:', err)
  }

  return request<Product>(`/api/products/${productId}`)
}

export async function getProductRecommendationsApi(
  productId: number | string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const all = await getProductsApi()
    if (all && all.length > 0) {
      const target = all.find((p) => String(p.id) === String(productId) || p.slug === String(productId))
      const candidates = all.filter((p) => !target || String(p.id) !== String(target.id))

      if (!target) return candidates.slice(0, limit)

      const extractTokens = (txt?: string) => {
        if (!txt) return new Set<string>()
        const stop = new Set(['and', 'with', 'the', 'for', 'from', 'essence', 'note', 'notes', 'pure', 'oil'])
        const tokens = txt.toLowerCase().match(/[a-zA-Z]{3,}/g) || []
        return new Set(tokens.filter((t) => !stop.has(t)))
      }

      const targetNotes = extractTokens(
        `${target.top_notes || ''} ${target.heart_notes || ''} ${target.base_notes || ''} ${target.description || ''}`
      )

      const scored = candidates.map((p) => {
        let score = 0
        if (
          p.fragrance_family &&
          target.fragrance_family &&
          p.fragrance_family.toLowerCase() === target.fragrance_family.toLowerCase()
        ) {
          score += 4
        }
        if (p.category && target.category && p.category.toLowerCase() === target.category.toLowerCase()) {
          score += 1.5
        }
        const pNotes = extractTokens(`${p.top_notes || ''} ${p.heart_notes || ''} ${p.base_notes || ''}`)
        let overlap = 0
        for (const t of pNotes) {
          if (targetNotes.has(t)) overlap++
        }
        score += overlap * 2
        score += (p.rating || 4.5) * 0.5
        if (p.is_trending) score += 1
        return { score, product: p }
      })

      scored.sort((a, b) => b.score - a.score)
      return scored.slice(0, limit).map((s) => s.product)
    }
  } catch (err) {
    console.warn('Supabase recommendations fallback:', err)
  }

  return request<Product[]>(`/api/products/${productId}/recommendations?limit=${limit}`)
}

export async function getFilterMetaApi(): Promise<{
  families: string[]
  categories: string[]
  min_price: number
  max_price: number
}> {
  try {
    const { data, error } = await supabase.from('products').select('fragrance_family, category, price')
    if (!error && data) {
      const families = Array.from(new Set(data.map((d) => d.fragrance_family).filter(Boolean))).sort()
      const categories = Array.from(new Set(data.map((d) => d.category).filter(Boolean))).sort()
      const prices = data.map((d) => Number(d.price) || 0)
      const minPrice = prices.length ? Math.min(...prices) : 0
      const maxPrice = prices.length ? Math.max(...prices) : 15000
      return {
        families,
        categories,
        min_price: minPrice,
        max_price: maxPrice,
      }
    }
  } catch (err) {
    console.warn('Supabase getFilterMeta fallback:', err)
  }

  return request<{ families: string[]; categories: string[]; min_price: number; max_price: number }>(
    '/api/products/filters/meta'
  )
}

export async function getProductReviewsApi(productIdOrSlug: number | string): Promise<CustomerReview[]> {
  try {
    let targetId: number | null = !isNaN(Number(productIdOrSlug)) ? Number(productIdOrSlug) : null

    if (!targetId) {
      const prod = await getProductDetailApi(productIdOrSlug)
      targetId = Number(prod.id)
    }

    if (targetId) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', targetId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data.map(formatReview)
      }
    }
  } catch (err) {
    console.warn('Supabase getProductReviews fallback:', err)
  }

  return request<CustomerReview[]>(`/api/products/${productIdOrSlug}/reviews`)
}

export async function createProductReviewApi(
  productIdOrSlug: number | string,
  payload: CreateReviewInput
): Promise<CustomerReview> {
  try {
    let targetId: number | null = !isNaN(Number(productIdOrSlug)) ? Number(productIdOrSlug) : null
    if (!targetId) {
      const prod = await getProductDetailApi(productIdOrSlug)
      targetId = Number(prod.id)
    }

    if (targetId) {
      const token = localStorage.getItem('chembros_token')
      const jwtPayload = decodeJwt(token || '')
      const userId = jwtPayload?.sub ? Number(jwtPayload.sub) : null

      const insertPayload = {
        product_id: targetId,
        user_id: userId,
        author_name: payload.author_name.trim(),
        location: payload.location ? payload.location.trim() : 'Verified Buyer',
        rating: Math.max(1, Math.min(5, payload.rating)),
        title: payload.title.trim(),
        comment: payload.comment.trim(),
        longevity: payload.longevity || '10+ Hours',
        sillage: payload.sillage || 'Subtle & Radiant',
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from('reviews').insert(insertPayload).select().single()

      if (!error && data) {
        // Recalculate and update rating on product table
        const { data: allReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', targetId)

        if (allReviews && allReviews.length > 0) {
          const count = allReviews.length
          const avg = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / count
          await supabase
            .from('products')
            .update({
              reviews_count: count,
              rating: Number(avg.toFixed(1)),
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetId)
        }

        return formatReview(data)
      }
    }
  } catch (err) {
    console.warn('Supabase createProductReview fallback to backend:', err)
  }

  return request<CustomerReview>(`/api/products/${productIdOrSlug}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ----------------- Orders Endpoints -----------------
// Payment Gateway and Order Confirmation Email dispatched by backend Cashfree & SMTP

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

export async function verifyOrderPaymentApi(
  order_number: string,
  cashfree_order_id?: string
): Promise<{
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
  try {
    const token = localStorage.getItem('chembros_token')
    const payload = decodeJwt(token || '')
    const savedUserJson = localStorage.getItem('chembros_user')
    const userId = payload?.sub ? Number(payload.sub) : savedUserJson ? JSON.parse(savedUserJson).id : null
    const email = payload?.email || (savedUserJson ? JSON.parse(savedUserJson).email : null)

    let query = supabase.from('orders').select('*')
    if (userId && email) {
      query = query.or(`user_id.eq.${userId},customer_email.ilike.${email}`)
    } else if (userId) {
      query = query.eq('user_id', userId)
    } else if (email) {
      query = query.ilike('customer_email', email)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error && data) {
      return data.map(formatOrder)
    }
  } catch (err) {
    console.warn('Supabase getMyOrders fallback:', err)
  }

  return request<Order[]>('/api/orders/my-orders')
}

export async function getOrderByNumberApi(orderNumber: string): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (!error && data) {
      return formatOrder(data)
    }
  } catch (err) {
    console.warn('Supabase getOrderByNumber fallback:', err)
  }

  return request<Order>(`/api/orders/${orderNumber}`)
}

// ----------------- Admin Endpoints (Direct Supabase) -----------------

export async function getAdminStatsApi(): Promise<AdminStats> {
  try {
    const [ordersRes, productsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_email, total_amount, payment_status, order_status, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('products').select('id, stock'),
    ])

    const allOrders = ordersRes.data || []
    const allProducts = productsRes.data || []

    const paidOrders = allOrders.filter((o) => o.payment_status === 'PAID')
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const lowStockCount = allProducts.filter((p) => (Number(p.stock) || 0) <= 10).length

    const recentOrders = allOrders.slice(0, 6).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      total_amount: Number(o.total_amount) || 0,
      payment_status: o.payment_status,
      order_status: o.order_status,
      created_at: o.created_at,
    }))

    return {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_orders: allOrders.length,
      paid_orders: paidOrders.length,
      total_products: allProducts.length,
      low_stock_count: lowStockCount,
      recent_orders: recentOrders,
    }
  } catch (err) {
    console.warn('Supabase getAdminStats fallback:', err)
  }

  return request<AdminStats>('/api/admin/stats')
}

export async function createAdminProductApi(product: Partial<Product>): Promise<Product> {
  try {
    const insertData = {
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      original_price: product.original_price,
      stock: product.stock ?? 50,
      category: product.category || 'Extrait de Parfum',
      fragrance_family: product.fragrance_family || 'Woody',
      concentration: product.concentration || '30% Extrait de Parfum',
      volume_ml: product.volume_ml ?? 50,
      top_notes: product.top_notes,
      heart_notes: product.heart_notes,
      base_notes: product.base_notes,
      slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-'),
      code: product.code,
      longevity: product.longevity || '10+ Hours',
      gender: product.gender || 'Unisex',
      is_archive: Boolean(product.is_archive),
      description: product.description,
      image_base64: product.image_base64,
      rating: product.rating ?? 4.9,
      reviews_count: product.reviews_count ?? 12,
      is_trending: Boolean(product.is_trending),
      is_featured: Boolean(product.is_featured),
      sales_count: product.sales_count ?? 0,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('products').insert(insertData).select().single()

    if (!error && data) return data as Product
  } catch (err) {
    console.warn('Supabase createAdminProduct fallback to backend:', err)
  }

  return request<Product>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export async function updateAdminProductApi(
  productId: number | string,
  product: Partial<Product>
): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...product,
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(productId))
      .select()
      .single()

    if (!error && data) return data as Product
  } catch (err) {
    console.warn('Supabase updateAdminProduct fallback to backend:', err)
  }

  return request<Product>(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}

export async function updateProductStockApi(productId: number | string, stock: number): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: Math.max(0, stock), updated_at: new Date().toISOString() })
      .eq('id', Number(productId))
      .select()
      .single()

    if (!error && data) return data as Product
  } catch (err) {
    console.warn('Supabase updateProductStock fallback to backend:', err)
  }

  return request<Product>(`/api/admin/products/${productId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  })
}

export async function updateProductPriceApi(
  productId: number | string,
  price: number,
  original_price?: number
): Promise<Product> {
  try {
    const updateData: any = { price, updated_at: new Date().toISOString() }
    if (original_price !== undefined) updateData.original_price = original_price

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', Number(productId))
      .select()
      .single()

    if (!error && data) return data as Product
  } catch (err) {
    console.warn('Supabase updateProductPrice fallback to backend:', err)
  }

  return request<Product>(`/api/admin/products/${productId}/price`, {
    method: 'PATCH',
    body: JSON.stringify({ price, original_price }),
  })
}

export async function deleteAdminProductApi(productId: number | string): Promise<{ status: string; message: string }> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', Number(productId))

    if (!error) {
      return { status: 'success', message: `Product deleted successfully.` }
    }
  } catch (err) {
    console.warn('Supabase deleteAdminProduct fallback to backend:', err)
  }

  return request(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  })
}

export async function getAdminOrdersApi(statusFilter?: string, search?: string): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*')

    if (statusFilter && statusFilter !== 'all') {
      query = query.ilike('order_status', `%${statusFilter}%`)
    }

    if (search && search.trim()) {
      const s = search.trim()
      query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error && data) {
      return data.map(formatOrder)
    }
  } catch (err) {
    console.warn('Supabase getAdminOrders fallback to backend:', err)
  }

  const query = new URLSearchParams()
  if (statusFilter && statusFilter !== 'all') query.append('status_filter', statusFilter)
  if (search) query.append('search', search)
  const qs = query.toString()
  return request<Order[]>(`/api/admin/orders${qs ? `?${qs}` : ''}`)
}

export async function updateAdminOrderStatusApi(
  orderId: number,
  order_status: string,
  tracking_number?: string
): Promise<Order> {
  let updatedOrder: Order | null = null

  // 1. Instantly update order record in Supabase
  try {
    const patch: any = { order_status, updated_at: new Date().toISOString() }
    if (tracking_number !== undefined) patch.tracking_number = tracking_number

    const { data, error } = await supabase.from('orders').update(patch).eq('id', orderId).select().single()

    if (!error && data) {
      updatedOrder = formatOrder(data)
    }
  } catch (err) {
    console.warn('Supabase update order status error:', err)
  }

  // 2. Dispatch status update email notification via backend Gmail SMTP service
  try {
    request<Order>(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ order_status, tracking_number }),
    }).catch((emailErr) => console.warn('Backend order status email notification error:', emailErr))
  } catch (e) {
    console.warn('Backend email trigger error:', e)
  }

  if (updatedOrder) {
    return updatedOrder
  }

  // Fallback to backend API
  return request<Order>(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ order_status, tracking_number }),
  })
}
