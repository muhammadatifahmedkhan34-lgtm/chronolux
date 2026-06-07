# ChronoLux

ChronoLux is a minimal e-commerce starter for a luxury watch store built with Next.js (App Router), Prisma, Tailwind, and Cloudinary. This repository contains a working demo of product listings, cart/checkout, coupons, an admin area, and basic auth.

## Features

- Product catalog and product pages
- Cart with add/update/remove
- Checkout with Cash-on-Delivery and Dummy Card payment (client-side simulated)
- Server-authoritative totals, coupon validation, and stock decrement in transactions
- Durable idempotency key support to prevent duplicate orders
- Admin area for products, orders, coupons, users
- Email sending via Resend (optional)

## Tech stack

- Next.js 15 (App Router)
- React 19, TypeScript
- Prisma ORM (SQLite by default for local/demo)
- Tailwind CSS
- Cloudinary for image hosting
- Resend for transactional emails (optional)
 - Nodemailer (SMTP) for transactional emails (Gmail App Password recommended for demo)

## Quick setup (local development)

1. Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd chronolux
npm install
```

2. Copy and edit environment variables:

```bash
cp .env.example .env
# then edit .env with real values where appropriate
```

3. Generate Prisma client and run migrations (creates local SQLite DB by default):

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed initial data (creates an admin user and some demo brands/categories):

```bash
node prisma/seed.js
```

5. Run development server:

```bash
npm run dev
```

6. Build for production (optional):

```bash
npm run build
npm start
```

## Environment variables (.env.example)

Do NOT store real secrets in the repository. Use `.env` on the server or secret management provided by your host.

Required variables (placeholders are provided in `.env.example`):

- `DATABASE_URL` — e.g. `file:./dev.db` for SQLite or a PostgreSQL connection string for production
- `JWT_SECRET` — a strong random secret used to sign auth tokens
- `RESEND_API_KEY` — optional, API key for Resend
- `RESEND_FROM_EMAIL` — optional, from address for emails
 - `EMAIL_PROVIDER` — set to `smtp` to use Nodemailer SMTP
 - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — SMTP configuration for Nodemailer (Gmail App Password example)
 - `FORCE_EMAIL_SEND` — set to `true` in development to actually send emails
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name for images
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret
- `NEXT_PUBLIC_APP_URL` — full app URL (e.g. `https://your-app.example`)

## Deployment notes

Recommended production database: PostgreSQL (SQLite is supported for demos/local but not recommended for multi-instance production).

Typical deployment steps (example):

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
npm start
```

If you use Vercel, Railway, or Render, configure environment variables through their dashboard and follow provider-specific deployment instructions.

## Admin user (local demo)

The seed script creates an admin user with the following credentials (only for local/demo):

- Email: `admin@chronolux.test`
- Password: `AdminPass123!`

Change the password or use secret management in production.

## Prisma & database tips

- To create and apply a new migration locally:

```bash
npx prisma migrate dev --name <migration_name>
```

- To apply migrations in a deployed environment:

```bash
npx prisma migrate deploy
```

- To regenerate the Prisma client after schema changes:

```bash
npx prisma generate
```

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm start` — start the production server (after build)
- `node prisma/seed.js` — run seed script

## Security notes

- The app intentionally validates card PAN/CVV/expiry only on the client for the Dummy Card payment method and never sends or stores sensitive card data on the server. For any real payment integration, follow PCI-DSS guidelines and use a qualified payment provider (Stripe, Braintree, etc.).

## Support

If you need help deploying or changing the DB to PostgreSQL, tell me the target provider and I can add provider-specific notes and environment variable examples.
