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

**Automatic Blueprint Deployment (1-Click)**:
Render will automatically detect `render.yaml` in this repository!
1. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
2. Connect `monishmahesha2006/mn-rental-management-system-`.
3. Render reads `render.yaml` and deploys automatically!

**Manual Web Service Deployment**:
1. Click **New +** -> **Web Service**.
2. Connect your repository and configure:
   - **Runtime**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
3. Under **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `file:./dev.db`
   - `JWT_SECRET`: *(Click 'Generate' or enter a secure random string)*
   - `PORT`: `10000` (Render defaults to 10000 or dynamically assigns)

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
