# ✅ Vercel Environment Variables Checklist

## 📋 Copy These to Vercel Dashboard

**Location:** Vercel Dashboard → Your Project → Settings → Environment Variables

**For each variable below:**
1. Click "Add New"
2. Enter Name (exactly as shown)
3. Enter Value (from your local `.env`)
4. Select: ✅ Production ✅ Preview ✅ Development
5. Click "Save"

---

## 🔴 Critical Variables (Must Add)

### MongoDB
```
Name: MONGODB_URI
Value: [Your MongoDB connection string]
Environments: Production, Preview, Development
```

### Authentication
```
Name: JWT_SECRET
Value: [Your JWT secret]
Environments: Production, Preview, Development

Name: NEXTAUTH_SECRET
Value: [Your NextAuth secret]
Environments: Production, Preview, Development

Name: NEXTAUTH_URL
Value: https://www.pixelsdigital.tech
Environments: Production
```

### Cashfree Payment Gateway
```
Name: CASHFREE_CLIENT_ID
Value: [Your Cashfree client ID]
Environments: Production, Preview, Development

Name: CASHFREE_CLIENT_SECRET
Value: [Your Cashfree client secret]
Environments: Production, Preview, Development

Name: CASHFREE_MODE
Value: production (or sandbox for testing)
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_CASHFREE_MODE
Value: production (or sandbox for testing)
Environments: Production, Preview, Development
```

---

## 📧 AWS SES SMTP (Email)

⚠️ **IMPORTANT:** Rotate these credentials first in AWS Console!

```
Name: SMTP_HOST
Value: email-smtp.us-east-1.amazonaws.com
Environments: Production, Preview, Development

Name: SMTP_PORT
Value: 587
Environments: Production, Preview, Development

Name: SMTP_USER
Value: [NEW SMTP USERNAME from AWS]
Environments: Production, Preview, Development

Name: SMTP_PASSWORD
Value: [NEW SMTP PASSWORD from AWS]
Environments: Production, Preview, Development

Name: EMAIL_FROM
Value: noreply@pixelsdigital.tech
Environments: Production, Preview, Development
```

---

## 📦 AWS S3 (File Storage)

⚠️ **IMPORTANT:** Rotate these credentials first in AWS Console!

```
Name: AWS_ACCESS_KEY_ID
Value: [NEW ACCESS KEY from AWS]
Environments: Production, Preview, Development

Name: AWS_SECRET_ACCESS_KEY
Value: [NEW SECRET KEY from AWS]
Environments: Production, Preview, Development

Name: AWS_REGION
Value: ap-south-1
Environments: Production, Preview, Development

Name: AWS_BUCKET_NAME
Value: pixels-official
Environments: Production, Preview, Development
```

---

## 🔄 Optional (Google Drive Integration)

Only add if you're using Google Drive:

```
Name: GOOGLE_CLIENT_ID
Value: [Your Google Client ID]
Environments: Production, Preview, Development

Name: GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret]
Environments: Production, Preview, Development

Name: GOOGLE_REFRESH_TOKEN
Value: [Your Google Refresh Token]
Environments: Production, Preview, Development

Name: GOOGLE_DRIVE_FOLDER_ID
Value: [Your Drive Folder ID]
Environments: Production, Preview, Development

Name: GOOGLE_REDIRECT_URI
Value: https://www.pixelsdigital.tech/api/auth/google/callback
Environments: Production
```

---

## ✅ Quick Check Script

After adding variables to Vercel, verify with this script:

```bash
# Run this locally to see what you need to add
cat .env | grep -v "^#" | grep -v "^$" | awk -F= '{print $1}' | sort
```

Expected variables in Vercel (minimum):
- AWS_ACCESS_KEY_ID ✓
- AWS_BUCKET_NAME ✓
- AWS_REGION ✓
- AWS_SECRET_ACCESS_KEY ✓
- CASHFREE_CLIENT_ID ✓
- CASHFREE_CLIENT_SECRET ✓
- CASHFREE_MODE ✓
- EMAIL_FROM ✓
- JWT_SECRET ✓
- MONGODB_URI ✓
- NEXTAUTH_SECRET ✓
- NEXTAUTH_URL ✓
- NEXT_PUBLIC_CASHFREE_MODE ✓
- SMTP_HOST ✓
- SMTP_PASSWORD ✓
- SMTP_PORT ✓
- SMTP_USER ✓

---

## 🎯 After Adding Variables

1. **Trigger a new deployment:**
   ```bash
   git commit --allow-empty -m "trigger: redeploy with new env vars"
   git push origin main
   ```

2. **Or redeploy from Vercel Dashboard:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

3. **Test after deployment:**
   - Test email sending
   - Test file upload to S3
   - Test payment flow
   - Check all API endpoints

---

## 📝 Notes

- **Never commit `.env` file** - it's in `.gitignore` ✓
- **Rotate AWS credentials every 90 days** (AWS best practice)
- **Monitor AWS costs** in AWS Console → Billing
- **Set up billing alerts** if not already configured
- **Review Vercel logs** after first deployment

---

**Last Updated:** December 3, 2025
