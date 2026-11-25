# CHEM BROS — Security & Bug Audit Report
**Application:** CHEM BROS E-Commerce (Next.js 15 / Supabase / Cashfree)  
**Initial Audit Date:** 23 November 2026  
**Last Re-Audit & Verification:** 25 November 2026  
**Auditor:** Antigravity AI — Full codebase static analysis  
**Scope:** All API routes, authentication flows, order/payment lifecycle, frontend components, and configuration  
**Branch Audited:** `test` (post-merge with `main`)

---

## Executive Summary

Following the initial security audit on 23 November 2026, all **Critical** code-level vulnerabilities and all critical **Order & Payment Flow** loopholes (including the UPI webhook persistence gap, client-trusted pricing/shipping, unauthenticated admin stats, invoice token bypass, sequential order enumeration, and HTML invoice XSS) have been **remediated and verified** (`npx tsc --noEmit` passes with 0 errors).

A small set of defence-in-depth items (IP-wide rate limiting / OTP attempt lockouts, migrating JWT storage from `localStorage` to `HttpOnly` cookies, and JWT revocation via `token_version`) remain open as medium/ongoing hardening items, and local `.env` settings on `test` remain intentionally scoped for testing until promotion to `main`.

---

## Status Classification

| Status | Meaning |
|--------|---------|
| ✅ **FIXED** | Implemented in code and verified in the current codebase |
| ⚠️ **PARTIAL** | Partially mitigated; further hardening recommended |
| 🟡 **OPEN** | Deferred / architectural improvement remaining |
| 🧪 **ENV / TEST** | Intentional test-branch `.env` setting; must be configured in production |

---

## Findings & Remediation Status Summary

| # | Severity | Title | Status | File(s) |
|---|----------|-------|--------|---------|
| 1 | 🔴 CRITICAL | Hardcoded `JWT_SECRET` fallback in source | ✅ **FIXED** | `server-config.ts`, `auth-service.ts` |
| 2 | 🔴 CRITICAL | `.env` points to test Supabase project (`teyaqopguvqwuetpsulq`) | 🧪 **ENV / TEST** | `.env` (use production keys on Vercel/`main`) |
| 3 | 🔴 CRITICAL | Unauthenticated order detail & numeric ID enumeration | ✅ **FIXED** | `orders/[id]/route.ts` |
| 4 | 🔴 CRITICAL | Invoice `?token=` bypass accepting any non-empty string | ✅ **FIXED** | `orders/invoice/route.ts`, `orders/[id]/invoice/route.ts` |
| 5 | 🔴 CRITICAL | Hardcoded `ADMIN_PASSWORD` fallback in source | ✅ **FIXED** | `server-config.ts` |
| 6 | 🔴 CRITICAL | UPI/mobile payment lost if customer skips `/verify` redirect | ✅ **FIXED** | `order-service.ts`, `create/route.ts`, `verify/route.ts`, `webhook/route.ts` |
| 7 | 🔴 CRITICAL | Unauthenticated `/api/admin/stats` when token omitted | ✅ **FIXED** | `admin/stats/route.ts` |
| 8 | 🔴 CRITICAL | Client-controlled item prices, `shipping_fee` & `user_id` spoofing | ✅ **FIXED** | `orders/create/route.ts` |
| 9 | 🟠 HIGH | Paid `orderAmount` not verified against Cashfree & order total | ✅ **FIXED** | `orders/verify/route.ts` |
| 10 | 🟠 HIGH | Stored & reflected XSS in HTML invoices | ✅ **FIXED** | `invoice-generator.ts`, `invoice/route.ts`, `[id]/invoice/route.ts` |
| 11 | 🟠 HIGH | No rate limiting / brute-force lockout on auth & OTP verify routes | ⚠️ **PARTIAL** | `send-otp/route.ts` (45s cooldown); `verify-*` lockout still open |
| 12 | 🟠 HIGH | OTP used `Math.random()` instead of CSPRNG | ✅ **FIXED** | `auth-service.ts` (`crypto.randomInt`) |
| 13 | 🟠 HIGH | `send-otp` sent to any email without account check | ✅ **FIXED** | `auth/send-otp/route.ts` |
| 14 | 🟠 HIGH | Unauthenticated public review submission | ✅ **FIXED** | `products/[id]/reviews/route.ts` |
| 15 | 🟠 HIGH | Order cancellation bypassed ownership on `request_otp` | ✅ **FIXED** | `orders/cancel/route.ts` |
| 16 | 🟠 HIGH | JWT stored in `localStorage` (XSS-accessible) | 🟡 **OPEN** | `AdminPage.tsx`, `AuthContext.tsx` |
| 17 | 🟡 MEDIUM | HTTP security headers (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`) | ✅ **FIXED** | `next.config.mjs` |
| 18 | 🟡 MEDIUM | Internal error `err.message` returned in 500 catch blocks | 🟡 **OPEN** | Multiple API routes |
| 19 | 🟡 MEDIUM | Email webhook fallback unauthenticated (`EMAIL_WEBHOOK_URL`) | 🟡 **OPEN** | `email-service.ts` |
| 20 | 🟡 MEDIUM | `ADMIN_EMAILS` in local `.env` vs production admin list | 🧪 **ENV / TEST** | `.env` |
| 21 | 🟢 LOW | No JWT refresh or `token_version` revocation mechanism | 🟡 **OPEN** | `auth-service.ts` |
| 22 | 🟢 LOW | `bcrypt` cost factor is 10 (acceptable; 12 recommended) | 🟡 **OPEN** | `auth-service.ts` |
| 23 | 🟢 LOW | No input length limits on order fields | ✅ **FIXED** | `orders/create/route.ts` |
| 24 | 🟢 LOW | Duplicate/legacy auth routes (`admin-login`, `verify-otp`, `send-otp`) | 🟡 **OPEN** | `src/app/api/auth/*` |
| 25 | 🟢 LOW | Dead `nodemailer` import | ✅ **FIXED** | `email-service.ts` |
| 26 | ℹ️ INFO | `PAYMENT=false` in local `.env` | 🧪 **ENV / TEST** | `.env` (must be unset or `true` in production) |
| 27 | ℹ️ INFO | Dead file `ProductCard.tsx` | ✅ **FIXED** | Removed from repository |

---

## Verified Fixes Details

### 1. Order & Payment Lifecycle (`create` → `verify` / `webhook`)
- **`src/lib/order-service.ts` & `src/app/api/orders/create/route.ts`:** Orders are persisted immediately on Cashfree session creation with `order_status: 'Awaiting Payment'` and `payment_status: 'PENDING'`. `admin/orders`, `admin/stats`, and `orders/my-orders` filter out `Awaiting Payment` rows so abandoned checkouts remain hidden.
- **`src/app/api/orders/webhook/route.ts`:** Requires valid `x-webhook-signature` and `x-webhook-timestamp` headers (returns `401` if missing or invalid) and calls `confirmPaidOrder()` to atomically promote `Awaiting Payment` rows to `PAID` / `Placed` and send the confirmation email + PDF invoice once—even if the customer closes their browser after UPI payment.
- **Server-side pricing & integrity:** `orders/create/route.ts` queries Supabase `products` for authoritative prices, validates stock, caps quantities (`1..99`), computes `shipping_fee` strictly server-side from platform settings, enforces max field lengths, and ignores client-supplied `body.user_id`.
- **`src/app/api/orders/verify/route.ts`:** Cross-checks `orderAmount` returned by Cashfree against the server-stored `total_amount` before confirming an order.

### 2. Access Control & PII Protection
- **`src/app/api/admin/stats/route.ts`:** Enforces `getUserFromAuthHeader(req)` and `user.role === 'admin'`.
- **`src/app/api/orders/invoice/route.ts` & `src/app/api/orders/[id]/invoice/route.ts`:** Removed the `?token=` string-presence bypass. Access now requires an authenticated admin or verified order owner (`Authorization: Bearer` header, `?token=<valid_jwt>`, or `chembros_token` cookie).
- **`src/app/api/orders/[id]/route.ts`:** Blocks non-admin sequential numeric ID lookups (`403`), requires owner authentication for registered user orders, and masks email/phone/address on unauthenticated guest order-number lookups.
- **`src/app/api/orders/cancel/route.ts`:** Enforces owner authentication (or matching `customer_email` for guest orders) across all cancellation actions including `request_otp`.
- **`src/app/api/products/[id]/reviews/route.ts`:** Requires a valid authenticated user JWT to submit reviews.

### 3. Cryptography, XSS, Secrets & Headers
- **`src/lib/auth-service.ts` & `src/lib/server-config.ts`:** OTP generation uses `crypto.randomInt(100000, 1000000)`. Hardcoded fallback literals for `JWT_SECRET` and `ADMIN_PASSWORD` were removed; `createAccessToken()` fails closed if `JWT_SECRET` is missing and `verifyAccessToken()` returns `null`.
- **`src/app/api/auth/send-otp/route.ts`:** Validates email syntax, requires an existing account in `users`, and enforces a 45-second per-email cooldown (`429`).
- **`src/lib/invoice-generator.ts` & invoice routes:** Added `escapeHtml()` to all dynamic customer, item, and order fields in HTML invoices and sanitized 404 responses.
- **`next.config.mjs`:** Configured `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Remaining Open / Production Checklist

### Before Promoting / Deploying to Production (`main`)
1. **Production Environment Variables (Vercel):**
   - Ensure `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` point to your production Supabase project.
   - Ensure `PAYMENT` is unset or `true` (never `false` in production).
   - Ensure `JWT_SECRET`, `ADMIN_PASSWORD` (strong, rotated), and `ADMIN_EMAILS` (`connect@thechemicalbrothers.in,sanjay.n.ihub@snsgroups.com,...`) are explicitly set in production environment variables.

### Future Defence-in-Depth Hardening (Non-Blocking)
1. **OTP Brute-Force Lockout & IP Rate Limiting:** Add an `otp_attempts` counter (lock after 5 failed guesses) in `verify-login-otp`, `verify-register-otp`, `verify-otp`, and `reset-password`, plus IP-based rate limiting via Upstash/middleware.
2. **HttpOnly Session Cookies:** Migrate JWT storage from `localStorage` (`chembros_token`) to `HttpOnly; Secure; SameSite=Strict` cookies to eliminate XSS token theft risk.
3. **JWT Revocation (`token_version`):** Add a `token_version` column on `users` to invalidate active JWTs on password reset/change or account deactivation.
4. **Generic 500 Responses & Webhook Secret:** Replace raw `err.message` in 500 JSON responses with generic messages, and add an `X-Webhook-Secret` header if `EMAIL_WEBHOOK_URL` is ever enabled.

---

## Positive Security Controls Verified
- Cashfree webhook HMAC-SHA256 signature + timestamp verification (`cashfree-service.ts`, `webhook/route.ts`)
- Cryptographically secure OTP generation (`crypto.randomInt`) with 10-minute expiry & single-use invalidation
- Authoritative server-side product pricing, stock, shipping fee, and Cashfree amount verification
- Atomic, idempotent `Awaiting Payment` → `PAID` order confirmation (`order-service.ts`)
- Strict `role === 'admin'` verification on all `/api/admin/*` routes
- Server-side `bcrypt` password hashing and strong password policy enforcement
- HTML escaping in invoice generation and HTTP security headers (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`)
