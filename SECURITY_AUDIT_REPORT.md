# CHEM BROS — Security & Bug Audit Report
**Application:** CHEM BROS E-Commerce (Next.js 15 / Supabase / Cashfree)  
**Audit Date:** 23 November 2026  
**Auditor:** Antigravity AI — Full codebase static analysis  
**Scope:** All API routes, authentication flows, frontend components, environment configuration, and dependency chain  
**Branch Audited:** `test`

---

## Executive Summary

The CHEM BROS platform is a Next.js 15 e-commerce application with Supabase as its database, Cashfree as the payment gateway, and Resend as the email provider. The codebase demonstrates generally sound architecture — webhook signature verification is implemented, bcrypt password hashing is used, and JWTs are properly signed. However, **several critical and high-severity vulnerabilities were identified** that could expose customer PII, allow unauthorized invoice access, enable account takeover, or permit order fraud. This report categorises every finding by severity and provides a precise, actionable remediation for each.

---

## Severity Classification

| Level | Meaning |
|-------|---------|
| 🔴 CRITICAL | Exploitable without authentication; immediate business or data risk |
| 🟠 HIGH | Exploitable with low effort; significant data or financial impact |
| 🟡 MEDIUM | Requires some conditions; notable privacy or integrity risk |
| 🟢 LOW | Defence-in-depth / best practice gaps |
| ℹ️ INFO | Informational; no direct security impact |

---

## Findings Summary

| # | Severity | Title | File |
|---|----------|-------|------|
| 1 | 🔴 CRITICAL | Hardcoded production secrets in source code | `server-config.ts` |
| 2 | 🔴 CRITICAL | `.env` points to stale/wrong Supabase project | `.env` |
| 3 | 🔴 CRITICAL | Unauthenticated order detail endpoint | `orders/[id]/route.ts` |
| 4 | 🔴 CRITICAL | Invoice token bypass accepts any non-empty string | `invoice/route.ts` |
| 5 | 🔴 CRITICAL | Admin password hardcoded in source code | `server-config.ts` |
| 6 | 🟠 HIGH | No rate limiting on OTP or login endpoints | Multiple auth routes |
| 7 | 🟠 HIGH | OTP uses `Math.random()` — not cryptographically secure | `auth-service.ts` |
| 8 | 🟠 HIGH | `send-otp` sends to any email without account existence check | `send-otp/route.ts` |
| 9 | 🟠 HIGH | Unauthenticated public review submission | `products/[id]/reviews/route.ts` |
| 10 | 🟠 HIGH | Order cancellation bypasses ownership on `request_otp` action | `orders/cancel/route.ts` |
| 11 | 🟠 HIGH | JWT stored in localStorage (XSS-accessible) | `AdminPage.tsx`, `AuthContext.tsx` |
| 12 | 🟡 MEDIUM | Client controls shipping fee value | `orders/create/route.ts` |
| 13 | 🟡 MEDIUM | `pending_order` payload fully trusted from client in verify endpoint | `orders/verify/route.ts` |
| 14 | 🟡 MEDIUM | Missing security headers (CSP, X-Frame-Options, etc.) | All API routes |
| 15 | 🟡 MEDIUM | Internal error messages leaked to client in production | Multiple routes |
| 16 | 🟡 MEDIUM | Email webhook fallback unauthenticated | `email-service.ts` |
| 17 | 🟡 MEDIUM | `ADMIN_EMAILS` in `.env` inconsistent with source defaults | `.env`, `server-config.ts` |
| 18 | 🟢 LOW | JWT has no refresh or revocation mechanism (7-day expiry) | `auth-service.ts` |
| 19 | 🟢 LOW | bcrypt cost factor 10 — consider upgrading to 12 | `auth-service.ts` |
| 20 | 🟢 LOW | No HttpOnly / Secure cookie for session token | Architecture |
| 21 | 🟢 LOW | No input length limits on order fields | `orders/create/route.ts` |
| 22 | 🟢 LOW | Duplicate / redundant OTP routes increase attack surface | Auth routes |
| 23 | 🟢 LOW | `nodemailer` imported but unused (dead import) | `email-service.ts` |
| 24 | ℹ️ INFO | `PAYMENT=false` in `.env` disables Cashfree in production env | `.env` |
| 25 | ℹ️ INFO | Dead file `ProductCard.tsx` still in repository | `components/` |

---

## Detailed Findings

---

### 🔴 CRITICAL — Finding 1: Hardcoded Production Secrets in Source Code

**File:** `src/lib/server-config.ts` — Lines 16, 21

```typescript
JWT_SECRET: process.env.JWT_SECRET || '[HARDCODED_FALLBACK_STRING]',
ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'chembros@tech',
```

**Risk:** Any developer or attacker with access to the source repository can forge valid JWTs or authenticate as admin. The fallback values become production values if the environment variables are unset (e.g., after a failed deploy or `.env` misconfiguration). The JWT secret is embedded in the codebase — if the repo is ever made public or leaked, all issued tokens must be treated as compromised.

**Remediation:**
```typescript
JWT_SECRET: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET must be set') })(),
ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? (() => { throw new Error('ADMIN_PASSWORD must be set') })(),
```
Rotate the JWT secret immediately — all existing sessions will be invalidated (this is intended).

---

### 🔴 CRITICAL — Finding 2: `.env` Points to Stale/Wrong Supabase Project

**File:** `.env`

```env
SUPABASE_URL=https://teyaqopguvqwuetpsulq.supabase.co    ← STALE (empty project)
SUPABASE_SECRET_KEY=sb_secret_[STALE_KEY_REDACTED]      ← MISMATCHED KEY
```

The active production project is `exqcjtlmocyxeyamelvf`, but `.env` still points to `teyaqopguvqwuetpsulq`. This was the root cause of the `POST /api/auth/login 401` and `POST /api/auth/verify-register-otp 400` failures. If this `.env` is used in a Vercel/cloud deploy without being overridden, all server-side operations silently fail.

**Remediation:**
```env
SUPABASE_URL=https://exqcjtlmocyxeyamelvf.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://exqcjtlmocyxeyamelvf.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_[ACTIVE_KEY]
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[ACTIVE_KEY]
SUPABASE_SECRET_KEY=sb_secret_[ACTIVE_SERVICE_ROLE_KEY]
SUPABASE_SERVICE_ROLE_KEY=sb_secret_[ACTIVE_SERVICE_ROLE_KEY]
```

---

### 🔴 CRITICAL — Finding 3: Unauthenticated Order Detail Endpoint

**File:** `src/app/api/orders/[id]/route.ts`

```typescript
export async function GET(req, { params }) {
  const { id } = await params
  // ← No authentication check
  return NextResponse.json(formatOrder(order))  // Returns full PII
}
```

**Risk:** Anyone can enumerate all orders by guessing numeric IDs or order numbers (`/api/orders/26`, `/api/orders/27`). The response includes `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `items`, and `total_amount` — full customer PII exposure with zero authentication.

**Remediation:**
```typescript
const currentUser = await getUserFromAuthHeader(req)
const isAdmin = currentUser?.role === 'admin'
const isOwner = currentUser && (
  Number(currentUser.id) === Number(order.user_id) ||
  currentUser.email?.toLowerCase() === order.customer_email?.toLowerCase()
)
if (!isAdmin && !isOwner) {
  return NextResponse.json({ detail: 'Unauthorized' }, { status: 403 })
}
```

---

### 🔴 CRITICAL — Finding 4: Invoice Token Bypass Accepts Any Non-Empty String

**Files:** `src/app/api/orders/invoice/route.ts` · `src/app/api/orders/[id]/invoice/route.ts`

```typescript
const customerToken = searchParams.get('token') || ''
if (!isOwner && !customerToken) {   // ANY non-empty ?token= bypasses auth
  return new Response('Access Denied', { status: 403 })
}
```

**Risk:** Appending `?token=x` to any invoice URL grants full invoice access including customer PII to unauthenticated users. Example exploit: `/api/orders/invoice?order_number=CB-20261116-8362&token=x`

> **Note:** While `getUserFromAuthHeader` now reads a valid JWT from `?token=`, the `customerToken` fallback path is **independent** and still accepts ANY non-empty string. The two paths are separate — the JWT path (`getUserFromAuthHeader`) and the `customerToken` bypass path. The bypass must be removed.

**Remediation:**
```typescript
// Remove the customerToken bypass entirely:
// DELETE: const customerToken = searchParams.get('token') || ''
// CHANGE:
if (!isOwner) {   // Not: if (!isOwner && !customerToken)
  return new Response('Access Denied', { status: 403 })
}
```
After this change, the `?token=<valid_jwt>` path works correctly via `getUserFromAuthHeader`.

---

### 🔴 CRITICAL — Finding 5: Admin Password Hardcoded in Source

**File:** `src/lib/server-config.ts` — Line 21

The fallback password `chembros@tech` is committed to the repository. Combined with the hardcoded admin email defaults in the same file, any person with repository access can authenticate as admin on any deployment that hasn't overridden `ADMIN_PASSWORD` in its environment.

**Remediation:**
1. Remove the fallback — throw if `ADMIN_PASSWORD` is not set (see Finding 1).
2. Change the admin password to a randomly generated strong password (minimum 20 characters with mixed case, numbers, and symbols).
3. Update the password in the `.env` and in the Vercel/deployment environment.

---

### 🟠 HIGH — Finding 6: No Rate Limiting on OTP or Auth Endpoints

**Files:** All routes under `src/app/api/auth/`

None of the authentication endpoints implement rate limiting:
- `POST /api/auth/send-otp` — spammable in a tight loop
- `POST /api/auth/login-request` — no lockout after repeated failures
- `POST /api/auth/verify-register-otp` — 6-digit OTP brute-forceable (1,000,000 possibilities)

**Risk:** Account takeover via OTP brute-force. Email spam via OTP bombing. Resend billing exhaustion. Service degradation.

**Remediation:**
1. Add Upstash Redis or in-memory rate limiting: max 5 OTP requests per IP per 15 minutes.
2. For OTP verification: lock the email after 5 consecutive failed attempts (add `otp_attempts` column).
3. Add a minimum 500ms artificial delay on all auth endpoints.

---

### 🟠 HIGH — Finding 7: OTP Uses `Math.random()` — Not Cryptographically Secure

**File:** `src/lib/auth-service.ts` — Line 36

```typescript
return String(Math.floor(100000 + Math.random() * 900000))
```

`Math.random()` is not a cryptographically secure random number generator. Its output is deterministic and can be predicted if the seed state is known.

**Remediation:**
```typescript
import { randomInt } from 'crypto'

export function generateOtp(): string {
  return String(randomInt(100000, 1000000))
}
```

---

### 🟠 HIGH — Finding 8: `send-otp` Sends to Any Email Without Account Existence Check

**File:** `src/app/api/auth/send-otp/route.ts`

```typescript
export async function POST(req: Request) {
  const email = (body.email || '').trim().toLowerCase()
  // No check if user exists. No rate limit.
  await sendOtpEmail(email, otpCode)  // Sends to ANY email address
}
```

**Risk:** This endpoint can be weaponised to spam any email address in the world using CHEM BROS's Resend sending domain. This can damage the domain's sending reputation, exhaust Resend quota, and get the domain flagged for spam.

**Remediation:**
1. Add an existence check — only send if the email exists in the `users` table.
2. Add rate limiting per IP and per email (max 3 OTPs per hour per email).
3. Validate email format before processing.

---

### 🟠 HIGH — Finding 9: Unauthenticated Public Review Submission

**File:** `src/app/api/products/[id]/reviews/route.ts`

```typescript
export async function POST(req, { params }) {
  // No authentication check
  // Anyone can submit any rating for any product
}
```

**Risk:** Bots or competitors can flood product reviews with fake ratings, directly manipulating the product's `rating` and `reviews_count` in the database.

**Remediation:**
1. Require a valid JWT: add `getUserFromAuthHeader(req)` and return 401 if no user.
2. Optionally verify the user has a completed order containing the reviewed product.
3. Add a `is_verified_purchase` boolean to the reviews schema.

---

### 🟠 HIGH — Finding 10: Order Cancellation Bypasses Ownership on `request_otp` Action

**File:** `src/app/api/orders/cancel/route.ts` — Lines 59

```typescript
if (!isOwner && action !== 'request_otp' && action !== 'verify_otp') {
  return NextResponse.json({ detail: 'Unauthorized' }, { status: 403 })
}
```

**Risk:** When `action === 'request_otp'`, ownership is never checked. Anyone can POST `{"order_id": "CB-20261116-8362", "action": "request_otp"}` to trigger a cancellation OTP email to the real customer — without being logged in or owning the order. This can harass customers or initiate confusion around order cancellation.

**Remediation:** Always enforce ownership for ALL cancel actions:
```typescript
if (!isAdmin) {
  const isOwner = currentUser && (
    (order.user_id && Number(currentUser.id) === Number(order.user_id)) ||
    (currentUser.email && order.customer_email &&
      currentUser.email.toLowerCase() === order.customer_email.toLowerCase())
  )
  if (!isOwner) {
    return NextResponse.json({ detail: 'Unauthorized.' }, { status: 403 })
  }
}
```

---

### 🟠 HIGH — Finding 11: JWT Token Stored in `localStorage` (XSS-Accessible)

**Files:** `src/views/AdminPage.tsx` · `src/context/AuthContext.tsx`

```typescript
localStorage.setItem('chembros_token', token)   // AuthContext
localStorage.getItem('chembros_token')           // AdminPage
```

**Risk:** Any JavaScript on the page — including from an XSS attack or a compromised third-party script — can steal the JWT from `localStorage`. The token provides full admin access for 7 days.

**Remediation:**
1. Set the JWT as an `HttpOnly; Secure; SameSite=Strict` cookie server-side on login.
2. Create a `POST /api/auth/session` endpoint that sets the cookie and clears it on logout.
3. The browser cannot read `HttpOnly` cookies via JavaScript, eliminating XSS token theft.

---

### 🟡 MEDIUM — Finding 12: Client-Controlled Shipping Fee

**File:** `src/app/api/orders/create/route.ts`

```typescript
const shippingFee = body.shipping_fee !== undefined
  ? Number(body.shipping_fee)   // ← Trusted from client
  : settings.default_delivery_fee
```

**Risk:** A technically capable customer can set `shipping_fee: 0` in their POST body to get free shipping on any order regardless of the configured threshold.

**Remediation:** Always calculate server-side; ignore `body.shipping_fee`:
```typescript
const shippingFee = (settings.enable_free_shipping && subtotal >= settings.free_shipping_threshold)
  ? 0
  : settings.default_delivery_fee
```

---

### 🟡 MEDIUM — Finding 13: `pending_order` Payload Fully Trusted from Client

**File:** `src/app/api/orders/verify/route.ts` — Line 70

```typescript
const result = await persistPaidOrder({ ...pendingOrder, order_number })
```

After confirming payment with Cashfree, the server persists the **client-supplied** `pendingOrder` object including items and prices. An attacker could manipulate the POST body to change item prices at verification time.

**Remediation:**
1. Store a server-side pending order record in Supabase when `/api/orders/create` is called (before payment).
2. At `/api/orders/verify`, load the server-stored pending order by `order_number` instead of trusting the client payload.
3. Only the server-validated amounts should ever be persisted.

---

### 🟡 MEDIUM — Finding 14: Missing Security Headers on All Routes

No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Referrer-Policy` headers are configured.

**Remediation:** Add to `next.config.js`:
```javascript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]
```

---

### 🟡 MEDIUM — Finding 15: Internal Error Details Leaked to Client

**Files:** Multiple routes

```typescript
return NextResponse.json({ detail: err.message || 'Internal server error' }, { status: 500 })
```

Supabase errors, stack traces, and internal service messages are returned verbatim. This reveals database schema, column names, and service internals.

**Remediation:**
```typescript
console.error('[Route Error]', err)   // Log internally
return NextResponse.json({ detail: 'An unexpected error occurred. Please try again.' }, { status: 500 })
```

---

### 🟡 MEDIUM — Finding 16: Email Webhook Fallback Has No Authentication

**File:** `src/lib/email-service.ts` — Lines 86–98

```typescript
await fetch(serverConfig.EMAIL_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, subject, html: webhookHtml }),  // Contains OTPs & PII
})
```

If `EMAIL_WEBHOOK_URL` is set, full email content (OTP codes, order PII, customer names) is POST-ed to an external URL with no authentication.

**Remediation:** Add a shared secret header:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Webhook-Secret': process.env.EMAIL_WEBHOOK_SECRET || '',
}
```

---

### 🟡 MEDIUM — Finding 17: `ADMIN_EMAILS` Inconsistency

**Files:** `.env` · `src/lib/server-config.ts`

`.env` contains only: `ADMIN_EMAILS=admin@chembros.com`

But the production admin emails are `connect@thechemicalbrothers.in` and `sanjay.n.ihub@snsgroups.com`. Because `.env` overrides the source defaults, those two addresses **cannot log in as admin** when this `.env` is active.

**Remediation:**
```env
ADMIN_EMAILS=connect@thechemicalbrothers.in,sanjay.n.ihub@snsgroups.com,admin@chembros.com
```

---

### 🟢 LOW — Finding 18: No JWT Refresh or Revocation Mechanism

JWTs are issued with 7-day expiry and no refresh or blocklist. A stolen or compromised token remains valid for up to 7 days even if the user changes their password.

**Remediation:** Add a `token_version` column to `users`. Encode it in the JWT payload and validate it on each request. Increment it on password change to invalidate all existing tokens.

---

### 🟢 LOW — Finding 19: bcrypt Cost Factor 10

```typescript
const salt = await bcrypt.genSalt(10)
```

Cost factor 10 is acceptable for 2024–2026. Consider upgrading to 12 on new password hashes.

**Remediation:** `await bcrypt.genSalt(12)` — existing hashes are unaffected.

---

### 🟢 LOW — Finding 20: No HttpOnly Cookie for Session Token

Covered under Finding 11. JWT in `localStorage` is accessible to JavaScript — migrate to `HttpOnly` cookies.

---

### 🟢 LOW — Finding 21: No Input Length Limits on Order Fields

Order fields accept arbitrary-length strings. A malicious actor could POST a 10MB shipping address.

**Remediation:**
```typescript
if (customer_name.length > 200) return NextResponse.json({ detail: 'Name too long' }, { status: 400 })
if (shipping_address.length > 1000) return NextResponse.json({ detail: 'Address too long' }, { status: 400 })
if (items.length > 50) return NextResponse.json({ detail: 'Too many items' }, { status: 400 })
```

---

### 🟢 LOW — Finding 22: Duplicate / Redundant OTP Routes

- `POST /api/auth/admin-login` → `export { POST } from '../login/route'` (literal re-export, unnecessary)
- `POST /api/auth/verify-otp` → overlaps with `verify-login-otp` and `verify-register-otp`
- `POST /api/auth/send-otp` → overlaps with `login-request` and `register-request`

Multiple entry points for the same functionality increase attack surface and complicate auditing. Consolidate to single canonical endpoints.

---

### 🟢 LOW — Finding 23: Dead Import — `nodemailer`

**File:** `src/lib/email-service.ts` — Line 1

```typescript
import nodemailer from 'nodemailer'
```

`nodemailer` is imported but never used (Resend is the actual email sender). Remove the import and the `nodemailer` package from `dependencies`.

---

### ℹ️ INFO — Finding 24: `PAYMENT=false` in Production `.env`

```env
PAYMENT=false
```

This disables all Cashfree payment verification — orders are created without actual payment confirmation. Appropriate for development; **must not be deployed to production**.

**Remediation:** Remove `PAYMENT=false` from the production `.env`. Set it only in `.env.local` for local development.

---

### ℹ️ INFO — Finding 25: Dead File `ProductCard.tsx`

`src/components/ProductCard.tsx` is no longer imported anywhere.

**Remediation:** `git rm src/components/ProductCard.tsx`

---

## Prioritised Remediation Plan

### Phase 1 — IMMEDIATE (Before Next Production Deploy)

| # | Action | Severity |
|---|--------|----------|
| 1 | Fix `.env` to point to correct Supabase project (`exqcjtlmocyxeyamelvf`) | 🔴 |
| 2 | Remove `PAYMENT=false` from production environment | 🔴 |
| 3 | Fix `ADMIN_EMAILS` in `.env` to include all three admin addresses | 🟡 |
| 4 | Remove `customerToken` bypass from both invoice routes | 🔴 |
| 5 | Add auth check to `GET /api/orders/[id]` | 🔴 |

### Phase 2 — HIGH PRIORITY (Within 1 Week)

| # | Action | Severity |
|---|--------|----------|
| 6 | Add rate limiting to all OTP and auth endpoints | 🟠 |
| 7 | Replace `Math.random()` OTP with `crypto.randomInt()` | 🟠 |
| 8 | Require account existence check in `send-otp` | 🟠 |
| 9 | Add authentication requirement to public review submission | 🟠 |
| 10 | Fix order cancellation `request_otp` ownership bypass | 🟠 |
| 11 | Calculate shipping fee server-side only | 🟡 |

### Phase 3 — MEDIUM PRIORITY (Within 1 Month)

| # | Action | Severity |
|---|--------|----------|
| 12 | Migrate JWT from localStorage to HttpOnly cookies | 🟠 |
| 13 | Remove hardcoded fallback values for JWT_SECRET and ADMIN_PASSWORD | 🔴 |
| 14 | Add security headers via `next.config.js` | 🟡 |
| 15 | Server-side pending order storage for `/verify` endpoint | 🟡 |
| 16 | Add generic error messages in production responses | 🟡 |
| 17 | Add `token_version` JWT revocation mechanism | 🟢 |

### Phase 4 — ONGOING

| # | Action | Severity |
|---|--------|----------|
| 18 | Add input length validation on order fields | 🟢 |
| 19 | Remove dead imports and dead files | 🟢 |
| 20 | Consolidate duplicate OTP routes | 🟢 |
| 21 | Upgrade bcrypt cost factor to 12 | 🟢 |

---

## Positive Security Observations

The following security controls are **correctly implemented** and commended:

| ✅ Control | Location |
|-----------|----------|
| Cashfree webhook HMAC-SHA256 signature verification | `cashfree-service.ts` + `webhook/route.ts` |
| bcrypt password hashing (not plain MD5/SHA) | `auth-service.ts` |
| JWT signed with a secret (not `alg: none`) | `auth-service.ts` |
| OTP invalidated after use (`used: true`) | All OTP verify routes |
| OTP expiry enforced server-side (10 minutes) | All OTP routes |
| Admin role check on all `/api/admin/*` routes | All admin routes |
| Account deactivation check on login | `login/route.ts` |
| Idempotent order creation (no duplicate orders) | `order-service.ts` |
| Payment verified with Cashfree API before order persistence | `verify/route.ts` |
| `supabaseAdmin` (service role) used only server-side | `supabase-admin.ts` |
| `NEXT_PUBLIC_*` prefix only on client-safe variables | Environment config |
| Strong password validation enforced server-side | `auth-service.ts` |
| Webhook timestamp check prevents replay attacks | `webhook/route.ts` |

---

## Appendix: Files Audited

| File | Category |
|------|----------|
| `src/lib/auth-service.ts` | Authentication logic |
| `src/lib/server-config.ts` | Configuration & secrets |
| `src/lib/supabase-admin.ts` | Database client |
| `src/lib/cashfree-service.ts` | Payment gateway |
| `src/lib/email-service.ts` | Email delivery |
| `src/lib/order-service.ts` | Order persistence |
| `src/lib/invoice-generator.ts` | Invoice generation |
| `src/app/api/auth/*` (12 routes) | Authentication API |
| `src/app/api/orders/*` (8 routes) | Order management API |
| `src/app/api/admin/*` (10 routes) | Admin API |
| `src/app/api/products/*` (3 routes) | Product API |
| `src/views/AdminPage.tsx` | Admin frontend |
| `src/context/AuthContext.tsx` | Auth state management |
| `.env` | Environment secrets |
| `package.json` | Dependency manifest |

---

*Report generated by Antigravity AI — Static analysis only. Dynamic/runtime penetration testing is recommended to supplement this report.*
