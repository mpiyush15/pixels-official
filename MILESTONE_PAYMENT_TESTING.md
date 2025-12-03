# 🔐 Milestone Payment System - Production Testing Guide

## ⚠️ Important: Testing Payments on Live Server

### Current Status
The milestone payment system is **fully implemented** but uses **Cashfree Payment Gateway** which requires proper testing before going live with real transactions.

---

## 🧪 Testing Options

### **Option 1: Sandbox Mode (Recommended for Testing)**

#### Setup:
1. Login to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/login)
2. Switch to **Test/Sandbox Mode** (toggle at top right)
3. Go to **Developers → API Keys**
4. Copy your **Sandbox App ID** and **Secret Key**

#### Add to Vercel Environment Variables:
```bash
CASHFREE_CLIENT_ID=your_sandbox_app_id
CASHFREE_CLIENT_SECRET=your_sandbox_secret_key
CASHFREE_MODE=sandbox
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### Test Cards (No Real Money):
- **Success:** 4111 1111 1111 1111, CVV: 123
- **Failure:** 4012 0010 3714 1112, CVV: 123
- Expiry: Any future date

#### Benefits:
✅ No real money involved
✅ Unlimited testing
✅ Same flow as production
✅ Test all payment scenarios

---

### **Option 2: Production Mode with Test Transactions**

#### Setup:
1. Use your **Production Credentials**
2. Make small test payments (₹1 or ₹10)
3. Verify the full flow
4. Refund test transactions if needed

#### Environment Variables:
```bash
CASHFREE_CLIENT_ID=your_production_client_id
CASHFREE_CLIENT_SECRET=your_production_secret_key
CASHFREE_MODE=production
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### Benefits:
✅ Real payment flow
✅ Tests actual bank integration
✅ Verifies production setup

#### Risks:
⚠️ Real money transactions
⚠️ Refund process needed
⚠️ Bank charges may apply

---

## 🚀 When Going Live

### Before Launch Checklist:

1. **Test Sandbox Mode:**
   - [ ] Test milestone payment flow
   - [ ] Test payment success scenario
   - [ ] Test payment failure scenario
   - [ ] Verify milestone unlocks after payment
   - [ ] Test work submission unlock
   - [ ] Test chat unlock
   - [ ] Check payment history

2. **Verify Environment Variables:**
   - [ ] `CASHFREE_CLIENT_ID` is set (production)
   - [ ] `CASHFREE_CLIENT_SECRET` is set (production)
   - [ ] `CASHFREE_MODE` = "production"
   - [ ] `NEXT_PUBLIC_BASE_URL` matches your domain
   - [ ] MongoDB URI is production database

3. **Security Checks:**
   - [ ] HTTPS enabled (Vercel auto-provides)
   - [ ] API routes protected with authentication
   - [ ] Client-side validation in place
   - [ ] Server-side validation in place

4. **Test One Real Transaction:**
   - [ ] Create project with ₹1 milestone
   - [ ] Client logs in
   - [ ] Clicks "Pay Now"
   - [ ] Completes payment
   - [ ] Verify milestone unlocks
   - [ ] Check payment record in database
   - [ ] Verify email notifications (if enabled)

---

## 🔒 Features That Are Locked

When a project has **unpaid milestones** (amount > ₹0 and status = 'unpaid'):

### Locked for Clients:
❌ **Submit Work** - Disabled until all milestones paid
❌ **Chat** - Disabled until all milestones paid
❌ **Milestone Files** - Hidden until that specific milestone is paid

### Visual Indicators:
- 🔒 Red "Locked" badges
- 🔴 Red background tint on locked milestones
- 💳 "Payment Required" message with amount
- 🚫 Grayed out Submit Work and Chat buttons
- 📝 Helper text: "Pay for locked milestones to unlock features"

### Still Accessible:
✅ View project details
✅ View project status and progress
✅ View milestone names and descriptions
✅ View unlocked milestone files
✅ Access other projects (if they have no locked milestones)

---

## 💡 Payment Flow

### Client Journey:
1. **Views Project** → Sees locked milestones
2. **Clicks "Pay Now"** on locked milestone
3. **Redirects to Cashfree** payment page
4. **Completes Payment** using preferred method:
   - Credit/Debit Card
   - UPI
   - Net Banking
   - Wallets
5. **Redirects Back** to your site
6. **Payment Verified** by server
7. **Milestone Unlocked** automatically
8. **Features Enabled:**
   - ✅ Submit Work button active
   - ✅ Chat button active
   - ✅ Milestone files visible
   - ✅ Green "Unlocked" badge

### What Happens in Background:
1. Order created in Cashfree
2. Payment session generated
3. Client completes payment
4. Cashfree sends callback
5. Server verifies payment status
6. Database updated:
   - `paymentStatus`: 'unpaid' → 'paid'
   - `paidAt`: current timestamp
   - `paidAmount`: milestone amount
7. Payment record created in DB
8. Client sees unlocked milestone

---

## 📊 Database Records

### Payment Record Created:
```javascript
{
  projectId: "...",
  clientId: "...",
  milestoneIndex: 0,
  milestoneName: "Design Phase",
  amount: 10000,
  orderId: "MILESTONE_...",
  paymentMethod: "Online",
  paymentDate: ISODate("2025-12-03T..."),
  status: "completed",
  type: "milestone",
  createdAt: ISODate("2025-12-03T...")
}
```

### Project Updated:
```javascript
{
  milestones: [
    {
      name: "Design Phase",
      amount: 10000,
      paymentStatus: "paid",  // ← Changed from "unpaid"
      paidAt: ISODate("..."), // ← Added
      paidAmount: 10000,      // ← Added
      cashfreeOrderId: "...", // ← Added
      // ... other fields
    }
  ]
}
```

---

## 🛠️ Manual Override (Admin)

Admins can manually unlock milestones without payment:

1. Go to **Admin Dashboard → Projects**
2. Edit project
3. Find milestone
4. Change **Payment Status** dropdown to **"Paid (Unlocked)"**
5. Save project

**Use Cases:**
- Promotional/free access
- Payment adjustments
- Special arrangements
- Testing purposes
- Customer service

---

## 🐛 Troubleshooting

### Payment Not Processing:
1. Check Cashfree credentials are correct
2. Verify `CASHFREE_MODE` matches credentials (sandbox/production)
3. Check browser console for errors
4. Verify HTTPS is enabled

### Milestone Not Unlocking:
1. Check payment callback executed
2. Verify database updated
3. Check server logs
4. Refresh project page

### Buttons Still Disabled:
1. Verify ALL milestones with amounts are paid
2. Check database `paymentStatus` field
3. Hard refresh browser (Ctrl+Shift+R)

---

## 📞 Support

- **Cashfree Docs:** https://docs.cashfree.com/
- **Cashfree Support:** support@cashfree.com
- **Dashboard:** https://merchant.cashfree.com/

---

## ✅ Ready for Production

Once you've tested in sandbox mode and everything works:

1. Switch to **production credentials**
2. Update environment variables in Vercel
3. Redeploy application
4. Test with small real transaction
5. Go live! 🚀

---

**Last Updated:** December 3, 2025
