export const serverConfig = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://exqcjtlmocyxeyamelvf.supabase.co',
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '',
  SUPABASE_PUBLISHABLE_KEY:
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
  SMTP_FROM: process.env.SMTP_FROM || '',

  JWT_SECRET: process.env.JWT_SECRET || 'chembros_secret_key_haute_parfumerie_2026_jwt_token_secure_98471',
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || 'connect@thechemicalbrothers.in,sanjay.n.ihub@snsgroups.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'chembros@tech',

  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || '',
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || '',
  CASHFREE_ENV: (process.env.CASHFREE_ENV || process.env.NEXT_PUBLIC_CASHFREE_ENV || 'PRODUCTION').toUpperCase(),
  CASHFREE_API_VERSION: '2023-08-01',
  PAYMENT: (process.env.PAYMENT ?? process.env.payment ?? process.env['[ayment'] ?? process.env.NEXT_PUBLIC_PAYMENT ?? '').trim(),

  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM: process.env.RESEND_FROM || 'Chembros <onboarding@resend.dev>',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  EMAIL_WEBHOOK_URL: process.env.EMAIL_WEBHOOK_URL || '',

  FRONTEND_URL: (
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ).trim().replace(/\/+$/, ''),
}

/**
 * Checks whether Cashfree / online payment is enabled based on environment variables.
 *
 * Rules:
 * - If PAYMENT (or variations) is not defined in env: returns true (Cashfree works by default).
 * - If PAYMENT is set to 'true' (or 1): returns true (Cashfree works).
 * - If PAYMENT is set to 'false' (or 0/disabled/off): returns false (Cashfree does not work).
 */
export function isPaymentGatewayEnabled(): boolean {
  const raw = (
    process.env.PAYMENT ??
    process.env.payment ??
    process.env['[ayment'] ??
    process.env.NEXT_PUBLIC_PAYMENT ??
    serverConfig.PAYMENT ??
    ''
  ).trim().toLowerCase()

  // If the variable is not set in env or empty, it should work cash free (default true)
  if (!raw) {
    return true
  }

  // When false, payment/cashfree does not work
  if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off' || raw === 'disabled') {
    return false
  }

  // Otherwise truthy (e.g. 'true', '1') -> works
  return true
}
