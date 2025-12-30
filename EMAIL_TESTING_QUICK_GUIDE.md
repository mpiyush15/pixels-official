# Email Notifications - Quick Testing Guide

## 🚀 Quick Start (2-3 minutes)

### Step 1: Create Test Project (Admin)
1. Go to `/admin/dashboard/projects`
2. Click "Add New Project"
3. Fill in details:
   - **Name:** "Email Test Project"
   - **Type:** "Website Design"
   - **Client:** Select a test client
4. Scroll to blue "Contract Content" section
5. Add contract text: "Test contract - please accept this"
6. Click "Create Project"

### Step 2: Accept Contract (Client)
1. Open new browser tab (or logout and login as client)
2. Go to `/client-portal/projects`
3. Find "Email Test Project"
4. Click "Accept Contract to Start" button
5. Review contract in modal
6. Click "Accept Contract" button
7. See success message

### Step 3: Check Email
1. Check email inbox for test client (within 30 seconds)
2. Look for subject: **"Contract Accepted: Email Test Project - Project Started ✅"**
3. Verify content includes:
   - ✅ Client name in greeting
   - ✅ "Email Test Project" in project name
   - ✅ "Website Design" in project type
   - ✅ Today's date in acceptance section
   - ✅ Green "View Your Project" button
   - ✅ Proper formatting (not broken HTML)

### Step 4: Verify Portal Updates
1. Client refreshes `/client-portal/projects`
2. Project status should say "In Progress" (blue badge)
3. "Accept Contract" button gone
4. "Submit Work" and "Chat" buttons now visible
5. "View Contract" button shows contract in read-only mode

✅ **Done!** Email feature is working!

---

## 🔍 Detailed Testing Checklist

### Email Delivery Tests
- [ ] Email arrives in inbox within 30 seconds
- [ ] Email not in spam/junk folder
- [ ] Email displays correctly on desktop
- [ ] Email displays correctly on mobile
- [ ] All links are clickable

### Email Content Tests
- [ ] Subject line contains project name and checkmark
- [ ] Client name in greeting is correct
- [ ] Project name is accurate
- [ ] Project type is accurate
- [ ] Acceptance date is today's date
- [ ] Status update clearly states "In Progress"
- [ ] Next steps are visible and relevant
- [ ] Green button text says "View Your Project"
- [ ] Support email is clickable

### Email Links Tests
- [ ] "View Your Project" button goes to `/client-portal/projects`
- [ ] Support email link opens email client
- [ ] All hyperlinks work correctly

### Portal Integration Tests
- [ ] Project status changes to "In Progress"
- [ ] Client can now submit work
- [ ] Client can now chat
- [ ] Contract is locked (read-only)
- [ ] "View Contract" shows full contract

### Error Scenarios
- [ ] If email fails to send, contract is still accepted
- [ ] Check server logs for email errors
- [ ] If client email missing, contract still accepted (gracefully)

---

## 📋 Testing Data

### Test Client Account
```
Email: test@example.com (or your test email)
Name: Test Client
Portal: /client-portal
Login: Use your test credentials
```

### Test Project Details
```
Name: Email Test Project
Type: Website Design
Contract: [Any text - it's just for testing]
Status Transition: Planning → In Progress
```

### Expected Email
```
From: noreply@pixelsdigital.tech
To: test@example.com
Subject: Contract Accepted: Email Test Project - Project Started ✅
```

---

## 🔧 Troubleshooting

### Email Not Received?

**Check 1: Spam/Junk Folder**
- Email might be filtered
- Add `noreply@pixelsdigital.tech` to contacts

**Check 2: Email Configured?**
- Verify in `.env.local`:
  ```
  SMTP_USER=emailapikey
  SMTP_PASSWORD=<your_zeptomail_password>
  ```

**Check 3: Client Email in Database?**
- Verify test client has email address
- Check MongoDB clients collection:
  ```javascript
  db.collection('clients').findOne({ name: "Test Client" })
  // Should have an 'email' field
  ```

**Check 4: Server Logs**
- Check Vercel logs for errors
- Look for: `Email sending failed:` or `Error sending contract`

### Email Content Wrong?

**Check project data in MongoDB:**
```javascript
db.collection('projects').findOne({ name: "Email Test Project" })
// Verify:
// - name field
// - type field
// - clientId field
```

### Links Not Working?

**Verify environment variable:**
```
NEXT_PUBLIC_BASE_URL=https://yoursite.com
// Must be your actual domain, not localhost
```

---

## 📊 Success Criteria

✅ **Email Test Passes When:**
1. Email received within 30 seconds
2. All dynamic content is correct
3. Email renders properly (not broken HTML)
4. All links work
5. Project portal updates correctly
6. Contract marked as locked/accepted

---

## 📝 Test Log Template

```
Date: _______________
Tester: _______________

Test Case 1: Basic Email Delivery
- Contract accepted at: _______________
- Email received at: _______________
- Time taken: _______________
- Result: ✅ Pass / ❌ Fail

Test Case 2: Email Content
- Client name: _______________
- Project name: _______________
- Acceptance date shown: _______________
- Result: ✅ Pass / ❌ Fail

Test Case 3: Email Links
- View Your Project link: ✅ Works / ❌ Broken
- Support email link: ✅ Works / ❌ Broken
- Result: ✅ Pass / ❌ Fail

Test Case 4: Portal Updates
- Project status changed: ✅ Yes / ❌ No
- Submit Work button visible: ✅ Yes / ❌ No
- Contract locked: ✅ Yes / ❌ No
- Result: ✅ Pass / ❌ Fail

Overall Result: ✅ PASS / ❌ FAIL
Notes: _______________________________________________
```

---

## 🎯 What the Email Shows

### Visual Layout
```
┌─────────────────────────────────┐
│  ✅ CONTRACT ACCEPTED!          │  ← Green header
│  Your project is ready to begin │
└─────────────────────────────────┘
│                                 │
│  Hi John,                        │
│  Thank you for accepting...     │
│                                 │
│  [Contract Accepted on Jan 15]  │  ← Success badge
│                                 │
│  PROJECT DETAILS:               │
│  Project Name: Email Test...   │
│  Project Type: Website Design   │
│  Acceptance Date: January 15    │
│                                 │
│  📊 Status Update:              │  ← Status change
│  "In Progress"...               │
│                                 │
│  What's Next?                   │  ← Next steps
│  1. Monitor progress...         │
│  2. Review submissions...       │
│  3. Chat with team...           │
│  4. Track milestones...         │
│                                 │
│  [View Your Project Button]     │  ← Green button
│                                 │
│  Questions or need help?        │
│  support@pixelsdigital.tech     │
│                                 │
└─────────────────────────────────┘
```

---

## 💡 Tips for Successful Testing

1. **Use test email account** - Easier to track test emails
2. **Check spam folder immediately** - Emails might be filtered initially
3. **Test on mobile** - Important to see responsive design
4. **Test in multiple email clients** - Gmail, Outlook, Apple Mail
5. **Keep server logs open** - Watch for any errors while testing
6. **Use admin project list** - See contract status in real-time
7. **Refresh portal** - Verify project status updates
8. **Check browser console** - Look for any JavaScript errors

---

## 🚀 Advanced Testing

### Test SMTP Connection
```bash
# From terminal, test Zeptomail SMTP
telnet smtp.zeptomail.in 587
# Should connect without error
```

### Test Email Function Directly
```javascript
// In browser console at /admin or /client-portal
// This would require modifying the code temporarily
// Not recommended for production
```

### Check Email Headers
```
When you receive the test email, check headers for:
- X-Mailer: Should show Zeptomail or Resend
- Date: Should be current time
- From: noreply@pixelsdigital.tech
```

---

## 📞 Support

**If testing fails:**
1. Check `/EMAIL_IMPLEMENTATION_COMPLETE.md` for full docs
2. Review `/EMAIL_CODE_CHANGES.md` for code details
3. Check `/CONTRACT_ACCEPTANCE_EMAIL_GUIDE.md` for troubleshooting
4. Review server logs in Vercel dashboard

**Common files to check:**
- `src/lib/email.ts` - Email function
- `src/app/api/projects/[id]/contract/route.ts` - API integration
- `.env.local` - Email configuration

---

## ✅ Final Checklist

Before testing:
- [ ] Zeptomail credentials are in `.env.local`
- [ ] Test client has email address in MongoDB
- [ ] Admin has created contract for test project
- [ ] Test client account can login to `/client-portal`

During testing:
- [ ] Contract acceptance shows success message
- [ ] No errors in browser console
- [ ] Server logs show email was sent
- [ ] Email arrives in inbox

After testing:
- [ ] Email content is correct
- [ ] All links work
- [ ] Portal shows project as "In Progress"
- [ ] Contract is locked/read-only

---

## 📧 Expected Email Properties

| Property | Value |
|----------|-------|
| **From** | noreply@pixelsdigital.tech |
| **To** | client's email address |
| **Subject** | Contract Accepted: [ProjectName] - Project Started ✅ |
| **Content-Type** | text/html |
| **Provider** | Zeptomail (or Resend fallback) |
| **Delivery** | 5-30 seconds |
| **Retry** | Automatic (Zeptomail handles) |

---

**Status: Ready to Test! 🚀**

Follow the Quick Start section above and you should have a working email notification system within 2-3 minutes!
