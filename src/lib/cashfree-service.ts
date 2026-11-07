import crypto from 'crypto'
import { serverConfig } from './server-config'

export interface CashfreeOrderParams {
  order_id: string
  order_amount: number
  customer_id: string
  customer_email: string
  customer_phone: string
  customer_name: string
  return_url: string
}

export interface CashfreeOrderResult {
  success: boolean
  data?: {
    payment_session_id: string
    cf_order_id: string
    order_status: string
    mode: string
  }
  error?: string
}

export interface CashfreeVerifyResult {
  isPaid: boolean
  paymentStatus: string
  orderAmount?: number
  currency?: string
  raw?: any
}

export class CashfreeService {
  private get credentials() {
    const appId = (process.env.CASHFREE_APP_ID || serverConfig.CASHFREE_APP_ID || '').trim()
    const secretKey = (process.env.CASHFREE_SECRET_KEY || serverConfig.CASHFREE_SECRET_KEY || '').trim()
    const env = (process.env.CASHFREE_ENV || serverConfig.CASHFREE_ENV || 'PRODUCTION').toUpperCase()
    const apiVersion = serverConfig.CASHFREE_API_VERSION || '2023-08-01'
    const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'

    return { appId, secretKey, env, apiVersion, baseUrl }
  }

  private getHeaders(): Record<string, string> {
    const { appId, secretKey, apiVersion } = this.credentials
    return {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': apiVersion,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
  }

  /**
   * Cryptographically verify Cashfree webhook signature using constant-time comparison
   * Prevents timing attacks and unauthorized webhook forgery.
   */
  verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
    try {
      const { secretKey } = this.credentials
      if (!secretKey || !signature || !timestamp) return false

      const payload = timestamp + rawBody
      const expectedSignature = crypto.createHmac('sha256', secretKey).update(payload).digest('base64')

      const signatureBuffer = Buffer.from(signature)
      const expectedBuffer = Buffer.from(expectedSignature)

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false
      }

      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    } catch (err) {
      console.error('Error verifying Cashfree webhook signature:', err)
      return false
    }
  }

  /**
   * Create an authorized Cashfree order session on the payment gateway
   */
  async createOrder(params: CashfreeOrderParams): Promise<CashfreeOrderResult> {
    const { appId, secretKey, baseUrl, env } = this.credentials

    const isPlaceholder = !appId || !secretKey || appId.includes('TEST_APP_ID') || secretKey.includes('TEST_SECRET')

    // Clean customer data for Cashfree strict formatting
    const cleanCustomerId = (params.customer_id || 'guest_user')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 45)
    
    // Indian standard 10 digit phone number
    const cleanPhone = (params.customer_phone || '')
      .replace(/\D/g, '')
      .slice(-10) || '9999999999'

    const cleanEmail = (params.customer_email || 'concierge@chembros.com').trim().toLowerCase()
    const cleanName = (params.customer_name || 'Valued Chembros Client').trim().slice(0, 100)

    if (!isPlaceholder) {
      try {
        const resolvedFrontendUrl = (
          process.env.FRONTEND_URL ||
          serverConfig.FRONTEND_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.thechemicalbrothers.in')
        ).trim().replace(/\/+$/, '')

        const payload = {
          order_id: params.order_id,
          order_amount: Math.round(params.order_amount * 100) / 100,
          order_currency: 'INR',
          customer_details: {
            customer_id: cleanCustomerId,
            customer_email: cleanEmail,
            customer_phone: cleanPhone,
            customer_name: cleanName,
          },
          order_meta: {
            return_url: params.return_url,
            notify_url: `${resolvedFrontendUrl}/api/orders/webhook`,
          },
        }

        const res = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (res.ok && data.payment_session_id) {
          return {
            success: true,
            data: {
              payment_session_id: data.payment_session_id,
              cf_order_id: String(data.cf_order_id || params.order_id),
              order_status: data.order_status || 'ACTIVE',
              mode: env === 'PRODUCTION' ? 'CASHFREE_PRODUCTION' : 'CASHFREE_SANDBOX',
            },
          }
        }

        console.error('Cashfree order creation API error response:', data)
        return {
          success: false,
          error: data.message || 'Payment gateway refused order initiation.',
        }
      } catch (err: any) {
        console.error('Cashfree gateway network failure:', err)
        return {
          success: false,
          error: err.message || 'Network error reaching Cashfree gateway.',
        }
      }
    }

    // In non-production mode with test keys, allow developer simulation fallback
    if (env !== 'PRODUCTION') {
      const simulatedSession = `session_sim_${params.order_id}`
      return {
        success: true,
        data: {
          payment_session_id: simulatedSession,
          cf_order_id: `cf_${params.order_id}`,
          order_status: 'ACTIVE',
          mode: 'SIMULATED_SANDBOX',
        },
      }
    }

    return {
      success: false,
      error: 'Production Cashfree credentials missing or unconfigured.',
    }
  }

  /**
   * Verify order payment status directly with Cashfree servers
   */
  async verifyPayment(orderId: string): Promise<CashfreeVerifyResult> {
    const { baseUrl, env } = this.credentials

    // Allow simulated tokens only in development / non-production
    if (env !== 'PRODUCTION' && (orderId.startsWith('session_sim_') || orderId.startsWith('sim_'))) {
      return { isPaid: true, paymentStatus: 'PAID' }
    }

    try {
      const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        const status = (data.order_status || '').toUpperCase()
        return {
          isPaid: status === 'PAID',
          paymentStatus: status,
          orderAmount: Number(data.order_amount) || 0,
          currency: data.order_currency || 'INR',
          raw: data,
        }
      }

      const errData = await res.json().catch(() => null)
      console.warn('Cashfree payment verification error response:', errData)
      return {
        isPaid: false,
        paymentStatus: errData?.order_status || 'NOT_FOUND',
        raw: errData,
      }
    } catch (err) {
      console.error('Cashfree payment verification connection exception:', err)
      return { isPaid: false, paymentStatus: 'ERROR' }
    }
  }
}

export const cashfreeService = new CashfreeService()
