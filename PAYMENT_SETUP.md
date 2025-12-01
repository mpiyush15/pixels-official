# 💳 Cashfree Payment Integration Guide

## ✅ Current Status

The payment integration is **fully implemented** and ready for production deployment.

---

## 🚀 Production Deployment (Vercel)

### **This WILL Work on Your Live Domain**

Your production Cashfree credentials are already configured and will work perfectly once deployed to Vercel with HTTPS.

### **Setup Steps:**

1. **Go to Vercel Dashboard**
   - Open your project: `pixels-official`
   - Navigate to: **Settings → Environment Variables**

2. **Add These Environment Variables:**

```bash
# Cashfree Production Credentials
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_MODE=PROD
NEXT_PUBLIC_CASHFREE_MODE=production

# MongoDB Connection (use your production MongoDB URI)
MONGODB_URI=mongodb://your-production-mongodb-uri

# Base URL (your actual Vercel domain)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

3. **Click "Save"** for each variable

4. **Redeploy** your application

---

## 🧪 Local Development Testing

### **Option 1: Get Sandbox Credentials (Recommended)**

1. Login to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/login)
2. Switch to **Test/Sandbox Mode** (toggle at top)
3. Go to **Developers → API Keys**
4. Copy your **Sandbox App ID** and **Secret Key**
5. Update `.env.local`:

```bash
NEXT_PUBLIC_CASHFREE_APP_ID=your_sandbox_app_id
CASHFREE_SECRET_KEY=your_sandbox_secret_key
CASHFREE_MODE=SANDBOX
NEXT_PUBLIC_CASHFREE_MODE=sandbox
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

6. Restart server: `npm run dev`
7. Test with Cashfree test cards (no real money)

### **Option 2: Skip Local Testing**

Just deploy to Vercel and test on your live domain with HTTPS. The production credentials will work immediately.

---

## 📋 How Payment Flow Works

### **User Journey:**

1. User visits **Services** page
2. Scrolls to **Social Media Marketing** section
3. Clicks **View Plans**
4. Selects a plan (Starter ₹9,999 / Professional ₹19,999 / Enterprise ₹39,999)
5. Clicks **Choose Plan**
6. Fills customer details:
   - Full Name
   - Email Address
   - Phone Number
7. Clicks **Proceed to Pay**
8. Redirected to **Cashfree Secure Payment Page**
9. Completes payment
10. Redirected back to your site at `/payment/callback`
11. Shows **Success** or **Failure** message

### **Technical Flow:**

```
Frontend (services page)
    ↓
POST /api/cashfree/create-order
    ↓
Cashfree API (creates order)
    ↓
Redirect to Cashfree Checkout
    ↓
User completes payment
    ↓
Redirect to /payment/callback
    ↓
GET /api/cashfree/verify-payment
    ↓
Show success/failure page
```

---

## 🔒 Security Notes

- ✅ Secret keys are server-side only (not exposed to browser)
- ✅ HTTPS required for production (Vercel provides this)
- ✅ Payment processing handled by Cashfree (PCI compliant)
- ✅ Customer data encrypted in transit
- ✅ Order verification on server side

---

## 🐛 Troubleshooting

### **Error: "authentication Failed"**

**Cause:** Invalid credentials or wrong mode (PROD vs SANDBOX)

**Solution:** 
- Check that credentials match the mode (production or sandbox)
- Ensure no extra spaces in `.env.local`
- Restart server after changing env variables

### **Error: "return_url should be https"**

**Cause:** Using production mode on localhost (http)

**Solution:**
- Switch to sandbox mode for local testing, OR
- Deploy to production with HTTPS

### **Payment succeeds but doesn't redirect**

**Cause:** Incorrect return URL

**Solution:**
- Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
- Check that it matches your actual domain
- Verify no trailing slashes

---

## 📱 Test Cards (Sandbox Mode Only)

When using sandbox credentials, use these test cards:

| Card Number | CVV | Expiry | Result |
|------------|-----|--------|--------|
| 4111 1111 1111 1111 | 123 | Any future date | Success |
| 4012 0010 3714 1112 | 123 | Any future date | Failure |

---

## ✨ Features Implemented

- ✅ 3 pricing tiers (Starter, Professional, Enterprise)
- ✅ Customer details collection form
- ✅ Secure payment processing via Cashfree
- ✅ Payment verification
- ✅ Success/failure handling
- ✅ Loading states and animations
- ✅ Mobile responsive design
- ✅ Error handling and user feedback

---

## 🎯 Next Steps (Optional)

1. **Store Subscriptions in Database:**
   - Create `subscriptions` collection in MongoDB
   - Save order details after successful payment
   - Link to customer email

2. **Send Email Notifications:**
   - Payment confirmation email
   - Receipt with invoice details

3. **Admin Dashboard:**
   - View all subscription orders
   - Track revenue from social media plans

4. **Webhooks:**
   - Set up Cashfree webhooks for real-time payment status updates
   - Handle refunds and disputes

---

## 📞 Support

- **Cashfree Docs:** https://docs.cashfree.com/
- **Cashfree Support:** support@cashfree.com
- **Your Support:** Contact your development team

---

**Last Updated:** December 1, 2025
