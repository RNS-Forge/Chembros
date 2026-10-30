# CHEM BROS — Haute Parfumerie & Chemistry

> **Chemistry Captured in a Bottle.**  
> Bespoke extrait de parfum crafted through modern molecular synthesis and natural extractions.

---

## Architecture Overview

Chembros is built on a **Unified Full-Stack Next.js 15 App Router** architecture. The entire system—luxury storefront, administrative operations, database communication, Cashfree payment gateway, and Gmail SMTP 2FA/tracking email pipelines—runs within a single, self-contained Next.js deployment.

```
+------------------------------------------------------------------------+
|                        CHEM BROS PLATFORM                              |
+-----------------------------------+------------------------------------+
|       CLIENT LAYER                |       SERVER / API LAYER           |
|   (Next.js 15 App Router)         |   (Next.js Route Handlers)         |
|                                   |                                    |
| - Lenis Smooth Scrolling          | - 2FA Authentication & OTP API     |
| - GSAP & ScrollTrigger Animations | - Cashfree Payment Gateway v3      |
| - Conquera & Cinzel Luxury Fonts  | - Multi-Stage Tracking Emails      |
| - Slide-out Cart Drawer           | - Supabase Admin Client (Service)  |
| - 1-Click Saved Address Recovery  | - Admin Dashboard & Order Controls |
+-----------------+-----------------+------------------+-----------------+
                  |                                    |
                  v                                    v
       +---------------------+              +---------------------+
       │   SUPABASE CLOUD    │              │   GMAIL SMTP ENGINE │
       │  PostgreSQL & Auth  │              │  2FA & Order Mails  │
       +---------------------+              +---------------------+
```

### Key Architectural Advantages
- **Zero External Backend Server**: No standalone servers required (no Fly.io, Koyeb, or Railway). The entire client and API backend deploy simultaneously in 1 click to Vercel.
- **Single-Domain Relative Endpoints**: The frontend connects to `/api/...` directly on the same domain, eliminating cross-origin resource sharing (CORS) complications and browser port restrictions.
- **100% UI Preservation**: Strict visual and tactile parity—identical animations, layout geometry, typography, and interactive components.

---

## Features and Capabilities

### 1. Haute Parfumerie Storefront
- **Visual Design**: High-end black-and-white aesthetic with custom `Conquera` typography, `Cinzel` serif accents, and `Inter`/`Poppins` body hierarchy.
- **Micro-Interactions & Motion**: Seamless page transitions powered by Lenis smooth scrolling, GSAP physical coordinate flacon animations, and ScrollTrigger reveals.
- **Flacon Detail & Discovery**: Interactive size selectors (`30ml Extrait`, `50ml Extrait`, `Discovery Archive`), olfactory pyramid notes (Top, Heart, Base), verified reviews, longevity and sillage ratings.
- **Persistent Slide-out Cart**: Real-time quantity manipulation, complimentary luxury shipping threshold calculation (free for orders >= Rs. 1,500), and subtotal breakdown.

### 2. Live 2FA Authentication & Address Auto-Recovery
- **Password Hashing & JWT**: Bcrypt salt hashing and 7-day HMAC-SHA256 authenticated sessions.
- **Live 2FA OTP Delivery**: 6-digit one-time passcodes dispatched in real time via Gmail SMTP with Supabase OTP expiry management.
- **1-Click Checkout Address Recovery**: When an authenticated user checks out, past shipping details are automatically recovered from previous orders and hydrated into their profile.

### 3. Cashfree Payment Gateway Integration
- Direct integration with **Cashfree Payment Gateway v3 JS SDK**.
- Server-side order token generation (`/api/orders/create`) with live customer details and order amounts.
- Secure server-side verification (`/api/orders/verify`) preventing client-side spoofing.
- High-fidelity sandbox mode simulation fallback for continuous development and testing.

### 4. 5-Stage Luxury Email Tracking Pipeline
Dispatches responsive, branded HTML emails to customers at every step of the order lifecycle:
1. **Order Placed**: Confirmation flacon receipt with itemized breakdown and delivery address.
2. **Payment Confirmed**: Settle notice with Cashfree transaction verification.
3. **Dispatched & Shipped**: Notification with waybill tracking number, carrier name, and 1-click live track button.
4. **Delivery by Today**: Courier dispatch alert indicating same-day arrival.
5. **Safely Delivered**: Final delivery confirmation and flacon maceration resting guidance.

*Multi-transport failover:* Gmail SMTP -> Brevo HTTPS -> Resend -> Webhook fallback.

### 5. Administrator Command Center (`/admin`)
- **Metric Dashboard**: Live metrics for gross revenue, paid orders, total flacons in catalogue, and low stock warnings.
- **Catalogue Manager**: Create, edit, price, and upload new extrait flacons and discovery sets with base64 imagery.
- **Live Order Control & Dispatch**: Filter orders by status or customer query, update order statuses, assign courier tracking numbers, and automatically trigger customer status emails.

---

## Repository Structure

```
Chembros/
├── public/                     # Static assets (fonts, icons, favicon, videos)
│   ├── favicon.svg
│   ├── icons.svg
│   ├── assets/                 # Brand imagery and intro video
│   └── fonts/                  # Conquera font family (Light, Medium, Bold, Heavy, Inline)
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── layout.tsx          # Root shell (providers, Google fonts, Cashfree SDK)
│   │   ├── globals.css         # Tailwind v4 directives, custom font-face rules
│   │   ├── page.tsx            # Home Page (/)
│   │   ├── fragrances/         # Catalogue (/fragrances, /fragrances/[id])
│   │   ├── product/            # Flacon details (/product/[id])
│   │   ├── checkout/           # Checkout & Cashfree PG (/checkout)
│   │   ├── order-confirmation/ # Order status & tracking (/order-confirmation)
│   │   ├── my-orders/          # Customer order history (/my-orders)
│   │   ├── our-story/          # Laboratory heritage & story (/our-story)
│   │   ├── admin/              # Admin command centre (/admin)
│   │   ├── auth/               # 2FA Login & Register (/auth, /login, /register)
│   │   └── api/                # Full-Stack Next.js Serverless API Routes
│   │       ├── auth/           # Login, Register, Send OTP, Verify OTP, Profile
│   │       ├── orders/         # Create Order, Verify Payment, Status, My Orders
│   │       └── admin/          # Admin Orders, Stats, Status Updates
│   ├── views/                  # UI Page Views (HomePage, Fragrances, CheckoutPage, etc.)
│   ├── components/             # Reusable UI widgets
│   │   ├── NavBar.tsx          # Header with sliding navigation & account dropdown
│   │   ├── Footer.tsx          # Branded footer with model visual
│   │   ├── Homehero.tsx        # Physical flacon alignment hero section
│   │   ├── HomeProduct.tsx     # Discovery Archive & product grid
│   │   ├── HomeCta.tsx         # Olfactory chemistry call-to-action
│   │   ├── VideoArea.tsx       # 16:9 brand narrative video player
│   │   ├── CartDrawer.tsx      # Slide-out shopping bag
│   │   ├── AuthModal.tsx       # 2FA authentication modal
│   │   ├── ProfileModal.tsx    # Customer profile editor & order viewer
│   │   ├── ProductCard.tsx     # Extrait flacon card
│   │   └── SmoothScroll.tsx    # Lenis + GSAP ScrollTrigger synchronizer
│   ├── context/                # React Context Providers
│   │   ├── AuthContext.tsx     # 2FA auth state, JWT token, user profile
│   │   └── CartContext.tsx     # Shopping bag state & localStorage persistence
│   ├── lib/                    # Server-side Utilities & Business Logic
│   │   ├── server-config.ts    # Consolidated environment configuration
│   │   ├── supabase-admin.ts   # Service-role Supabase client
│   │   ├── auth-service.ts     # Bcrypt, JWT, 2FA OTP, address enricher
│   │   ├── cashfree-service.ts # Cashfree PG v3 order creation & verification
│   │   ├── email-service.ts    # Responsive HTML templates & SMTP transport
│   │   └── router-compat.tsx   # React Router compatibility layer for Next.js
│   ├── services/               # Client-side API & Supabase clients
│   │   ├── api.ts              # Unified relative API endpoints (/api/...)
│   │   └── supabase.ts         # Public Supabase client
│   └── types/                  # TypeScript interface definitions
├── .env.example                # Template of required environment variables
├── .env.local                  # Local secrets (git-ignored)
├── next.config.mjs             # Next.js configuration & path aliases
├── postcss.config.mjs          # Tailwind CSS v4 PostCSS configuration
├── package.json                # Dependencies and project scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## Environment Variables

Create a `.env.local` file in the root directory (or configure them in your Vercel Project Settings):

```ini
# ==============================================================
# CHEM BROS ENVIRONMENT CONFIGURATION
# ==============================================================

# Client-Side Variables (Exposed to Browser)
NEXT_PUBLIC_SUPABASE_URL=https://sbbqxtqiuafjceayaigp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_M1Ag1eRpUvWdBWJI55_79g_uLj5sop7
NEXT_PUBLIC_API_BASE_URL=

# Server-Side Supabase Privileged Key
SUPABASE_URL=https://sbbqxtqiuafjceayaigp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_jxKT2

# Gmail SMTP 2FA & Multi-Stage Tracking Emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sanjay.n.ihub@snsgroups.com
SMTP_PASS=myiytyplpoyypnnj
SMTP_FROM=sanjay.n.ihub@snsgroups.com

# Cashfree Payment Gateway (PG v3)
CASHFREE_APP_ID=TEST_APP_ID_CHEMBROS
CASHFREE_SECRET_KEY=TEST_SECRET_KEY_CHEMBROS
CASHFREE_ENV=SANDBOX
CASHFREE_API_VERSION=2023-08-01

# JWT Secret & Token Lifespan
JWT_SECRET=chembros_secret_key_haute_parfumerie_2026_jwt_token_secure_98471
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Administrator Credentials
ADMIN_EMAILS=admin@chembros.com,sanjay.n.ihub@snsgroups.com
ADMIN_PASSWORD=chembros@tech

# Frontend Domain
FRONTEND_URL=https://chembros.vercel.app
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **npm** or **pnpm** or **yarn**

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/RNS-Forge/Chembros.git
cd Chembros
npm install
```

### 2. Local Development
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Both client routes and backend API endpoints are available on this port.

### 3. Production Build
Verify compilation, type validity, and static generation:
```bash
npm run build
```

To run the production build locally:
```bash
npm start
```

---

## Deploying to Vercel (1-Click Deployment)

Deploying Chembros to Vercel takes less than two minutes:

1. Push your changes to GitHub (e.g. `RNS-Forge/Chembros` on branch `main`).
2. Log into [Vercel](https://vercel.com) and click **Add New... -> Project**.
3. Import your **`Chembros`** repository.
4. Vercel automatically detects the **Next.js** framework with Root Directory `./`.
5. Under **Environment Variables**, paste the keys from `.env.example`.
6. Click **Deploy**.

Vercel will build the frontend pages and serverless API functions into a global edge deployment on a single `.vercel.app` domain with automated HTTPS.

---

## API Reference

All endpoints accept and return JSON. Endpoints requiring authentication expect `Authorization: Bearer <token>`.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login-request` | Validates credentials and sends a 6-digit OTP code to the user's email |
| `POST` | `/api/auth/verify-login-otp` | Verifies the login OTP and returns a JWT access token & user profile |
| `POST` | `/api/auth/register-request` | Submits user registration and dispatches a verification OTP |
| `POST` | `/api/auth/verify-register-otp` | Verifies register OTP and provisions the user record |
| `POST` | `/api/auth/admin-login` | Direct login for authorized administrators |
| `GET` | `/api/auth/me` | Fetches the current authenticated user profile |
| `PUT` | `/api/auth/profile` | Updates user details (address, phone, name) |
| `POST` | `/api/auth/change-password` | Updates the account password |

### Order & Payment Endpoints (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders/create` | Computes totals, creates Cashfree PG session, persists order, sends Order Placed email |
| `POST` | `/api/orders/verify` | Verifies Cashfree payment, updates status to `PAID`, sends Payment Done email |
| `GET` | `/api/orders/my-orders` | Returns order history for the currently authenticated buyer |
| `GET` | `/api/orders/[id]` | Retrieves detailed order data by order ID or reference (`CB-YYYYMMDD-XXXX`) |
| `PATCH`| `/api/orders/[id]/status` | Updates order stage and triggers multi-stage customer tracking emails |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/orders` | Retrieves all system orders with optional status and search filters |
| `GET` | `/api/admin/stats` | Returns real-time metrics (total revenue, paid orders, low stock items) |
| `PATCH`| `/api/admin/orders/[id]/status` | Admin status & tracking number updater with email notification trigger |

---

## Database Tables (Supabase)

The platform integrates with your Supabase PostgreSQL instance:

| Table | Description |
|---|---|
| `users` | Buyer and administrator profiles, password hashes, and enriched shipping addresses |
| `orders` | Completed and pending orders, line items JSON, Cashfree IDs, amounts, and tracking numbers |
| `otps` | One-time passcodes, expiration timestamps, and redemption statuses |
| `products` | Extrait flacons, olfactory notes, inventory stock levels, base64 images, and reviews |
| `reviews` | Customer ratings, longevity ratings, sillage notes, and feedback |

---

## License and Credits

- **Brand & Formulations**: Chembros Haute Parfumerie (c) 2026. All rights reserved.
- **Engineered by**: RNS-Forge Engineering Team.
