# 🚀 Vercel Environment Variables Setup - AWS Edition

## 📋 Quick Answer: Where to Add AWS Keys in Vercel

Your `.env` file is **LOCAL ONLY** - Vercel doesn't have access to it!

You need to manually add all environment variables to Vercel Dashboard.

---

## 🔴 CRITICAL: Add These AWS Variables to Vercel

### Step-by-Step Process

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `pixels-official`
   - Go to: **Settings → Environment Variables**

2. **Add Each Variable Below**

---

## 📝 All Environment Variables for Vercel

### 🔵 AWS S3 Configuration (For File Uploads)

```
Variable Name: AWS_ACCESS_KEY_ID
Value: [Copy from your .env file]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: AWS_SECRET_ACCESS_KEY
Value: [Copy from your .env file]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: AWS_REGION
Value: ap-south-1
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: S3_BUCKET_NAME
Value: pixels-official
Environment: ✓ Production ✓ Preview ✓ Development
```

---

### 📧 AWS SES SMTP (For Email Sending)

```
Variable Name: SMTP_HOST
Value: email-smtp.us-east-1.amazonaws.com
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: SMTP_PORT
Value: 587
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: SMTP_USER
Value: [Copy from your .env file]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: SMTP_PASSWORD
Value: [Copy from your .env file]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: EMAIL_FROM
Value: noreply@pixelsdigital.tech
Environment: ✓ Production ✓ Preview ✓ Development
```

---

### 🗄️ MongoDB

```
Variable Name: MONGODB_URI
Value: [Your MongoDB connection string]
Environment: ✓ Production ✓ Preview ✓ Development
```

---

### 🔐 Authentication

```
Variable Name: JWT_SECRET
Value: [Your JWT secret]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: NEXTAUTH_SECRET
Value: [Your NextAuth secret]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: NEXTAUTH_URL
Value: https://www.pixelsdigital.tech
Environment: ✓ Production
```

```
Variable Name: NEXTAUTH_URL
Value: https://preview-url.vercel.app
Environment: ✓ Preview
```

```
Variable Name: NEXTAUTH_URL
Value: http://localhost:3000
Environment: ✓ Development
```

---

### 💳 Cashfree Payment Gateway

```
Variable Name: CASHFREE_CLIENT_ID
Value: [Your Cashfree Client ID]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: CASHFREE_CLIENT_SECRET
Value: [Your Cashfree Client Secret]
Environment: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: CASHFREE_MODE
Value: production
Environment: ✓ Production
```

```
Variable Name: CASHFREE_MODE
Value: sandbox
Environment: ✓ Preview ✓ Development
```

```
Variable Name: NEXT_PUBLIC_CASHFREE_MODE
Value: production
Environment: ✓ Production
```

```
Variable Name: NEXT_PUBLIC_CASHFREE_MODE
Value: sandbox
Environment: ✓ Preview ✓ Development
```

---

## 🎯 How It Works

### Local Development (.env file)
```
Your Computer
├── .env (contains all secrets)
└── Next.js reads from .env automatically
```

### Production (Vercel)
```
Vercel Servers
├── NO .env file (not deployed)
├── Vercel Dashboard → Environment Variables
└── Next.js reads from process.env (populated by Vercel)
```

---

## 🔒 Security Model

### ✅ What's Safe
- `.env` file in `.gitignore` ✓
- AWS keys in Vercel Dashboard ✓
- Environment variables never in code ✓

### ❌ What's NOT Safe
- Hardcoding keys in code ✗
- Committing `.env` to git ✗
- Putting keys in documentation ✗

---

## 📖 How Your Code Uses These Variables

### Example: S3 File Upload
```typescript
// In src/lib/s3.ts
const s3Client = new S3Client({
  region: process.env.AWS_REGION,           // ← Vercel provides this
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,      // ← Vercel provides this
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // ← Vercel provides this
  },
});
```

### Example: Email Sending
```typescript
// In src/lib/email.ts
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // ← Vercel provides this
  port: process.env.SMTP_PORT,        // ← Vercel provides this
  auth: {
    user: process.env.SMTP_USER,      // ← Vercel provides this
    pass: process.env.SMTP_PASSWORD,  // ← Vercel provides this
  },
});
```

**The same code works in both local and production!**

---

## 🚀 Step-by-Step Deployment

### Step 1: Copy Values from .env
```bash
# Open your .env file
cat .env

# Copy each value one by one
```

### Step 2: Add to Vercel Dashboard
```
1. Open Vercel Dashboard
2. Click Settings → Environment Variables
3. For EACH variable above:
   - Click "Add New"
   - Enter Variable Name (exact spelling!)
   - Paste Value from .env
   - Check: Production, Preview, Development
   - Click Save
```

### Step 3: Redeploy
```bash
# After adding all variables, redeploy your app
git commit --allow-empty -m "Trigger redeploy with new env vars"
git push origin main

# OR click "Redeploy" in Vercel Dashboard
```

### Step 4: Verify
```bash
# Test S3 upload in production
curl -X POST https://www.pixelsdigital.tech/api/s3/generate-presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf","folder":"test"}'

# Test email sending in production
curl -X POST https://www.pixelsdigital.tech/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","testType":"Production Test"}'
```

---

## ❓ Common Questions

### Q: Do I need to commit .env to git?
**A:** NO! Never commit .env. Vercel reads from Dashboard variables.

### Q: What if I update my AWS keys?
**A:** 
1. Update in `.env` (local)
2. Update in Vercel Dashboard (production)
3. Redeploy

### Q: Can I have different keys for production vs development?
**A:** Yes! You can set different values for each environment in Vercel.

### Q: How do I check if environment variables are set correctly?
**A:** 
```typescript
// Add this to any API route to debug
console.log({
  hasS3Key: !!process.env.AWS_ACCESS_KEY_ID,
  hasS3Secret: !!process.env.AWS_SECRET_ACCESS_KEY,
  hasSmtpUser: !!process.env.SMTP_USER,
  region: process.env.AWS_REGION,
});
```

### Q: What if I see "AWS credentials not configured"?
**A:** Variables not set in Vercel. Follow steps above.

---

## 🎯 Quick Checklist

- [ ] All AWS S3 variables added to Vercel (4 variables)
- [ ] All AWS SES SMTP variables added to Vercel (5 variables)
- [ ] All MongoDB/Auth variables added to Vercel
- [ ] All Cashfree variables added to Vercel
- [ ] Redeployed application
- [ ] Tested S3 upload in production
- [ ] Tested email sending in production
- [ ] No errors in Vercel logs

---

## 📞 Troubleshooting

### Error: "CredentialsProviderError: Could not load credentials"
**Cause:** AWS credentials not set in Vercel  
**Fix:** Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to Vercel Dashboard

### Error: "SMTP connection failed"
**Cause:** SMTP credentials not set in Vercel  
**Fix:** Add SMTP_USER and SMTP_PASSWORD to Vercel Dashboard

### Error: "Environment variable not found"
**Cause:** Typo in variable name or not set  
**Fix:** Check spelling matches exactly (case-sensitive!)

---

## ✅ Summary

**Local Development:**
- Uses `.env` file automatically
- Never commit this file

**Production (Vercel):**
- Uses Vercel Dashboard Environment Variables
- Add ALL variables manually
- Same variable names as .env
- Works exactly the same in code!

**Remember:** Your code uses `process.env.VARIABLE_NAME` - it works the same locally and in production!

---

**Created:** December 3, 2025  
**Status:** Ready for Deployment  
**Next Step:** Add variables to Vercel Dashboard
