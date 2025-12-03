# 📧 Email Setup Guide - Pixels Digital

## Overview
Complete email notification system for login alerts, payment confirmations, password resets, and more.

---

## 🚀 Quick Start (Using Resend - Recommended for Now)

### Step 1: Get Resend API Key (Free Tier)
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your domain OR use `onboarding@resend.dev` for testing (100 emails/day)
4. Go to **API Keys** section
5. Create a new API key
6. Copy the key (starts with `re_`)

### Step 2: Add Environment Variables

Add to your `.env.local` (for development):
```bash
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@pixelsdigital.tech
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Add to **Vercel Environment Variables** (for production):
```
Variable Name: RESEND_API_KEY
Value: re_your_api_key_here
Environment: Production, Preview, Development

Variable Name: EMAIL_FROM
Value: noreply@pixelsdigital.tech
Environment: Production, Preview, Development

Variable Name: NEXT_PUBLIC_BASE_URL (if not already set)
Value: https://www.pixelsdigital.tech
Environment: Production
```

### Step 3: Test Email System
```bash
# In terminal
curl -X POST http://localhost:3000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","testType":"Configuration Test"}'
```

---

## 📨 Email Features Implemented

### 1. ✅ Welcome Email
**Sent when:** New client is created with portal access
**Includes:** 
- Welcome message
- Portal login link
- Support contact

**Trigger:** Automatic when client is added in admin panel

### 2. 🔐 Login Alert Email
**Sent when:** Client logs into portal
**Includes:**
- Login timestamp
- IP address
- Security notice

**Trigger:** Automatic on successful login

### 3. 🔑 Password Reset Email
**Sent when:** Client requests password reset
**Includes:**
- Secure reset link (expires in 1 hour)
- Security warning
- Support contact

**Trigger:** 
```bash
POST /api/email/password-reset
Body: { "email": "client@example.com" }
```

### 4. 💰 Payment Confirmation Email
**Sent when:** Payment is successfully processed
**Includes:**
- Payment amount
- Transaction ID
- Payment date
- Portal link to view receipt

**Trigger:** Automatic after Cashfree payment verification

### 5. ⏰ Payment Reminder Email
**Sent when:** Invoice is due soon
**Includes:**
- Due amount
- Invoice number
- Due date
- Payment link

**Trigger:** Manual or scheduled (implement cron job)

### 6. 📄 Invoice Email
**Sent when:** New invoice is generated
**Includes:**
- Invoice details
- Line items
- Total amount
- View invoice link

**Trigger:** When invoice is created

### 7. 🚀 Project Update Email
**Sent when:** Project status changes or updates
**Includes:**
- Project name
- Update message
- View project link

**Trigger:** When project is updated

---

## 🔄 Migration to AWS SES (When Production Access Approved)

### Prepare AWS SES
1. Your domain is already configured on AWS SES
2. Wait for production access approval
3. Get AWS credentials

### Update Environment Variables
```bash
# Remove or keep Resend key as backup
# RESEND_API_KEY=re_your_key

# Add AWS SES configuration
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
EMAIL_FROM=noreply@pixelsdigital.tech
```

### Update Code (Already Prepared)
The `src/lib/email.ts` file is ready to support AWS SES. Just uncomment the AWS SES section:

```typescript
// TODO: Add AWS SES support when production access is approved
if (process.env.AWS_SES_REGION) {
  const ses = new AWS.SES({ region: process.env.AWS_SES_REGION });
  // Implementation here
}
```

---

## 📊 Email Limits

### Resend Free Tier
- **3,000 emails/month**
- **100 emails/day** with test domain
- **Unlimited** with verified domain
- Perfect for initial launch

### AWS SES Sandbox (Current)
- **200 emails/day**
- Only to verified emails
- Request production access for unlimited

### AWS SES Production (After Approval)
- **50,000 emails/day** (can be increased)
- Send to any email address
- $0.10 per 1,000 emails

---

## 🧪 Testing Emails Locally

### Test Welcome Email
```bash
curl -X POST http://localhost:3000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "testType": "Welcome Email Test"
  }'
```

### Test All Email Types
Create a test page at `src/app/admin/test-emails/page.tsx`:
```typescript
'use client';
import { useState } from 'react';

export default function TestEmails() {
  const [email, setEmail] = useState('');
  
  const testEmail = async (type: string) => {
    await fetch('/api/email/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, testType: type })
    });
    alert(`${type} email sent to ${email}`);
  };

  return (
    <div className="p-8">
      <h1>Email Testing</h1>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="border p-2 rounded"
      />
      <div className="mt-4 space-y-2">
        <button onClick={() => testEmail('Welcome')} className="btn">Test Welcome</button>
        <button onClick={() => testEmail('Login Alert')} className="btn">Test Login Alert</button>
        <button onClick={() => testEmail('Password Reset')} className="btn">Test Password Reset</button>
        <button onClick={() => testEmail('Payment')} className="btn">Test Payment</button>
      </div>
    </div>
  );
}
```

---

## 🎯 Next Steps

### Immediate (Before AWS SES Production)
1. ✅ Install Resend package (Done)
2. ✅ Create email templates (Done)
3. ✅ Integrate with auth flows (Done)
4. 🔲 Get Resend API key
5. 🔲 Test all email types
6. 🔲 Deploy to Vercel

### After AWS SES Production Access
1. Update environment variables
2. Uncomment AWS SES code in `email.ts`
3. Test with AWS SES
4. Remove Resend dependency (optional - keep as backup)

### Future Enhancements
1. **Scheduled Payment Reminders**
   - Create cron job (Vercel Cron or AWS Lambda)
   - Check invoices due in 3 days
   - Send reminder emails

2. **Email Templates Dashboard**
   - Admin UI to customize email templates
   - Preview emails before sending
   - Track email delivery status

3. **Email Analytics**
   - Track open rates
   - Track click rates
   - Monitor bounce rates

4. **Bulk Emails**
   - Newsletter functionality
   - Client announcements
   - Marketing campaigns

---

## 🔒 Security Best Practices

### ✅ Already Implemented
- Server-side only email sending (no client exposure)
- Password reset tokens expire in 1 hour
- Secure token generation with JWT
- Rate limiting consideration

### 📝 Recommendations
1. **Rate Limiting:** Add rate limiting to prevent email spam
2. **Email Verification:** Verify client emails before sending sensitive info
3. **Unsubscribe:** Add unsubscribe link for marketing emails
4. **SPF/DKIM:** Configure for better deliverability (done on AWS SES domain)

---

## 🆘 Troubleshooting

### Emails Not Sending
1. Check environment variables are set correctly
2. Verify Resend API key is valid
3. Check email address is valid
4. Look at server logs for errors

### Emails Going to Spam
1. Verify domain with Resend
2. Set up SPF, DKIM records
3. Use professional email content
4. Avoid spam trigger words

### Wrong Email Content
1. Check client name and data in database
2. Verify BASE_URL is set correctly
3. Test with different clients

---

## 📞 Support

**Email Issues:** Check server logs in Vercel
**Resend Support:** support@resend.com
**AWS SES Support:** AWS Support Console

---

## ✅ Deployment Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] Environment variables added to Vercel
- [ ] Test email sent successfully
- [ ] Welcome email tested
- [ ] Login alert tested
- [ ] Password reset flow tested
- [ ] Payment confirmation tested
- [ ] Production deployment successful
- [ ] Monitor email delivery for first week

---

**Created:** December 2, 2025  
**Status:** ✅ Ready for Testing  
**Priority:** High - Required for production launch
