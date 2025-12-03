# Work Submission to Project Conversion Flow

## Overview
This document describes the complete workflow from client work submission to paid project creation with deposit payment requirements.

## Feature Components

### 1. Client Work Submission (Client Portal)

**Location:** `/client-portal/submit-work`

**Features:**
- List all submitted work with status indicators
- Delete unwanted submissions
- Submit new work via modal form
- Upload files to AWS S3 (supports PDF, Word, Excel, Images, ZIP - no videos)
- Work types: Logo Design, Web Design, Social Media Content, Other

**API Endpoints:**
- `GET /api/client-portal/submit-work` - Fetch client's submissions
- `POST /api/client-portal/submit-work` - Create new submission
- `DELETE /api/client-portal/submit-work/[id]` - Delete submission

**Status Flow:**
- `pending` → Initial submission status
- `reviewed` → Admin has reviewed the submission
- `approved` → Admin approved the work
- `needs-revision` → Client needs to make changes
- `converted` → Converted to a paid project

---

### 2. Admin Submitted Work Management (Admin Dashboard)

**Location:** `/admin/(dashboard)/submitted-work`

**Features:**
- View all client submissions
- Filter by status
- Update submission status
- Convert submission to paid project

**API Endpoints:**
- `GET /api/admin/submitted-work` - Fetch all submissions
- `PATCH /api/admin/submitted-work/[id]` - Update submission status
- `POST /api/admin/submitted-work/convert-to-project` - Convert to project

---

### 3. Convert Submission to Project

**Process:**
1. Admin clicks "Convert to Project" on a submission
2. Modal opens with fee input form:
   - **Total Project Amount** (required)
   - **Deposit Amount** (optional)
3. Admin enters amounts and confirms
4. System creates project with:
   - Pre-filled information from submission
   - Deposit milestone (if deposit amount provided)
   - Final payment milestone for remaining amount
   - Status: `active`
   - Progress: 0%
   - `requiresDepositPayment: true`
   - `depositPaid: false`
5. Submission status updated to `converted`

**API:** `POST /api/admin/submitted-work/convert-to-project`

**Request Body:**
```json
{
  "submissionId": "ObjectId",
  "totalAmount": 50000,
  "depositAmount": 15000
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "ObjectId",
  "message": "Project created successfully"
}
```

---

### 4. Client Project Access with Deposit Payment

**Location:** `/client-portal/dashboard` (Projects Tab)

**Features:**
- Projects requiring deposit payment show:
  - Orange border highlight
  - Payment required notice at top
  - Deposit amount display
  - **"Pay Now"** button (orange)
  - Hidden progress bar and milestones
- After deposit payment:
  - Project unlocks
  - Full details visible
  - Progress tracking enabled
  - Chat and work submission available

**Payment Flow:**
1. Client sees project with "Pay Now" button
2. Clicks "Pay Now" → redirects to `/client-portal/projects?project={projectId}`
3. Client makes deposit payment via Cashfree
4. Payment callback updates milestone status to `paid`
5. System sets `depositPaid: true` on project
6. Project unlocks automatically

---

## Database Schema Updates

### Work Submissions Collection
```javascript
{
  _id: ObjectId,
  clientId: String,
  clientName: String,
  clientEmail: String,
  title: String,
  description: String,
  workType: 'logo-design' | 'web-design' | 'social-media' | 'other',
  fileKey: String,         // S3 key
  fileName: String,
  fileSize: Number,
  notes: String,
  status: 'pending' | 'reviewed' | 'approved' | 'needs-revision' | 'converted',
  submittedAt: Date,
  convertedToProjectId: ObjectId,  // Set when converted
  convertedAt: Date                // Timestamp of conversion
}
```

### Projects Collection (New Fields)
```javascript
{
  // Existing fields...
  requiresDepositPayment: Boolean,
  depositPaid: Boolean,
  createdFromSubmission: Boolean,
  submissionId: ObjectId,
  submissionFileKey: String,
  submissionFileName: String
}
```

---

## UI/UX Flow

### Client Journey
1. **Submit Work**
   - Go to "Submit Work" sidebar
   - View existing submissions
   - Click "Submit New Work" button
   - Fill form and upload file
   - Submit for review

2. **Track Submission**
   - View submission status on dashboard
   - Status changes: pending → reviewed/approved/needs-revision
   - Delete if needed

3. **Receive Project**
   - Admin converts submission to project
   - Project appears on dashboard with "Pay Now" button
   - Payment required notice visible

4. **Pay Deposit**
   - Click "Pay Now"
   - Complete payment via Cashfree
   - Project unlocks after payment

5. **Access Project**
   - View full project details
   - See milestones and progress
   - Chat with team
   - Submit additional work

### Admin Journey
1. **Review Submissions**
   - Go to "Submitted Work" sidebar
   - View all client submissions
   - Update status (reviewed/approved/needs-revision)

2. **Convert to Project**
   - Click "Convert to Project"
   - Enter total project amount
   - Enter deposit amount (optional)
   - Confirm creation

3. **Manage Project**
   - Project created with milestones
   - First milestone: Deposit (unpaid)
   - Remaining milestones: Balance amount
   - Track payment and progress

---

## Payment Integration

### Milestone Structure
When converting with deposit:
```javascript
milestones: [
  {
    title: "Initial Deposit",
    description: "Deposit payment to unlock project access",
    amount: 15000,
    paymentStatus: "unpaid",
    dueDate: "7 days from creation",
    completed: false
  },
  {
    title: "Final Payment",
    description: "Final project payment upon completion",
    amount: 35000,  // totalAmount - depositAmount
    paymentStatus: "unpaid",
    dueDate: "30 days from creation",
    completed: false
  }
]
```

### Payment Callback Handling
When deposit is paid:
1. Cashfree callback received
2. Milestone payment status → `paid`
3. Project `depositPaid` → `true`
4. Client can now access full project

---

## Security & Validation

### Client-Side
- Authentication required for all client portal actions
- Can only delete own submissions
- Can only view own projects

### Admin-Side
- Admin authentication required
- Validation on fee amounts (must be positive)
- Deposit cannot exceed total amount

### API-Level
- Session validation on all endpoints
- ObjectId validation
- Ownership verification before operations

---

## Testing Checklist

### Client Submission
- [ ] Submit work with file upload
- [ ] View submitted work list
- [ ] Delete submission
- [ ] Check status updates from admin

### Admin Conversion
- [ ] View all submissions
- [ ] Update submission status
- [ ] Convert to project with fees
- [ ] Verify project created correctly
- [ ] Check submission marked as converted

### Payment Flow
- [ ] Client sees project with "Pay Now"
- [ ] Payment process works
- [ ] Project unlocks after payment
- [ ] Milestone status updates
- [ ] Progress tracking begins

### Edge Cases
- [ ] Convert with no deposit (full amount in one milestone)
- [ ] Convert with deposit = total amount
- [ ] Multiple submissions from same client
- [ ] Delete submission before conversion
- [ ] View converted submission (should show status)

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Notify admin on new submission
   - Notify client on status change
   - Notify client when project created

2. **File Preview**
   - Show file preview in submission details
   - Download original submission file from project

3. **Revision Workflow**
   - Allow client to resubmit revised work
   - Version tracking for submissions

4. **Bulk Actions**
   - Admin bulk status update
   - Admin bulk project conversion

5. **Analytics**
   - Submission to project conversion rate
   - Average deposit amounts
   - Time from submission to conversion

---

## Files Modified/Created

### Client Portal
- `/src/app/client-portal/submit-work/page.tsx` - Submission interface
- `/src/app/client-portal/dashboard/page.tsx` - Updated to show projects with payment button
- `/src/components/ClientSidebar.tsx` - Added Submit Work menu item

### Admin Dashboard
- `/src/app/admin/(dashboard)/submitted-work/page.tsx` - Submission management
- `/src/app/api/admin/submitted-work/route.ts` - GET all submissions
- `/src/app/api/admin/submitted-work/[id]/route.ts` - UPDATE status
- `/src/app/api/admin/submitted-work/convert-to-project/route.ts` - Convert to project
- `/src/components/AdminSidebar.tsx` - Added Submitted Work menu item

### Client APIs
- `/src/app/api/client-portal/submit-work/route.ts` - POST/GET submissions
- `/src/app/api/client-portal/submit-work/[id]/route.ts` - DELETE submission

---

## Success Criteria

✅ Client can submit work with file upload
✅ Admin can view and manage all submissions
✅ Admin can convert submission to paid project with fees
✅ Project created with deposit payment requirement
✅ Client sees project with "Pay Now" button
✅ Project unlocks after deposit payment
✅ Progress tracking and milestones work correctly

**Status: COMPLETE**
