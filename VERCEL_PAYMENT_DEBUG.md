# 🔧 Vercel Environment Variables - Quick Check

## ⚠️ Payment Error (500) - Missing Variables?

The Cashfree payment error on production is likely due to missing or incorrect environment variables.

---

## ✅ Required Variables for Production

### Check These in Vercel Dashboard:

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

### 1. Cashfree (CRITICAL for Payments)
```
✓ CASHFREE_CLIENT_ID
✓ CASHFREE_CLIENT_SECRET  
✓ CASHFREE_MODE=production
✓ NEXT_PUBLIC_CASHFREE_MODE=production
```

### 2. Base URL (CRITICAL for Callbacks)
```
✓ NEXT_PUBLIC_BASE_URL=https://www.pixelsdigital.tech
✓ NEXTAUTH_URL=https://www.pixelsdigital.tech
```

**Without these, Cashfree can't redirect back after payment!**

### 3. MongoDB (CRITICAL)
```
✓ MONGODB_URI
```

### 4. Authentication
```
✓ JWT_SECRET
✓ NEXTAUTH_SECRET
```

---

## 🔍 How to Check

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Scroll through and verify all above variables exist
5. Check they're enabled for "Production"

### Method 2: Check Recent Deployment Logs
1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Click "View Function Logs"
4. Look for errors like:
   - "CASHFREE_CLIENT_ID is not defined"
   - "Invalid credentials"
   - "Callback URL not allowed"

---

## 🚨 Most Common Issues

### Issue 1: Missing NEXT_PUBLIC_BASE_URL
**Symptom:** Payment fails with callback error
**Fix:** Add to Vercel:
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://www.pixelsdigital.tech
Environments: Production, Preview, Development
```

### Issue 2: Wrong Cashfree Credentials
**Symptom:** 401 Unauthorized from Cashfree
**Check:** 
- Are you using production credentials?
- Copy-paste error in CLIENT_ID or CLIENT_SECRET?
- Spaces at the end of values?

### Issue 3: Callback URL Not Whitelisted
**Symptom:** Cashfree rejects order creation
**Fix in Cashfree Dashboard:**
1. Go to Cashfree Dashboard
2. Developers → Webhooks/Callbacks
3. Add: `https://www.pixelsdigital.tech/payment/callback`

---

## 🎯 After Adding Missing Variables

### Step 1: Redeploy
```bash
# Trigger redeploy from local
git commit --allow-empty -m "redeploy: apply new env vars"
git push origin main
```

Or from Vercel Dashboard:
- Deployments → Latest → "..." → Redeploy

### Step 2: Check Logs (IMPORTANT!)
After deployment:
1. Try payment again
2. Immediately check Vercel logs
3. Look for console.log messages we just added:
   ```
   "Creating Cashfree order: { orderId: '...', amount: ..., mode: 'production' }"
   ```
4. If error, you'll see:
   ```
   "Cashfree order creation error: { status: 401, error: {...} }"
   ```

---

## 📋 Complete Variable Checklist

Copy this list and check each one in Vercel:

**Critical (Must Have):**
- [ ] MONGODB_URI
- [ ] CASHFREE_CLIENT_ID
- [ ] CASHFREE_CLIENT_SECRET
- [ ] CASHFREE_MODE=production
- [ ] NEXT_PUBLIC_CASHFREE_MODE=production
- [ ] NEXT_PUBLIC_BASE_URL=https://www.pixelsdigital.tech
- [ ] NEXTAUTH_URL=https://www.pixelsdigital.tech
- [ ] JWT_SECRET
- [ ] NEXTAUTH_SECRET

**AWS (For S3 & Email):**
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION=ap-south-1
- [ ] AWS_BUCKET_NAME=pixels-official
- [ ] SMTP_HOST=email-smtp.us-east-1.amazonaws.com
- [ ] SMTP_PORT=587
- [ ] SMTP_USER
- [ ] SMTP_PASSWORD
- [ ] EMAIL_FROM=noreply@pixelsdigital.tech

**Optional:**
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GOOGLE_REFRESH_TOKEN
- [ ] GOOGLE_DRIVE_FOLDER_ID
- [ ] GOOGLE_REDIRECT_URI

---

## 🔍 Debug Steps

### 1. After next deployment, try payment and immediately:

**Check Browser Console (F12):**
```
Look for: POST /api/payments/milestone 500
Click on it → Preview tab → See error message
```

**Check Vercel Logs:**
```
Should show:
"Creating Cashfree order: ..."
Then either success or:
"Cashfree order creation error: ..."
```

### 2. Based on Error:

**If you see "client_id is required":**
- CASHFREE_CLIENT_ID missing in Vercel

**If you see "Invalid credentials":**
- Check CLIENT_ID and CLIENT_SECRET are correct
- Make sure they're production credentials

**If you see "Callback URL not allowed":**
- Whitelist in Cashfree dashboard
- Check NEXT_PUBLIC_BASE_URL is set

---

## 🎯 Quick Test

After fixing:
1. Wait for Vercel deployment to complete (2-3 min)
2. Go to: https://www.pixelsdigital.tech/client-portal/login
3. Log in
4. Try to pay for a milestone
5. Check browser console for errors
6. Check Vercel logs for detailed error messages

---

**Next Step:** Check your Vercel dashboard right now and verify all variables are set!
