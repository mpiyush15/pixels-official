# Environment Variables - Security Update

## ✅ Updated Variable Names (Following Next.js Best Practices)

### Server-Side Only Variables (SAFE - Not exposed to client)
These variables are **ONLY** accessible on the server and are **SECURE**:

```env
# MongoDB
MONGODB_URI=mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelsdigital

# JWT Authentication
JWT_SECRET=pixels_digital_super_secret_key_2024
NEXTAUTH_SECRET=pixels_nextauth_secret_key_2024
NEXTAUTH_URL=https://yourdomain.com

# Cashfree Payment Gateway
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_MODE=PROD

# Google Drive Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
```

### Client-Side Variables (PUBLIC - Exposed to browser)
These variables use `NEXT_PUBLIC_` prefix and are **accessible in the browser**:

```env
# Cashfree Mode (sandbox or production)
NEXT_PUBLIC_CASHFREE_MODE=production

# Base URL for your application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 🔄 Changes Made in Code

### Old Variable Names → New Variable Names

| Old Variable Name | New Variable Name | Status |
|-------------------|-------------------|---------|
| `NEXT_PUBLIC_CASHFREE_APP_ID` | `CASHFREE_CLIENT_ID` | ✅ Updated |
| `CASHFREE_SECRET_KEY` | `CASHFREE_CLIENT_SECRET` | ✅ Updated |
| All other variables | No change (already correct) | ✅ Good |

### Files Updated:
1. ✅ `/src/app/api/cashfree/create-order/route.ts`
2. ✅ `/src/app/api/cashfree/verify-payment/route.ts`
3. ✅ `/src/app/api/invoices/[id]/generate-payment-link/route.ts`
4. ✅ `/.env`

---

## 📋 Vercel Deployment - Environment Variables to Set

Go to your Vercel project → Settings → Environment Variables and add:

### Production Environment

```
MONGODB_URI=mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelsdigital

JWT_SECRET=pixels_digital_super_secret_key_2024

NEXTAUTH_SECRET=pixels_nextauth_secret_key_2024

NEXTAUTH_URL=https://www.pixelsdigital.tech

CASHFREE_CLIENT_ID=<your_production_cashfree_client_id>

CASHFREE_CLIENT_SECRET=<your_production_cashfree_secret>

CASHFREE_MODE=PROD

GOOGLE_CLIENT_ID=<your_google_client_id>

GOOGLE_CLIENT_SECRET=<your_google_client_secret>

GOOGLE_REFRESH_TOKEN=<your_google_refresh_token>

GOOGLE_DRIVE_FOLDER_ID=<your_folder_id>

GOOGLE_REDIRECT_URI=https://www.pixelsdigital.tech/api/auth/google/callback

NEXT_PUBLIC_CASHFREE_MODE=production

NEXT_PUBLIC_BASE_URL=https://www.pixelsdigital.tech
```

---

## ⚠️ Pending Values You Need to Provide

### Cashfree Payment Gateway
1. **CASHFREE_CLIENT_ID**: Get from [Cashfree Dashboard](https://merchant.cashfree.com/)
2. **CASHFREE_CLIENT_SECRET**: Get from Cashfree Dashboard

### Google Drive Integration (Optional - for file uploads)
1. **GOOGLE_CLIENT_ID**: From Google Cloud Console
2. **GOOGLE_CLIENT_SECRET**: From Google Cloud Console
3. **GOOGLE_REFRESH_TOKEN**: Generated after OAuth flow
4. **GOOGLE_DRIVE_FOLDER_ID**: The folder ID where files will be uploaded

---

## 🔒 Security Benefits

### Before (Insecure):
- ❌ `NEXT_PUBLIC_CASHFREE_APP_ID` - Exposed to client, visible in browser
- ❌ Anyone could see your Cashfree App ID in the browser console

### After (Secure):
- ✅ `CASHFREE_CLIENT_ID` - Server-side only, never exposed to client
- ✅ `CASHFREE_CLIENT_SECRET` - Server-side only, never exposed to client
- ✅ Only public config like `NEXT_PUBLIC_CASHFREE_MODE` is exposed

---

## 🚀 Next Steps

1. **Local Development**:
   - Update your `.env` file with the new variable names ✅ (Already done)
   - Restart your dev server: `npm run dev`

2. **Vercel Deployment**:
   - Go to Vercel Dashboard
   - Navigate to: Project → Settings → Environment Variables
   - **Delete old variables**: `NEXT_PUBLIC_CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`
   - **Add new variables**: `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`
   - Redeploy the application

3. **Test Payment Flow**:
   - Test on production with real Cashfree credentials
   - Ensure HTTPS is enabled (required by Cashfree)

---

## 📝 Notes

- **NEXT_PUBLIC_*** variables are bundled into the client-side JavaScript and are visible to anyone
- Variables without **NEXT_PUBLIC_** prefix are only available server-side (in API routes)
- Never expose API secrets, database credentials, or JWT secrets to the client
- Always use HTTPS in production for payment gateways
