# BLR Rental Command Center & Resident Hub

Full-stack rental management system for the Greater Bangalore market, built with:

- React + Vite + Tailwind CSS + Framer Motion + React Query
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a cloud instance)

### 1. Configure the database & backend

1. Create a PostgreSQL database, e.g. `blr_rental`.
2. Copy `server/.env.example` to `server/.env` and set:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/blr_rental"
JWT_SECRET="change-me"
```

3. Install dependencies and run Prisma migrations:

```bash
cd server
npm install
npx prisma migrate dev --name init
```

4. (Optional) Seed initial demo data with a script you can add later that creates `owner@example.com` and `tenant@example.com`.

5. Start the backend:

```bash
npm run dev
```

This starts the API on `http://localhost:4000`.

### 2. Start the frontend

1. In another terminal:

```bash
cd client
npm install
npm run dev
```

2. Open the printed Vite URL (typically `http://localhost:5173`).

### 3. Auth & roles

- Use the `/api/auth/register` endpoint to create `OWNER` and `TENANT` users.
- Log in from the `/login` screen:
  - Owners are redirected to `/owner/dashboard`.
  - Tenants are redirected to `/tenant/home`.

## Deployment notes

- Backend:
  - Set `DATABASE_URL`, `JWT_SECRET` and `PORT` in your cloud platform (Railway, Render, etc.).
  - Build with `npm run build` and start with `npm start`.
- Frontend:
  - Deploy the `client` folder (Vercel/Netlify).
  - Point `VITE_API_BASE_URL` (if you add it) at the deployed backend.

## Payments & PDFs

- Payment flows are mocked through `/api/payments/*` so you can later drop in real Razorpay/Stripe keys without changing the UI.
- Invoice and agreement PDFs are currently returned as JSON/URLs; you can integrate a real PDF generator (e.g. `pdfkit`) and object storage (S3/GCS) as a next step.

