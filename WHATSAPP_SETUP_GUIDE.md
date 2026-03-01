# 🚀 WhatsApp & SMS Notification Setup Guide

## ✅ Current Status
Your BLR Rental application is **LIVE** and running at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 📱 WhatsApp Notification Feature

### What's Already Implemented
✅ **NotificationService** - Handles SMS and WhatsApp via Twilio
✅ **Database Schema** - `phone` field added to User model
✅ **Tenant Profile** - UI for tenants to update their phone number
✅ **Owner Automation** - "Send Formal Reminders" button integrated
✅ **Communication Logs** - Tracks all sent notifications

### Why You're Not Getting Real WhatsApp Messages

The system is currently in **MOCK MODE** because Twilio credentials are not configured. Here's what's happening:

1. When you click "Send Formal Reminders", the system:
   - ✅ Finds all pending invoices
   - ✅ Checks if tenants have phone numbers
   - ✅ Creates communication logs
   - ⚠️ **Prints mock messages to console** instead of sending real WhatsApp

2. Console output shows:
   ```
   [WhatsApp MOCK to 9071951972]: Dear Kavitha Hp, this is a gentle reminder...
   ```

### 🔧 How to Enable REAL WhatsApp Messages

#### Step 1: Get Twilio Credentials
1. Sign up at https://www.twilio.com/try-twilio
2. Get your **Account SID** and **Auth Token** from the dashboard
3. Get a **Twilio Phone Number** (for SMS)
4. Enable **WhatsApp Sandbox** and get the WhatsApp number

#### Step 2: Configure Environment Variables
Open `server/.env` and add:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="supersecretkey"
PORT=4000

# Add these Twilio credentials:
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### Step 3: Restart the Server
```bash
cd server
npm run dev
```

#### Step 4: Test the Feature
1. Login as **Owner**: `owner@example.com` / `password`
2. Go to **Productivity Engine** (Automation page)
3. Click **"Send Formal Reminders"**
4. Check the server console for logs

## 🧪 Testing Without Twilio (Current Setup)

You can still test the entire flow in mock mode:

### Test Credentials
**Owner Account:**
- Email: `owner@example.com`
- Password: `password`

**Tenant Account:**
- Email: `kavithahp32@gmail.com`
- Password: `password`
- Phone: `9071951972` (already set)

### Testing Steps
1. **As Tenant**:
   - Login at http://localhost:5173
   - Go to "Residency Profile"
   - Click "Account Info" button
   - Update your phone number (WhatsApp number)
   - Click "Update Private Record"

2. **As Owner**:
   - Login at http://localhost:5173
   - Go to "Productivity Engine"
   - Click "Send Formal Reminders"
   - Check the **server console** for mock messages

3. **Verify Logs**:
   - The server console will show:
     ```
     [Automation] Processing reminder for Kavitha Hp (kavithahp32@gmail.com). Phone: 9071951972
     [WhatsApp MOCK to 9071951972]: Dear Kavitha Hp, this is a gentle reminder...
     [SMS MOCK to 9071951972]: Dear Kavitha Hp, this is a gentle reminder...
     ```

## 📊 Database Verification

To check if phone numbers are saved:
```bash
cd server
npx ts-node check_db.ts
```

This will show all users and their phone numbers.

## 🔍 Troubleshooting

### Issue: "Not getting WhatsApp messages"
**Solution**: This is expected without Twilio credentials. The system is working correctly in mock mode.

### Issue: "Phone number not saving"
**Solution**: 
1. Check the tenant profile page
2. Ensure you click "Update Private Record"
3. Verify in database using the check script above

### Issue: "Send Reminders button does nothing"
**Solution**:
1. Ensure there are pending invoices
2. Check server console for logs
3. Verify tenant has a phone number set

## 📝 Important Notes

1. **Mock Mode vs Real Mode**:
   - Without Twilio: Messages logged to console
   - With Twilio: Real SMS/WhatsApp sent

2. **Phone Number Format**:
   - System auto-adds +91 for Indian numbers
   - You can enter: `9071951972` or `+919071951972`

3. **WhatsApp Sandbox**:
   - Twilio WhatsApp requires sandbox approval
   - Recipients must send "join <sandbox-code>" first
   - For production, you need WhatsApp Business API approval

4. **Communication Logs**:
   - All reminders are logged in the database
   - Channel shows "WHATSAPP_SMS" if phone exists
   - Channel shows "EMAIL_MOCK" if no phone

## 🎯 Next Steps

1. **For Testing**: Use the current mock mode - it's working perfectly!
2. **For Production**: Add Twilio credentials to `.env`
3. **For Development**: Monitor server console to see notification flow

## 🌐 Access Your Application

**Your working localhost link**: http://localhost:5173

Login and test the notification system - everything is functional in mock mode!

---

**Need Help?** Check the server console logs - they show exactly what the system is doing with each notification.
