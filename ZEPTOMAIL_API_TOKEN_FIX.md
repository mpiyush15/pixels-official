# Zeptomail API Token Troubleshooting

## Current Issue
```
❌ Error: 401 Access Denied
Code: TM_4001
```

This means your `ZEPTOMAIL_API_TOKEN` is invalid or incorrect.

## How to Get the Correct Token

### Step 1: Login to Zeptomail Dashboard
1. Go to https://www.zeptomail.com/
2. Login with your account
3. Go to **Settings** (bottom left) → **API Keys**

### Step 2: Find Your API Token
You should see something like:
```
SMTP Credentials:
- Username: emailapikey
- Password: Zoho-enczapikey xxxxxxxxxxxxxxxx

OR

API Token:
Zoho-enczapikey xxxxxxxxxxxxxxxx
```

### Step 3: Copy the COMPLETE Token
The token format should be:
```
Zoho-enczapikey [LONG_STRING_WITH_SPECIAL_CHARS]
```

Examples of correct format:
```
Zoho-enczapikey PHtE6r0FR7+52jV+9EVUsPG/FZOsYdh7+Lk0f1ZE5oxKD6BVGk1Xr9kqlGOwoh4sAfQXRvCbmt9r4O/O4bqFc2e7MWpJCmqyqK3sx/VYSPOZsbq6x00asV8dcUfYUYbsetJo0Czfu9fZNA==
```

## Issues to Check

### ❌ Token is Expired
- Zeptomail API keys can expire
- **Solution**: Regenerate a new key in Zeptomail dashboard

### ❌ Token is for Wrong Account
- Make sure you're logged into correct Zeptomail account
- Some tokens are account-specific

### ❌ Account is Not Activated
- Verify Zeptomail account is fully activated
- Check if sender email is verified

### ❌ Token has Extra Spaces
- Don't add spaces before/after the token
- Don't include comments in the token

## Correct Format in .env

```properties
# ✅ CORRECT - Just the token, nothing else
ZEPTOMAIL_API_TOKEN=Zoho-enczapikey PHtE6r0FR7+52jV+9EVUsPG/FZOsYdh7+Lk0f1ZE5oxKD6BVGk1Xr9kqlGOwoh4sAfQXRvCbmt9r4O/O4bqFc2e7MWpJCmqyqK3sx/VYSPOZsbq6x00asV8dcUfYUYbsetJo0Czfu9fZNA==

# ❌ WRONG - Extra spaces, comments, or incomplete
ZEPTOMAIL_API_TOKEN= Zoho-enczapikey ... # my token
ZEPTOMAIL_API_TOKEN=Zoho-enczapikey PHtE6r0FR7+52jV
```

## Test Your Token Locally

After updating `.env`, test with:
```bash
curl -X GET http://localhost:3000/api/test-smtp-connection
```

You should see:
```json
{
  "success": true,
  "message": "Zeptomail API connection verified successfully"
}
```

If you get 401, the token is wrong.

## Next Steps

1. **Go to Zeptomail Dashboard**
2. **Find your API token** under Settings → API Keys
3. **Copy the COMPLETE token** (including "Zoho-enczapikey" prefix)
4. **Update `.env` file** with the new token
5. **Test locally** with the curl command above
6. **Update Vercel** with the same token
7. **Redeploy** on Vercel

## If Token Keeps Failing

**Option 1: Regenerate Token**
- In Zeptomail Settings → API Keys
- Click "Regenerate" or "Create New"
- Use the newly generated token

**Option 2: Switch to Resend (Backup)**
```bash
# Create free account at https://resend.com
# Get API key
# Add to .env:
RESEND_API_KEY=re_your_key_here
```

Our email service already supports Resend as automatic fallback!

## Verifying Token is Working

The code will automatically test when sending email:
```
📧 Attempting to send email via Zeptomail API to: client@example.com
✅ Email sent successfully via Zeptomail API: [request_id]
```

If you see the ✅, token is valid!
