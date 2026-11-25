# CHEM BROS — Haute Parfumerie

> **Chemistry Captured in a Bottle.**  
> Full-stack e-commerce storefront and admin platform for Chembros bespoke extrait de parfum, built with Next.js 15 App Router.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & Motion**: Tailwind CSS v4, GSAP, Lenis, Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Payments**: Cashfree Payment Gateway v3 (with webhook & server-side verification)
- **Email & Invoices**: Nodemailer (Gmail SMTP) / Resend / Brevo, `pdf-lib`

---

## Core Features

- **Storefront**: Fragrance catalogue (`/fragrances`, `/product/[id]`), persistent slide-out cart drawer, order tracking (`/track-order`), and customer order history (`/my-orders`).
- **Authentication**: Bcrypt password hashing, JWT sessions, and 6-digit email 2FA OTP verification & password reset.
- **Checkout & Payments**: Cashfree PG v3 integration (`/api/orders/create`, `/api/orders/verify`, `/api/orders/webhook`) and downloadable PDF invoices (`/api/orders/invoice`).
- **Admin Dashboard (`/admin`)**: Order management, status updates with automated tracking emails, product/inventory management, reviews, users, logs, and analytics.

---

## Getting Started

### Prerequisites
- Node.js `18.18+` (Node 20+ recommended)
- `npm`

### Installation & Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts
- `npm run dev` — Start development server
- `npm run build` — Create production build
- `npm start` — Run production server
- `npm run lint` — Run Next.js linter

---

## Project Structure

```text
Chembros/
├── public/              # Static assets, fonts, and media
├── src/
│   ├── app/             # Next.js App Router pages & /api/* route handlers
│   ├── components/      # Reusable UI components
│   ├── views/           # Page-level view components
│   ├── context/         # Auth & Cart React context providers
│   ├── lib/             # Server utilities (auth, Cashfree, email, Supabase, config)
│   ├── services/        # Client-side API & Supabase helpers
│   └── types/           # TypeScript definitions
├── next.config.mjs      # Next.js configuration
└── package.json         # Dependencies and scripts
```
