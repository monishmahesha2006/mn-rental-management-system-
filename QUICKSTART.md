# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running

## One-Click Start (Windows)

Double-click `start-dev.bat` to start both servers automatically.

Then open: **http://localhost:5173**

## Manual Start

### Terminal 1 - Backend:
```bash
cd server
npm install
copy .env.example .env
# Edit .env with your DATABASE_URL
npx prisma migrate dev --name init
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client
npm install
npm run dev
```

## Final Working Localhost Link

**http://localhost:5173**

(If port 5173 is busy, Vite will use 5174, 5175, etc. - check the terminal output)
