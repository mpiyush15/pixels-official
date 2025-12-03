# 🔄 AWS Credential Rotation Guide

**CRITICAL:** Your AWS credentials are exposed in git history. Rotate them NOW.

---

## 🎯 What We Need to Rotate

1. **AWS SES SMTP Credentials** (for email sending)
   - Currently: `AKIAQXXZQE6UBDQIW6JR`
   - Used by: Email system (login alerts, password reset, etc.)

2. **AWS IAM Access Keys** (for S3 file uploads)
   - Currently: `AKIAQXXZQE6UEUU5NROP`
   - Used by: File upload system (project documents, invoices, etc.)

---

## 📋 Step-by-Step Instructions

### Part 1: Rotate SES SMTP Credentials

#### Option A: Create New SMTP User (Recommended)

1. **Go to AWS SES Console:**
   - https://console.aws.amazon.com/ses
   - Select region: **US East (N. Virginia)** - `us-east-1`

2. **Create New SMTP Credentials:**
   - Left menu → "SMTP settings"
   - Click "Create SMTP credentials"
   - IAM User Name: `ses-smtp-user-2025-dec` (or any name)
   - Click "Create"

3. **Download Credentials:**
   - **IMPORTANT:** Download the CSV file or copy:
     - SMTP Username (starts with `AKIA...`)
     - SMTP Password (long string)
   - **Save these securely!**

4. **Update Your `.env` File:**
   ```bash
   SMTP_USER=NEW_SMTP_USERNAME_HERE
   SMTP_PASSWORD=NEW_SMTP_PASSWORD_HERE
   ```

5. **Delete Old SMTP Credentials:**
   - Go to IAM Console: https://console.aws.amazon.com/iam
   - Left menu → Users
   - Find old SMTP user (might be `ses-smtp-user` or similar)
   - Click user → Security credentials tab
   - Find access key starting with `AKIAQXXZQE6UBDQIW6JR`
   - Click "Make inactive" or "Delete"

---

### Part 2: Rotate S3 IAM Access Keys

1. **Go to IAM Console:**
   - https://console.aws.amazon.com/iam
   - Left menu → Users
   - Click on your user (or the user used for S3)

2. **Create New Access Key:**
   - Click "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Use case: Select "Application running on AWS compute service" or "Other"
   - Click "Next" → Add description (optional): "S3 access - Dec 2025"
   - Click "Create access key"

3. **Download New Credentials:**
   - **IMPORTANT:** Download the CSV or copy:
     - Access Key ID (starts with `AKIA...`)
     - Secret Access Key (long string)
   - **This is the ONLY time you'll see the Secret Key!**

4. **Update Your `.env` File:**
   ```bash
   AWS_ACCESS_KEY_ID=NEW_ACCESS_KEY_ID_HERE
   AWS_SECRET_ACCESS_KEY=NEW_SECRET_ACCESS_KEY_HERE
   ```

5. **Test Locally First:**
   ```bash
   # Start your dev server
   npm run dev
   
   # Test S3 upload
   # Go to admin panel and try uploading a file
   # Or use the test endpoint if you have one
   ```

6. **Delete Old Access Key:**
   - **ONLY after testing the new key works!**
   - Same IAM Console → Security credentials
   - Find access key starting with `AKIAQXXZQE6UEUU5NROP`
   - Click "Make inactive" first (to test)
   - If everything works, click "Delete"

---

## 🔧 Quick Copy-Paste Commands

### Check Current Keys in Your .env
```bash
cd "/Users/mpiyush/Downloads/Pixels digital website"
grep -E "SMTP_USER|AWS_ACCESS_KEY_ID" .env
```

### Backup Current .env (Optional)
```bash
cp .env .env.backup-$(date +%Y%m%d)
```

### After Getting New Keys, Update .env
```bash
# Edit .env file
nano .env

# Or use your preferred editor
code .env
```

---

## ✅ Verification Checklist

After rotating credentials:

### Local Testing
- [ ] Updated `.env` with new SMTP credentials
- [ ] Updated `.env` with new S3 credentials
- [ ] Started dev server: `npm run dev`
- [ ] Tested email sending (password reset or test endpoint)
- [ ] Tested S3 file upload (admin → project → upload document)
- [ ] No errors in console/logs

### AWS Console
- [ ] Old SMTP credentials deleted/deactivated
- [ ] Old S3 access keys deleted/deactivated
- [ ] New credentials are active
- [ ] Confirmed in IAM → Users → Security credentials

### Vercel (After Local Testing)
- [ ] Added new SMTP_USER to Vercel
- [ ] Added new SMTP_PASSWORD to Vercel
- [ ] Added new AWS_ACCESS_KEY_ID to Vercel
- [ ] Added new AWS_SECRET_ACCESS_KEY to Vercel
- [ ] Triggered new deployment
- [ ] Tested production email sending
- [ ] Tested production S3 uploads

---

## 🚨 If Something Goes Wrong

### Email Not Sending
```
Error: "Authentication failed" or "Invalid credentials"
```
**Fix:** Double-check SMTP_USER and SMTP_PASSWORD in `.env` and Vercel

### S3 Upload Failing
```
Error: "Access Denied" or "InvalidAccessKeyId"
```
**Fix:** 
1. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
2. Verify S3 bucket policy allows the new credentials
3. Check IAM user has S3 permissions

### Accidentally Deleted Old Keys Before Testing
**Fix:**
1. Create new keys immediately
2. Update all environments (.env local + Vercel)
3. Redeploy to production

---

## 📊 AWS Best Practices (For Future)

### Set Up Key Rotation Reminders
- Add calendar reminder: Rotate AWS keys every 90 days
- Use AWS CloudWatch to monitor key age

### Use AWS Secrets Manager (Advanced)
Instead of env vars, store secrets in AWS Secrets Manager:
- Automatic rotation
- Audit trail
- Better security
- Small cost: ~$0.40/month per secret

### Monitor AWS CloudTrail
- Check for unauthorized API calls
- Review access patterns
- Set up alerts for suspicious activity

---

## 🎯 Timeline

**Right Now (10 minutes):**
1. Create new SES SMTP credentials
2. Create new S3 IAM access keys
3. Update local `.env`
4. Test locally

**After Local Testing (5 minutes):**
5. Delete old credentials in AWS
6. Update Vercel environment variables
7. Trigger deployment

**After Deployment (5 minutes):**
8. Test production email
9. Test production S3 uploads
10. Monitor logs for 24 hours

---

## 💡 Pro Tips

1. **Never share credentials** via email, Slack, or any chat
2. **Use 1Password or similar** to store credentials securely
3. **Enable AWS MFA** for extra security on your AWS account
4. **Set up AWS billing alerts** to catch unexpected usage
5. **Review IAM policies** - ensure minimal permissions (principle of least privilege)

---

## 📞 Need Help?

### AWS Support
- If you're stuck, AWS has excellent documentation
- https://docs.aws.amazon.com/ses/
- https://docs.aws.amazon.com/IAM/

### Check These If Issues
- AWS Service Health Dashboard: https://status.aws.amazon.com/
- Your AWS Console → Billing (check for suspicious charges)
- CloudTrail logs (check recent API calls)

---

**Created:** December 3, 2025  
**Status:** 🔴 ACTION REQUIRED  
**Estimated Time:** 20 minutes total  
**Difficulty:** Easy (just follow steps)
