# S3 Upload Troubleshooting Guide

## Quick Test

### 1. Check AWS Configuration
Visit: `http://localhost:3000/api/s3/check-config`

**Expected Response:**
```json
{
  "configured": true,
  "details": {
    "AWS_ACCESS_KEY_ID": "Set (20 chars)",
    "AWS_SECRET_ACCESS_KEY": "Set (40 chars)",
    "AWS_REGION": "ap-south-1",
    "AWS_S3_BUCKET_NAME": "pixelsdigital"
  },
  "ready": true
}
```

**If `configured: false`**, you need to set environment variables.

---

## Set Environment Variables

### Local Development (.env.local)
Create or edit `.env.local` file in project root:

```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=pixelsdigital
```

### Vercel Deployment
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (value: `ap-south-1`)
   - `AWS_S3_BUCKET_NAME` (value: `pixelsdigital`)

---

## Common Errors & Solutions

### Error: "S3 upload not configured"
**Cause:** AWS credentials not set in environment variables
**Solution:** 
1. Check `.env.local` file exists in project root
2. Verify variables are set correctly
3. Restart dev server: `npm run dev`

### Error: "AccessControlListNotSupported"
**Cause:** S3 bucket has ACLs disabled (Object Ownership: Bucket owner enforced)
**Solution:** Code now handles this automatically - uploads without ACL

### Error: "AccessDenied"
**Cause:** AWS credentials don't have S3 permissions
**Solution:** 
1. Go to AWS IAM Console
2. Check user has `AmazonS3FullAccess` policy OR custom policy with:
   - `s3:PutObject`
   - `s3:PutObjectAcl` (if using ACLs)
   - `s3:GetObject`

### Error: "NoSuchBucket"
**Cause:** Bucket name is incorrect or doesn't exist
**Solution:**
1. Verify bucket name: `pixelsdigital`
2. Check bucket exists in AWS S3 Console
3. Verify region matches: `ap-south-1`

### Error: "SignatureDoesNotMatch"
**Cause:** AWS Secret Key is incorrect
**Solution:**
1. Verify secret key is correct (no extra spaces)
2. Generate new AWS credentials if needed
3. Update environment variables

---

## Test Upload Process

### 1. Check Console Logs
When uploading a file, check browser console (F12) for:

```
Uploading file: test.jpg Size: 123456 Type: image/jpeg
S3 Key: task-uploads/1234567890-test.jpg
Bucket: pixelsdigital
Region: ap-south-1
Uploading to S3...
S3 upload result: { ... }
File uploaded successfully: https://pixelsdigital.s3.ap-south-1.amazonaws.com/task-uploads/1234567890-test.jpg
```

### 2. Check Server Logs
In your terminal running `npm run dev`, look for:
- AWS credential validation
- Upload progress
- Any error messages

### 3. Test File Access
After upload, try accessing the URL directly:
```
https://pixelsdigital.s3.ap-south-1.amazonaws.com/task-uploads/[your-file]
```

---

## S3 Bucket Permissions

### Public Access Settings
For public file access, ensure:

1. **Block Public Access:** All OFF (or specific settings for GetObject)
2. **Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pixelsdigital/*"
    }
  ]
}
```

3. **Object Ownership:**
   - If "Bucket owner enforced": ACLs disabled (code handles this)
   - If "Object writer": ACLs enabled (can use public-read ACL)

---

## Enhanced Error Logging

The upload endpoint now provides detailed error information:

```json
{
  "error": "Failed to upload file",
  "details": "Error message here",
  "code": "ErrorCode"
}
```

Check these in:
- Browser Network tab → Response
- Browser Console → Error logs
- Server terminal → Full error stack

---

## Verification Steps

1. ✅ Run config check: `/api/s3/check-config`
2. ✅ Verify all 4 environment variables are set
3. ✅ Check AWS credentials are valid
4. ✅ Verify S3 bucket exists and accessible
5. ✅ Test upload from staff task page
6. ✅ Check console for upload logs
7. ✅ Verify file appears in S3 bucket
8. ✅ Test file URL is accessible

---

## Need Help?

If upload still fails:
1. Share the error from browser console
2. Share the error from server logs
3. Share response from `/api/s3/check-config`
4. Verify AWS IAM permissions
5. Check S3 bucket region matches environment variable
