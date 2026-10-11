# mn-rental-management-system-

> Premium Bangalore Rental & Property Management System (Resident Hub & Owner Command Center)

A full-stack, enterprise-grade rental and property management platform built for landlords and tenants in the Greater Bangalore market.

---

## 🌟 Key Features

- **Owner Command Center**: Comprehensive property, unit, tenant, lease, and expense management.
- **Tenant Resident Portal**: Digital rent payment, payment history, maintenance requests, and notice board.
- **Classic Iconic Light Theme**: Tailored warm luxury aesthetics with professional typography and intuitive UX.
- **Automated Billing & Reminders**: Rental invoices, utility breakdown, and WhatsApp/SMS alert integration.
- **Production-Ready Single-Server Deployment**: Node.js/Express server serves both the high-performance React SPA bundle and API endpoints on a single port.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js, Axios
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Helmet security
- **Database**: SQLite (local/default) or PostgreSQL (hosted cloud database)
- **Authentication**: JWT authentication with bcrypt password hashing

---

## 🚀 Quick Start

### 1. Installation
Install all dependencies for both frontend and backend in one command:
```bash
npm run install:all
```

### 2. Development Mode
Run both servers locally:
```bash
# Terminal 1 - Backend (Port 4000)
npm run dev:server

# Terminal 2 - Frontend (Port 5173)
npm run dev:client
```
*(Or double-click `start-dev.bat` on Windows)*

### 3. Production Mode (Single-Server)
Build and launch unified production mode:
```bash
npm run build
npm start
```
Access the application at `http://localhost:4000`.
*(Or double-click `start-prod.bat` on Windows)*

---

## 🗄️ Database & Account Management

- **Provision / Update Owner Account (Developer Only)**:
  ```bash
  # Interactive mode:
  npm run create-owner

  # Or with arguments:
  npm run create-owner -- owner@email.com password123 "Owner Name"
  ```
- **Format & Clean Mock Data**:
  ```bash
  npm run format-db
  ```
- **Prisma Migrations**:
  ```bash
  npm run prisma:migrate
  ```

---

## 📖 Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions on deploying to **Render**, **Railway**, or **Ubuntu/VPS**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
