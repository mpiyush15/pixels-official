# Vercel Environment Variables - Updated Names

## 🔴 DELETE These Variables (Insecure):
```
❌ NEXT_PUBLIC_CASHFREE_APP_ID
```

## ✅ RENAME These Variables:

### From → To
```
CASHFREE_SECRET_KEY → CASHFREE_CLIENT_SECRET
```

## ➕ ADD These Variables:

```
CASHFREE_CLIENT_ID
(Use the value from old NEXT_PUBLIC_CASHFREE_APP_ID)

NEXTAUTH_URL
(Your production URL: https://www.pixelsdigital.tech)

GOOGLE_CLIENT_ID
(Optional - for Drive integration)

GOOGLE_CLIENT_SECRET
(Optional - for Drive integration)

GOOGLE_REFRESH_TOKEN
(Optional - for Drive integration)

GOOGLE_DRIVE_FOLDER_ID
(Optional - for Drive integration)

GOOGLE_REDIRECT_URI
(Optional: https://www.pixelsdigital.tech/api/auth/google/callback)
```

## 📋 Final Vercel Variables List (Copy-Paste Ready):

### Required Variables:
```
Variable Name: MONGODB_URI
Value: mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelsdigital
Environment: Production, Preview, Development

Variable Name: JWT_SECRET
Value: pixels_digital_super_secret_key_2024
Environment: Production, Preview, Development

Variable Name: NEXTAUTH_SECRET
Value: pixels_nextauth_secret_key_2024
Environment: Production, Preview, Development

Variable Name: NEXTAUTH_URL
Value: https://www.pixelsdigital.tech
Environment: Production

Variable Name: CASHFREE_CLIENT_ID
Value: [Your Cashfree App ID]
Environment: Production, Preview, Development

Variable Name: CASHFREE_CLIENT_SECRET
Value: [Your Cashfree Secret Key]
Environment: Production, Preview, Development

Variable Name: CASHFREE_MODE
Value: PROD
Environment: Production

Variable Name: NEXT_PUBLIC_CASHFREE_MODE
Value: production
Environment: Production

Variable Name: NEXT_PUBLIC_BASE_URL
Value: https://www.pixelsdigital.tech
Environment: Production
```

### Email Configuration (Resend - Temporary):
```
Variable Name: RESEND_API_KEY
Value: [Your Resend API Key - starts with re_]
Environment: Production, Preview, Development

Variable Name: EMAIL_FROM
Value: noreply@pixelsdigital.tech
Environment: Production, Preview, Development
```

### Email Configuration (AWS SES SMTP - RECOMMENDED):
```
Variable Name: SMTP_HOST
Value: email-smtp.us-east-1.amazonaws.com
Environment: Production, Preview, Development

Variable Name: SMTP_PORT
Value: 587
Environment: Production, Preview, Development

Variable Name: SMTP_USER
Value: YOUR_SMTP_USERNAME_HERE
Environment: Production, Preview, Development

Variable Name: SMTP_PASSWORD
Value: YOUR_SMTP_PASSWORD_HERE
Environment: Production, Preview, Development

Variable Name: EMAIL_FROM
Value: noreply@pixelsdigital.tech
Environment: Production, Preview, Development
```

### Optional Variables (Google Drive):
```
Variable Name: GOOGLE_CLIENT_ID
Value: [Your Google Client ID]
Environment: Production, Preview, Development

Variable Name: GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret]
Environment: Production, Preview, Development

Variable Name: GOOGLE_REFRESH_TOKEN
Value: [Your Google Refresh Token]
Environment: Production, Preview, Development

Variable Name: GOOGLE_DRIVE_FOLDER_ID
Value: [Your Drive Folder ID]
Environment: Production, Preview, Development

Variable Name: GOOGLE_REDIRECT_URI
Value: https://www.pixelsdigital.tech/api/auth/google/callback
Environment: Production
```

## 🎯 Vercel Dashboard Actions:

### Step 1: Delete Old Variables
- [ ] Delete: NEXT_PUBLIC_CASHFREE_APP_ID

### Step 2: Update Existing Variables
- [ ] Rename: CASHFREE_SECRET_KEY → CASHFREE_CLIENT_SECRET (keep same value)

### Step 3: Add Missing Variables
- [ ] Add: CASHFREE_CLIENT_ID (use old NEXT_PUBLIC_CASHFREE_APP_ID value)
- [ ] Add: NEXTAUTH_URL = https://www.pixelsdigital.tech
- [ ] Add: SMTP_HOST = email-smtp.us-east-1.amazonaws.com (for email)
- [ ] Add: SMTP_PORT = 587 (for email)
- [ ] Add: SMTP_USER = YOUR_SMTP_USERNAME_HERE (for email)
- [ ] Add: SMTP_PASSWORD = YOUR_SMTP_PASSWORD_HERE (for email)
- [ ] Add: EMAIL_FROM = noreply@pixelsdigital.tech (for email)

### Step 4: Verify These Are Set
- [ ] MONGODB_URI ✓
- [ ] JWT_SECRET ✓
- [ ] NEXTAUTH_SECRET ✓
- [ ] CASHFREE_MODE ✓
- [ ] NEXT_PUBLIC_CASHFREE_MODE ✓
- [ ] NEXT_PUBLIC_BASE_URL ✓

### Step 5: Redeploy
- [ ] Trigger new deployment after changes

## 🔒 Security Comparison:

### Before (INSECURE):
```javascript
// ❌ Exposed to browser - anyone can see this!
process.env.NEXT_PUBLIC_CASHFREE_APP_ID
```

### After (SECURE):
```javascript
// ✅ Server-side only - never exposed to browser
process.env.CASHFREE_CLIENT_ID
process.env.CASHFREE_CLIENT_SECRET
```

### Still Public (SAFE):
```javascript
// ✅ Safe to expose - just configuration, not secrets
process.env.NEXT_PUBLIC_CASHFREE_MODE // "production" or "sandbox"
process.env.NEXT_PUBLIC_BASE_URL // Your website URL
```
