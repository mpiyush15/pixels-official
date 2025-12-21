# Staff Payments Troubleshooting Guide

## Issue: Admin unable to load staff payments

### Fixed Issues:

1. **Empty Payments Collection**
   - API now checks if `staff_payments` collection exists before querying
   - Returns empty array `[]` if collection doesn't exist yet
   - Frontend displays helpful empty state message

2. **Error Handling**
   - Added better error logging in frontend
   - Console logs will show which API failed and why
   - Added alert for critical errors

3. **Empty State UI**
   - When no payments exist, shows helpful message with icon
   - Prompts user to click "Create Payment" button

### How to Test:

1. **Check Browser Console:**
   ```
   Open admin staff payments page
   Press F12 or Cmd+Option+I
   Check Console tab for any errors
   Look for "Staff data:" and "Payments data:" logs
   ```

2. **Verify Authentication:**
   ```
   - Ensure you're logged in as admin
   - Check Network tab for 401 errors
   - Admin token should be present in cookies
   ```

3. **Check API Responses:**
   ```
   Network Tab > Filter by XHR/Fetch
   
   /api/staff - Should return array of staff members
   /api/admin/staff-payments - Should return array of payments (or empty [])
   ```

### Common Issues & Solutions:

**Issue:** Page stuck on loading spinner
- **Cause:** API endpoints returning errors
- **Solution:** Check console for error messages, verify MongoDB connection

**Issue:** "No staff members available" in dropdown
- **Cause:** `/api/staff` endpoint failing or no staff in database
- **Solution:** 
  1. Go to Staff Management page
  2. Create at least one staff member
  3. Refresh staff payments page

**Issue:** Empty payments table
- **Cause:** No payments created yet (this is normal)
- **Solution:** Click "Create Payment" button to add first payment record

**Issue:** "Failed to fetch staff" or "Failed to fetch payments" in console
- **Cause:** Database connection issue or collection doesn't exist
- **Solution:** 
  1. Check MongoDB connection string in `.env`
  2. Verify database is running
  3. Collection will be auto-created when first payment is added

### Testing the Full Workflow:

1. **Login as Admin:**
   ```
   Navigate to /admin/login
   Login with admin credentials
   ```

2. **Create Staff Member (if none exist):**
   ```
   Go to /admin/staff
   Click "Add Staff Member"
   Fill in details and save
   ```

3. **Assign Tasks to Staff:**
   ```
   Go to /admin/tasks
   Create/assign tasks to staff member
   ```

4. **Create Payment Record:**
   ```
   Go to /admin/staff-payments
   Click "Create Payment"
   Select staff member
   Choose month (e.g., December 2024)
   System will auto-calculate tasks
   Enter amount
   Submit
   ```

5. **Mark Payment as Paid:**
   ```
   Click "Mark as Paid" button
   Update status to "paid"
   Add transaction ID
   Submit
   ```

### API Endpoints Status:

✅ `GET /api/staff` - Fetches all staff members
✅ `GET /api/admin/staff-payments` - Fetches all payment records
✅ `POST /api/admin/staff-payments` - Creates new payment
✅ `PUT /api/admin/staff-payments/[id]` - Updates payment status
✅ `GET /api/admin/staff-tasks-count` - Counts tasks for month

### Database Collections:

**staff** (existing)
- Contains staff member records
- Should have at least one active staff member

**staff_payments** (new)
- Will be auto-created when first payment is added
- Empty until admin creates first payment record

### Next Steps if Still Not Working:

1. **Check Server Logs:**
   ```bash
   # Look at terminal where npm run dev is running
   # Check for any error messages
   ```

2. **Test API Directly:**
   ```bash
   # Test staff endpoint
   curl http://localhost:3000/api/staff \
     -H "Cookie: admin-token=YOUR_TOKEN"
   
   # Test payments endpoint
   curl http://localhost:3000/api/admin/staff-payments \
     -H "Cookie: admin-token=YOUR_TOKEN"
   ```

3. **Check MongoDB:**
   ```bash
   # Connect to MongoDB and verify collections
   mongosh
   use your_database_name
   db.staff.find()
   db.staff_payments.find()
   ```

4. **Verify Environment Variables:**
   ```bash
   # Check .env file has:
   MONGODB_URI=mongodb://...
   JWT_SECRET=your_secret_key
   ```

### Success Indicators:

✅ Page loads without infinite spinner
✅ Console shows "Staff data:" and "Payments data:" logs
✅ Staff dropdown is populated (if staff exist)
✅ Either shows payment records OR "No payment records yet" message
✅ "Create Payment" button works and opens modal

### Contact Support:

If issue persists after following this guide:
1. Share browser console logs
2. Share network tab screenshots
3. Share server terminal output
4. Confirm MongoDB connection is working
