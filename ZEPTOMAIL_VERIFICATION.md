# Zeptomail SMTP Authentication Error - Troubleshooting Guide

## Issue
Getting `535 Authentication Failed` error on Vercel when sending emails

## Root Causes & Solutions

### 1. ✅ Verify Vercel Environment Variables
**Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if these variables are set:
   - `SMTP_HOST` = `smtp.zeptomail.in`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `emailapikey`
   - `SMTP_PASSWORD` = `PHtE6r0FR7+52jV+9EVUsPG/FZOsYdh7+Lk0f1ZE5oxKD6BVGk1Xr9kqlGOwoh4sAfQXRvCbmt9r4O/O4bqFc2e7MWpJCmqyqK3sx/VYSPOZsbq6x00asV8dcUfYUYbsetJo0Czfu9fZNA==`
   - `EMAIL_FROM` = `no-reply@pixelsdigital.tech`

**Important:** Make sure you're updating production environment variables, not preview/development!

### 2. ✅ Regenerate Zeptomail API Key
If credentials are old or expired, regenerate them:

**Steps in Zeptomail Dashboard:**
1. Login to https://www.zeptomail.com/
2. Go to Settings → API Key
3. Look for "SMTP Access Token" or "API Key"
4. If expired or suspicious, click "Regenerate"
5. Copy the new key
6. Update in Vercel: `SMTP_PASSWORD` with the new key

### 3. ✅ Check Zeptomail Account Status
- Login to Zeptomail dashboard
- Verify account is **Active** (not suspended)
- Check if you have enough email credits
- Verify the sender email is **Verified** in Zeptomail

### 4. ✅ Test SMTP Credentials Locally
Run this command in terminal to test SMTP connection:
```bash
npm run test-smtp
```

This will test if credentials work before deploying to Vercel.

### 5. ✅ Alternative: Use Resend Instead
If Zeptomail is causing issues, switch to Resend:

1. Create free account at https://resend.com
2. Get API key
3. Add to Vercel: `RESEND_API_KEY=re_xxxxx`
4. Our code already supports Resend as fallback

### 6. ✅ Vercel Redeployment
After fixing environment variables:
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find latest deployment
4. Click the 3-dots menu → "Redeploy"
5. Choose "Yes, redeploy" (without rebuilding)

This forces the app to restart with new environment variables.

## Quick Checklist
- [ ] Verified SMTP_USER = `emailapikey` (not email address)
- [ ] Verified SMTP_PASSWORD is complete (full API key with special chars)
- [ ] Checked no extra spaces or newlines in password
- [ ] Regenerated API key in Zeptomail if suspicious
- [ ] Verified Zeptomail account is active
- [ ] Updated Vercel production environment variables
- [ ] Redeployed on Vercel
- [ ] Tested sending email again

## Still Not Working?
1. Check Zeptomail logs for authentication attempts
2. Try switching to Resend as backup
3. Contact Zeptomail support: support@zeptomail.com

## Code Location
Email function: `/src/lib/email.ts` (line ~40-60)
- Primary: Zeptomail SMTP (smtpTransporter)
- Fallback: Resend API

Both are configured to work together!
