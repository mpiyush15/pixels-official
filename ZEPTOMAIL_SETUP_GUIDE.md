# Zeptomail Configuration & Troubleshooting

## Current Setup
- **Email Service**: Zeptomail (via official SDK)
- **API Token Format**: `Zoho-enczapikey [TOKEN]`
- **Status**: Configured but may need verification

## Your Current Token
```
ZEPTOMAIL_API_TOKEN=Zoho-enczapikey PHtE6r0PFr++328p9UdW7PGxR8OiMY4q/eNhLwBOsoxFXKBQFk0AqtsowWflrkt4UqFCR6abz4Jq47zO4L6EcD67Nm5MXGqyqK3sx/VYSPOZsbq6x00esFkbdkTfVoXrdtBt0i3UvNbSNA==
```

✅ **Format is correct!**

## Why It Might Still Be Failing

### 1. ❌ Token is Expired
- Zeptomail API keys can expire after 30 days
- Solution: Regenerate new token

### 2. ❌ Token is for Different Account
- Each Zeptomail account has its own tokens
- Solution: Verify you're using token from correct account

### 3. ❌ Email Not Verified in Zeptomail
- Sender email must be verified in Zeptomail dashboard
- Your sender: `no-reply@pixelsdigital.tech`
- Solution: Verify this email in Zeptomail settings

### 4. ❌ Account Restrictions
- Some Zeptomail accounts have sending limits
- New accounts might have verification pending

## How to Fix

### Step 1: Verify Zeptomail Account
1. Go to https://www.zeptomail.com/
2. Login to your account
3. Check **Settings → Sender Addresses**
4. Verify `no-reply@pixelsdigital.tech` is marked as ✅ Verified
5. If not, click "Verify" and follow email confirmation

### Step 2: Check API Key
1. Go to **Settings → API Keys**
2. Look for your current key
3. Check if it shows "Active" status
4. If expired, click "Regenerate" to get new key
5. Copy the NEW key and update in `.env`

### Step 3: Update .env File
```properties
ZEPTOMAIL_API_TOKEN=Zoho-enczapikey [NEW_KEY_HERE]
```

### Step 4: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## Quick Test

### Option 1: Using curl
```bash
curl -X POST https://api.zeptomail.com/v1.1/email \
  -H "Authorization: Zoho-enczapikey YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {"address": "no-reply@pixelsdigital.tech", "name": "Test"},
    "to": [{"email_address": {"address": "your-email@gmail.com"}}],
    "subject": "Test",
    "htmlbody": "<p>Test</p>"
  }'
```

### Option 2: Using provided script
```bash
bash test-zeptomail.sh
```

### Option 3: In app
Visit: `http://localhost:3000/api/test-smtp-connection`

## If Zeptomail Keeps Failing

### Switch to Resend (Recommended Backup)
1. Create free account at https://resend.com
2. Get API key (starts with `re_`)
3. Add to `.env`:
```properties
RESEND_API_KEY=re_your_key_here
```
4. Our code will automatically use Resend as fallback

**Our system supports BOTH:**
- Primary: Zeptomail SDK
- Fallback: Resend API
- If Zeptomail fails, it automatically tries Resend!

## Email Templates Configured

All these emails will work:
- ✅ Contract Acceptance Email
- ✅ Payment Logged Email
- ✅ Project Created Email
- ✅ Send Login Credentials Email
- ✅ Welcome Email
- ✅ Custom notification emails

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token is invalid/expired - regenerate in Zeptomail |
| 403 Forbidden | Sender email not verified - verify in Zeptomail settings |
| 429 Too Many Requests | Rate limit - wait or upgrade account |
| Connection Timeout | Network issue - check internet or Zeptomail status |
| Deprecated warning | From zeptomail SDK - safe to ignore |

## Need Help?

1. **Zeptomail Support**: support@zeptomail.com
2. **Check Status**: https://status.zeptomail.com/
3. **Use Resend as backup**: Free and reliable alternative

---

**Remember**: The deprecation warning about `url.parse()` is from the zeptomail package itself - it's safe to ignore and doesn't affect functionality.
