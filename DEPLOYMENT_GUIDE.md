# 🚀 Deployment Guide - Pixels Digital Website

## ✅ Pre-Deployment Checklist

### Code Status
- ✅ All code changes committed to Git
- ✅ Pushed to GitHub (main branch)
- ✅ No TypeScript errors
- ✅ Build tested locally

### Features Deployed
1. ✅ **Client Type Categorization**
   - Development clients vs Other clients
   - Dashboard filtering
   - Portal access control

2. ✅ **Payment Link Generation**
   - Cashfree integration
   - One-click payment links
   - Automatic clipboard copy

3. ✅ **Staff Management System**
   - Staff portal for content creators
   - Google Drive file uploads
   - Client assignments
   - Daily content tracking

4. ✅ **Admin Dashboard Updates**
   - Staff management page
   - Daily content view
   - Invoice enhancements

---

## 📋 Vercel Deployment Steps

### Step 1: Push to GitHub ✅ DONE
```bash
git add .
git commit -m "Add client type categorization, payment link generation, and staff management"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Automatic Deployment (If connected)**
- Vercel will automatically detect the push and deploy
- Check your Vercel dashboard for deployment status
- URL: https://vercel.com/mpiyush15/pixels-official

**Option B: Manual Deployment**
1. Go to https://vercel.com
2. Log in to your account
3. Click on your project "pixels-official"
4. Vercel should auto-deploy, or click "Redeploy" button

### Step 3: Configure Environment Variables in Vercel

**CRITICAL**: You must add these environment variables in Vercel dashboard:

Go to: **Project Settings → Environment Variables**

#### Required Variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelsdigital

# Admin Credentials
ADMIN_EMAIL=admin@pixelsdigital.tech
ADMIN_PASSWORD=admin123

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google Drive OAuth (for staff file uploads)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-vercel-domain.vercel.app/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_ACCESS_TOKEN=your_access_token
GOOGLE_DRIVE_FOLDER_ID=1j1w4_MdPh1X8N0NDFkprmLXBkCj2_SRp

# Cashfree Payment Gateway
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_MODE=PROD
NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
```

#### How to Add Variables in Vercel:
1. Go to your project on Vercel
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar
4. For each variable:
   - Click "Add New"
   - Enter **Key** (e.g., MONGODB_URI)
   - Enter **Value** (copy from your local .env.local)
   - Select environment: Production, Preview, Development
   - Click **Save**

### Step 4: Trigger Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋮** menu on latest deployment
3. Click **Redeploy**
4. Select "Use existing Build Cache" (faster)
5. Click **Redeploy**

---

## 🔐 Security Checklist

### Before Going Live:

1. **Change Default Admin Password**
   ```
   Current: admin123
   → Change to a strong password after first login
   ```

2. **Update MongoDB Password**
   - Consider changing from the default password
   - Update MONGODB_URI in Vercel if changed

3. **Verify Cashfree Mode**
   - Ensure `CASHFREE_MODE=PROD` for live payments
   - Test with a small transaction first

4. **Google OAuth Setup**
   - Ensure redirect URI matches your production domain
   - Update GOOGLE_REDIRECT_URI with actual Vercel URL

5. **Remove Test Data**
   - Database should be clean (no dummy data)
   - If needed, you can call the delete endpoint manually

---

## 🧪 Post-Deployment Testing

### Test These Features:

#### 1. Admin Portal
- [ ] Login at `/admin/login`
- [ ] Check dashboard stats
- [ ] Create a new client (development type)
- [ ] Create an invoice
- [ ] Generate payment link
- [ ] Test staff management

#### 2. Client Portal
- [ ] Login at `/client-portal/login`
- [ ] Verify development clients can access
- [ ] Verify "other" clients are blocked
- [ ] Check projects and invoices display

#### 3. Staff Portal
- [ ] Login at `/staff-portal/login`
- [ ] Upload a file to Google Drive
- [ ] Check daily content appears in admin

#### 4. Payment Links
- [ ] Generate a payment link for an invoice
- [ ] Click the link (test in incognito)
- [ ] Verify Cashfree payment page loads
- [ ] Test a small payment (₹1 for testing)

#### 5. Public Pages
- [ ] Homepage: `/`
- [ ] Services: `/services`
- [ ] About: `/about`
- [ ] Contact: `/contact`

---

## 📊 MongoDB Database Setup

Your database is already configured on MongoDB Atlas:
- **Connection**: pixelsagency.664wxw1.mongodb.net
- **Database**: pixelsdigital
- **Collections**:
  - clients
  - invoices
  - projects
  - leads
  - expenses
  - payments
  - staff
  - dailyContent
  - admins

### Initial Admin Setup
After deployment, visit:
```
https://your-domain.vercel.app/admin/init-admin
```
Or use the public init page:
```
https://your-domain.vercel.app/init-admin.html
```

This will create the initial admin user.

---

## 🔍 Monitoring & Troubleshooting

### Check Deployment Logs
1. Go to Vercel dashboard
2. Click on your deployment
3. View **Build Logs** and **Function Logs**

### Common Issues:

**Issue**: Environment variables not working
- **Solution**: Redeploy after adding variables

**Issue**: MongoDB connection fails
- **Solution**: Whitelist Vercel IP (0.0.0.0/0) in MongoDB Atlas

**Issue**: Payment links not generating
- **Solution**: Check Cashfree credentials in env variables

**Issue**: Google Drive uploads fail
- **Solution**: Verify OAuth tokens are valid and refresh token is set

### Debug API Routes
You can test API endpoints directly:
```bash
# Test invoice creation
curl -X POST https://your-domain.vercel.app/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"clientId": "...", ...}'

# Test payment link generation
curl -X POST https://your-domain.vercel.app/api/invoices/[id]/generate-payment-link
```

---

## 📱 Mobile Responsiveness

All pages are mobile-responsive:
- ✅ Admin dashboard
- ✅ Client portal
- ✅ Staff portal
- ✅ Invoice views
- ✅ Public pages

Test on:
- Mobile devices
- Tablets
- Desktop

---

## 🎉 Go Live Checklist

Before announcing:
- [ ] All environment variables configured
- [ ] Admin account created
- [ ] Test payment completed successfully
- [ ] All pages load without errors
- [ ] Mobile responsiveness verified
- [ ] SSL/HTTPS working (automatic with Vercel)
- [ ] Custom domain configured (if applicable)
- [ ] Google Analytics added (optional)

---

## 🔄 Future Updates

To deploy future updates:
```bash
# 1. Make changes locally
# 2. Test thoroughly
npm run dev

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 4. Vercel auto-deploys!
```

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cashfree Docs**: https://docs.cashfree.com
- **Google Drive API**: https://developers.google.com/drive

---

## 🎯 Quick Commands Reference

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Test production build
npm run start        # Run production build locally
npm run lint         # Check for errors
```

### Git Commands
```bash
git status           # Check changes
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push origin main # Push to GitHub
```

### Database Management
```bash
# Connect to MongoDB
mongosh "mongodb+srv://pixelsagency.664wxw1.mongodb.net" --username pixelsagency

# Delete all data (be careful!)
curl -X POST http://localhost:3000/api/admin/delete-all-data
```

---

## ✨ New Features Deployed

1. **Client Type System**
   - Categorize clients as "development" or "other"
   - Filter dashboards to show only dev clients
   - Control portal access by client type

2. **Cashfree Payment Links**
   - One-click payment link generation
   - Shareable URLs for invoices
   - Automatic clipboard copy

3. **Staff Management**
   - Content creator roles
   - Google Drive integration
   - Client assignments
   - Daily content tracking

4. **Enhanced Admin Panel**
   - Staff management page
   - Daily content overview
   - Improved invoice handling

---

## 🚨 Important Notes

1. **Environment Variables**: Must be set in Vercel for production
2. **MongoDB Access**: Whitelist 0.0.0.0/0 in Atlas for Vercel access
3. **Cashfree Mode**: Ensure PROD mode for live payments
4. **Google OAuth**: Update redirect URI to match production domain
5. **Admin Password**: Change default password after first login

---

## 📧 Contact

For deployment issues:
- Email: info@pixelsdigital.tech
- Check Vercel logs for errors
- Review MongoDB Atlas logs
- Test locally first: `npm run dev`

---

**Deployment Date**: December 1, 2025
**Version**: 2.0.0
**Repository**: https://github.com/mpiyush15/pixels-official
