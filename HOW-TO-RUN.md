# How to Run the Project & Get Working Link

## The Working Link

**http://localhost:5173**

This link only works **after** you start the frontend dev server (see below).

---

## Option 1: One-Click Start (Easiest)

1. **Double-click** `start-dev.bat` (in the project root folder).
2. Two command windows will open (Backend and Frontend). **Do not close them.**
3. Wait **10–15 seconds** for both to finish starting.
4. Open your browser and go to: **http://localhost:5173**

---

## Option 2: Manual Start (If batch doesn’t work)

### Step 1: Install Node.js (if needed)

- If you don’t have Node.js: download from https://nodejs.org (LTS).
- After install, **close and reopen** any terminal/Command Prompt.

### Step 2: Start Backend

1. Open **Command Prompt** or **PowerShell**.
2. Run:
   ```bat
   cd "c:\Users\Dell\Desktop\rs1\server"
   npm install
   npm run dev
   ```
3. Leave this window open. You should see: `Server running on http://localhost:4000`.

### Step 3: Start Frontend

1. Open a **second** Command Prompt or PowerShell window.
2. Run:
   ```bat
   cd "c:\Users\Dell\Desktop\rs1\client"
   npm install
   npm run dev
   ```
3. Leave this window open. You should see something like:
   ```text
   Local:   http://localhost:5173/
   ```

### Step 4: Open in Browser

- Go to: **http://localhost:5173**
- (Use the exact URL shown in the frontend terminal if the port is different, e.g. 5174.)

---

## Why "Connection Refused"?

- **ERR_CONNECTION_REFUSED** means no program is listening on that port.
- So either:
  - The dev servers were never started, or
  - They were closed, or
  - They crashed (check the terminal for errors).

**Fix:** Start both servers (backend first, then frontend) and keep both terminal windows open. Then use **http://localhost:5173** in the browser.
