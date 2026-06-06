# ChronoLux — Scaffold

This repository contains the Phase 1 scaffold for ChronoLux — a luxury watch e‑commerce starter.

Quick start

Install dependencies:

```bash
npm install
```

Generate Prisma client and migrate (creates SQLite dev.db):

```bash
npm run prisma:generate
npm run prisma:migrate
```

Run development server:

```bash
npm run dev
```

Phase 2 preview

- Implement authentication (email/password + OTP via Resend)
- Role-based middleware and session/JWT
- Admin user seed and admin-only routes
