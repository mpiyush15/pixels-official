# 🔧 Email Not Sending - Debug Guide

## ✅ Fixed Issues

### Issue 1: Wrong Field Names in API
**Problem:** Code was using `project.name` and `project.type` but the actual fields are `projectName` and `projectType`

**Fixed:** Updated `/src/app/api/projects/[id]/contract/route.ts` to use correct field names:
```typescript
// BEFORE (WRONG)
project.name || 'Project'
project.type || 'Web Development'

// AFTER (CORRECT)
project.projectName || 'Project'
project.projectType || 'Web Development'
```

### Issue 2: No Debug Logging
**Added:** Comprehensive console logs to help debug:
```typescript
console.log('Sending contract acceptance email to:', client.email);
console.log('Email result:', emailResult);
console.log('Email sent successfully:', emailResult.messageId);
console.log('Client not found or no email:', { client, clientId });
```

---

## 🔍 How to Debug Now

### Step 1: Check Server Logs
When you accept a contract, open the terminal where `npm run dev` is running and look for:

```
Sending contract acceptance email to: client@example.com
SMTP Config: { host: 'smtp.zeptomail.in', port: '587', from: 'noreply@pixelsdigital.tech' }
✅ Email sent successfully via SMTP: msg_XXXXX
```

### Step 2: Test Email Sending

**Create a test project:**
1. Go to `/admin/dashboard/projects`
2. Create new project:
   - Name: "Email Test"
   - Type: "Website Design"
   - Client: Select a client
   - Add contract text

**Accept as client:**
1. Go to `/client-portal/projects`
2. Find "Email Test" project
3. Click "Accept Contract to Start"
4. Click "Accept Contract"
5. **Watch the server logs** - should see debug messages

### Step 3: Verify Environment Variables

Check your `.env.local` has these:
```
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=your_actual_password
EMAIL_FROM=noreply@pixelsdigital.tech
```

---

## 🚨 Common Issues & Fixes

### Issue: "Client not found or no email"
**Cause:** Client in database doesn't have email or clientId is wrong

**Fix:**
1. Check MongoDB `clients` collection
2. Verify client has `email` field
3. Verify client `_id` matches in project

### Issue: "Email service not configured"
**Cause:** SMTP credentials missing in `.env.local`

**Fix:**
```
Make sure in .env.local:
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=<your password>
```

### Issue: SMTP Error
**Cause:** Connection issue with Zeptomail

**Fix:**
1. Verify credentials are correct
2. Check internet connection
3. Try telnet: `telnet smtp.zeptomail.in 587`

### Issue: Email sent but not received
**Cause:** Spam filter or invalid email address

**Fix:**
1. Check spam/junk folder
2. Verify email address is valid
3. Add `noreply@pixelsdigital.tech` to contacts

---

## 📋 What to Check

### 1. Client Email in Database
```javascript
// In MongoDB, check:
db.collection('clients').findOne({ _id: ObjectId("...") })

// Should have:
{
  _id: ObjectId(...),
  name: "Client Name",
  email: "client@example.com",  // ← This must exist!
  // ... other fields
}
```

### 2. Project Fields
```javascript
// In MongoDB, check:
db.collection('projects').findOne({ _id: ObjectId("...") })

// Should have:
{
  _id: ObjectId(...),
  projectName: "Project Name",    // ← NOT 'name'
  projectType: "Web Design",      // ← NOT 'type'
  clientId: ObjectId(...),
  // ... other fields
}
```

### 3. Server Logs
When contract is accepted, terminal should show:
```
Sending contract acceptance email to: client@example.com
SMTP Config: { 
  host: 'smtp.zeptomail.in', 
  port: '587', 
  from: 'noreply@pixelsdigital.tech' 
}
Attempting to send email via SMTP to: client@example.com
✅ Email sent successfully via SMTP: msg_XXXXX
```

---

## 🧪 Testing Checklist

- [ ] SMTP credentials in `.env.local`
- [ ] Client has email in database
- [ ] Project has projectName & projectType
- [ ] Create test project with contract
- [ ] Accept contract as client
- [ ] Check server logs for debug messages
- [ ] Check email inbox
- [ ] Email received within 30 seconds
- [ ] Email content is correct

---

## 🔧 Code Changes Made

**File:** `/src/app/api/projects/[id]/contract/route.ts`

**Changes:**
1. Fixed `project.name` → `project.projectName`
2. Fixed `project.type` → `project.projectType`
3. Added console logging for debugging:
   - Email recipient
   - SMTP config
   - Email result
   - Success/failure messages
   - Client lookup details

---

## 📞 Quick Reference

**Email Function:** `/src/lib/email.ts` → `sendContractAcceptanceEmail()`

**API Route:** `/src/app/api/projects/[id]/contract` → `PUT` method

**Trigger:** When client clicks "Accept Contract" in `/client-portal/projects`

**Configuration:** `.env.local` SMTP variables

**Logs:** Terminal running `npm run dev`

---

## ✅ Status

**Fixed:** ✅ Field name issues
**Added:** ✅ Debug logging
**Ready to test:** ✅ Yes!

**Next:** Test contract acceptance and check server logs! 🚀

---

## 💡 Quick Test Steps

1. **Terminal 1:** Make sure `npm run dev` is running
2. **Terminal 2 (optional):** Monitor logs if you want
3. **Browser:** Create & accept contract
4. **Terminal:** Watch for debug messages
5. **Email:** Check inbox within 30 seconds

Done? Let me know what logs you see! 👍
