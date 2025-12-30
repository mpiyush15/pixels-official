# SMTP Authentication Failure - Diagnostic Guide

## Current Status
```
✅ SMTP Host: smtp.zeptomail.in (correct)
✅ SMTP Port: 587 (correct)
✅ From Email: noreply@pixelsdigital.tech (correct)
❌ SMTP Password: Authentication Failed (invalid or expired)
```

## How to Fix

### 1. **Verify Your Local Credentials Are Working**
Check your local `.env` file to confirm the password works locally:

```bash
# In terminal, run:
echo $SMTP_PASSWORD
```

If this returns the full API key (long string with +, /, =), your local credentials are fine.

### 2. **Check Zeptomail Account**
Go to https://www.zeptomail.com/ and verify:

- [ ] Account is **Active** (not suspended/locked)
- [ ] Check **Settings → API Keys** section
- [ ] Look for **SMTP Credentials** or **API Token**
- [ ] Confirm the token shows in your account

### 3. **The Most Likely Issue: Vercel Environment Variables**

**IMPORTANT:** The Zeptomail API key in Vercel might be:
- ❌ Missing (not set at all)
- ❌ Incomplete (cut off or truncated)
- ❌ Has extra spaces/newlines
- ❌ Using wrong key (development vs production)

### 4. **Steps to Fix in Vercel**

1. **Go to Vercel Dashboard**
   - Project → Settings → Environment Variables

2. **Look for `SMTP_PASSWORD` in PRODUCTION environment**
   - If it doesn't exist → Add it
   - If it exists → Check if value looks correct

3. **Copy the COMPLETE API key from Zeptomail:**
   ```
   PHtE6r0FR7+52jV+9EVUsPG/FZOsYdh7+Lk0f1ZE5oxKD6BVGk1Xr9kqlGOwoh4sAfQXRvCbmt9r4O/O4bqFc2e7MWpJCmqyqK3sx/VYSPOZsbq6x00asV8dcUfYUYbsetJo0Czfu9fZNA==
   ```

4. **Make sure you're editing PRODUCTION, not Preview/Development**

5. **After updating, go to Deployments → Redeploy**

### 5. **Alternative: Switch to Resend**
If Zeptomail keeps failing, use Resend instead:

1. Go to https://resend.com (free account)
2. Get your API key
3. In Vercel, add: `RESEND_API_KEY=re_xxxxxxxxxxxxx`
4. The code automatically falls back to Resend if SMTP fails

### 6. **Debug: Check Vercel Logs**
1. In Vercel Dashboard → Deployments → Latest
2. Click "Runtime logs"
3. Look for the SMTP Config output
4. Check if `from` email is correct
5. If you see the error, it means password is wrong

## Quick Checklist
```
Zeptomail Side:
- [ ] Account active and not suspended
- [ ] Can login to dashboard
- [ ] SMTP credentials visible in Settings → API Keys
- [ ] API key is complete and not truncated

Vercel Side:
- [ ] SMTP_HOST = smtp.zeptomail.in
- [ ] SMTP_PORT = 587
- [ ] SMTP_USER = emailapikey
- [ ] SMTP_PASSWORD = [complete API key with special chars]
- [ ] EMAIL_FROM = no-reply@pixelsdigital.tech
- [ ] All variables set in PRODUCTION environment
- [ ] Redeployed after adding/updating variables
```

## Still Not Working?

**Option A: Try Resend (Recommended)**
```
1. Sign up at https://resend.com (free)
2. Get API key
3. Add RESEND_API_KEY to Vercel
4. Redeploy
```

**Option B: Contact Zeptomail Support**
```
Email: support@zeptomail.com
Issue: "Getting 535 Authentication Failed with SMTP"
Include: Your Zeptomail account email
```

**Option C: Check Zeptomail Status**
```
Visit: https://status.zeptomail.com/
Check if service is up
```

## Code Supports Both Services
Your email code (`/src/lib/email.ts`) is configured to:
1. Try Zeptomail SMTP first
2. Fall back to Resend if SMTP fails
3. Both will work seamlessly

So if you switch to Resend, just update the environment variable and redeploy!
