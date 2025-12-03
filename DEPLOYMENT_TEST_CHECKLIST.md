# ✅ Vercel Deployment & Testing Checklist

## 🎯 Current Status: Environment Variables Added to Vercel

All environment variables have been added to Vercel Dashboard.

---

## 🚀 Next Steps

### Step 1: Trigger Deployment

**Option A: Automatic Deployment (Recommended)**
Your push to `main` branch should trigger auto-deployment in Vercel.

Check deployment status:
- Go to: https://vercel.com/dashboard
- Select your project
- Check "Deployments" tab
- Latest commit should be deploying/deployed

**Option B: Manual Redeploy (if needed)**
```bash
# Trigger empty commit to force redeploy
cd "/Users/mpiyush/Downloads/Pixels digital website"
git commit --allow-empty -m "deploy: trigger redeploy with env vars"
git push origin main
```

**Option C: Redeploy from Dashboard**
1. Vercel Dashboard → Your Project
2. Deployments tab
3. Click "..." on latest deployment
4. Click "Redeploy"
5. Check "Use existing Build Cache" (optional)

---

## ✅ Post-Deployment Testing Checklist

### 1. Basic Health Check
- [ ] Visit: https://www.pixelsdigital.tech
- [ ] Homepage loads without errors
- [ ] Check browser console for errors (F12)
- [ ] Navigation works (all pages load)

### 2. Admin Authentication
- [ ] Go to: https://www.pixelsdigital.tech/admin/login
- [ ] Log in with admin credentials
- [ ] Dashboard loads successfully
- [ ] No console errors

### 3. MongoDB Connection
- [ ] Admin dashboard shows data (clients, projects, etc.)
- [ ] Create a test client (check if saves to DB)
- [ ] View existing data
- [ ] Check Vercel logs for DB connection errors

### 4. AWS S3 File Upload
- [ ] Go to: Admin → Projects → Any Project
- [ ] Try uploading a document/file
- [ ] File uploads successfully
- [ ] File URL is accessible
- [ ] Check Vercel logs for S3 errors

**Test URL format should be:**
```
https://pixels-official.s3.ap-south-1.amazonaws.com/...
```

### 5. Email System (SMTP)
- [ ] Client Portal → Forgot Password
- [ ] Enter test email address
- [ ] Check if email is sent
- [ ] If fails, check Vercel logs for SMTP errors

**Note:** Email might fail if AWS SES is in sandbox mode and recipient email is not verified.

### 6. Payment System (Cashfree)
- [ ] Create test invoice with payment link
- [ ] Click payment link
- [ ] Cashfree payment page loads
- [ ] Mode shows correct environment (production/sandbox)

### 7. Client Portal
- [ ] Go to: https://www.pixelsdigital.tech/client-portal/login
- [ ] Log in with test client credentials
- [ ] Dashboard loads with projects
- [ ] View project details
- [ ] Check if files/documents load

---

## 🔍 How to Check Vercel Logs

### Real-time Logs (Recommended)
1. Vercel Dashboard → Your Project
2. Click on latest deployment
3. Click "View Function Logs" or "Logs" tab
4. Watch for errors in real-time as you test

### Function Logs
```
Look for these patterns:

✅ Good:
- "API route executed successfully"
- "Connected to MongoDB"
- "File uploaded to S3"

❌ Errors to watch for:
- "ENOTFOUND" → DNS/network issue
- "Authentication failed" → Wrong credentials
- "Access denied" → Permissions issue
- "Cannot connect to MongoDB" → MONGODB_URI issue
- "InvalidAccessKeyId" → AWS keys wrong
```

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Environment variable not defined"
**Fix:**
1. Verify variable name matches exactly in Vercel
2. Check it's enabled for Production environment
3. Redeploy after adding variable

### Issue: MongoDB connection timeout
**Fix:**
1. Check MONGODB_URI is correct
2. Verify MongoDB Atlas allows Vercel IPs (set to 0.0.0.0/0)
3. Check MongoDB Atlas cluster is running

### Issue: S3 Access Denied
**Fix:**
1. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
2. Check IAM user has S3 permissions
3. Verify bucket name matches: `pixels-official`

### Issue: Email not sending
**Fix:**
1. Check SMTP credentials are correct
2. If AWS SES sandbox mode:
   - Verify recipient email in AWS Console
   - Or request production access
3. Check Vercel logs for detailed error

### Issue: Cashfree payment not loading
**Fix:**
1. Verify CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET
2. Check CASHFREE_MODE matches your Cashfree account
3. Verify NEXT_PUBLIC_CASHFREE_MODE is set

---

## 📊 Environment Variables Verification

Quick check that all variables are set:

```bash
# From Vercel Dashboard → Project → Settings → Environment Variables
# You should see:

✅ MongoDB (1 variable)
- MONGODB_URI

✅ Authentication (3 variables)
- JWT_SECRET
- NEXTAUTH_SECRET
- NEXTAUTH_URL

✅ Cashfree (4 variables)
- CASHFREE_CLIENT_ID
- CASHFREE_CLIENT_SECRET
- CASHFREE_MODE
- NEXT_PUBLIC_CASHFREE_MODE

✅ AWS S3 (4 variables)
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- S3_BUCKET_NAME (or AWS_BUCKET_NAME)

✅ SMTP Email (5 variables)
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- EMAIL_FROM

✅ Optional Google Drive (5 variables if used)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REFRESH_TOKEN
- GOOGLE_DRIVE_FOLDER_ID
- GOOGLE_REDIRECT_URI

✅ Public Variables (1 variable)
- NEXT_PUBLIC_BASE_URL (optional)
```

---

## 🎯 Success Criteria

Deployment is successful when:
- [x] All environment variables in Vercel
- [ ] Deployment completed without errors
- [ ] Homepage loads
- [ ] Admin login works
- [ ] Database queries work
- [ ] S3 file upload works
- [ ] At least one feature works end-to-end

---

## 🔐 Security Reminder

⚠️ **IMPORTANT:** Your AWS credentials are still exposed in git history (commit `6c42b558`).

**After verifying everything works, you should:**
1. Rotate AWS SMTP credentials in AWS Console
2. Rotate AWS S3 access keys in AWS Console
3. Update `.env` locally with new keys
4. Update Vercel with new keys
5. Test again

See `AWS_CREDENTIAL_ROTATION_GUIDE.md` for detailed steps.

---

## 📞 If You Need Help

### Check Vercel Logs First
Most issues show up in logs with clear error messages.

### Test Locally First
If production fails, test locally:
```bash
npm run dev
# Test the failing feature
# Check terminal logs
```

### Rollback if Needed
If deployment breaks production:
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

## 🎉 All Set!

Your environment is configured. Now:
1. ✅ Wait for deployment to complete
2. ✅ Test each feature
3. ✅ Monitor logs for 24 hours
4. ⚠️ Schedule AWS credential rotation

---

**Last Updated:** December 3, 2025  
**Status:** Ready for Testing
