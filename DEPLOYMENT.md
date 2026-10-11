# Deployment Guide - Bangalore Rental Platform

This platform has been configured for **Unified Production Deployment**, meaning the Node.js backend serves both the compiled React frontend (`client/dist`) and all API endpoints (`/api/*`) on a single port. No complex reverse proxies or CORS headaches are required.

---

## 🚀 Quick Run Locally (Production Mode)

1. Open a terminal in the root folder (`rs1`).
2. Run the build command:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```
4. Access the unified platform at:
   ```
   http://localhost:4000
   ```
*(On Windows, you can also double-click `start-prod.bat`)*

---

## ☁️ Cloud Deployment Options

### Option 1: Render.com (Recommended Free/Easy Option)
1. Push your repository to **GitHub** or **GitLab**.
2. Create a new **Web Service** on [Render Dashboard](https://dashboard.render.com).
3. Connect your repository and configure:
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default for Render)
   - `JWT_SECRET`: *(A secure random string, e.g. `openssl rand -hex 32`)*
   - `DATABASE_URL`: `file:./dev.db` *(or your PostgreSQL URL if using hosted Postgres)*
   - `RAZORPAY_KEY_ID`: *(Optional / Coming Soon)*
   - `RAZORPAY_KEY_SECRET`: *(Optional / Coming Soon)*

---

### Option 2: Railway.app
1. Go to [railway.app](https://railway.app) and create a **New Project from GitHub Repo**.
2. Railway detects Node automatically. Set the following in settings:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
3. Add a persistent volume mounted to `/app/server/prisma` if you wish to persist the SQLite database between redeploys, or provide a PostgreSQL database connection string via `DATABASE_URL`.

---

### Option 3: VPS / Ubuntu Server (EC2, DigitalOcean, Linode)
1. Clone the repo onto your server:
   ```bash
   git clone <YOUR_REPO_URL>
   cd rs1
   ```
2. Install dependencies & build:
   ```bash
   npm run install:all
   npm run build
   ```
3. Run with **PM2** (Process Manager):
   ```bash
   npm install -g pm2
   pm2 start server/dist/index.js --name "blr-rental"
   pm2 save
   pm2 startup
   ```
4. Configure Nginx with SSL (Let's Encrypt) to proxy traffic from port 80/443 to `http://127.0.0.1:4000`.

---

## 🗄️ Database Management

- **Formatting / Cleaning test data**:
  To reset mock data and keep authentic user records:
  ```bash
  npm run format-db
  ```
- **Prisma Migrations**:
  ```bash
  npm run prisma:migrate
  ```
- **Database Backup Location**:
  A safe snapshot of the database before cleanup is stored at:
  `server/prisma/dev.db.backup`
