# Staff Work Summary & Payments System

## Overview
Complete staff performance tracking and payment management system with monthly/weekly statistics, bank details management, and admin payment control.

## Features Implemented

### 1. Staff Work Summary Page (`/staff-portal/work-summary`)
**Location:** `src/app/staff-portal/work-summary/page.tsx`

**Features:**
- 📊 Overview statistics cards (Total, In-Progress, Completed, Approved)
- 📅 Toggle between Weekly and Monthly views
- 📈 Performance table with success rate calculations
- 📥 CSV export functionality for reports
- 💰 Payment calculation info section
- 🔗 Links to payments page

**API Endpoint:** `GET /api/staff/work-summary`
- Returns: totalTasks, completedTasks, inProgressTasks, approvedTasks
- Weekly stats: Last 4 weeks of task completion data
- Monthly stats: Last 6 months of task completion data
- Calculates success rate: (approved / completed) × 100

---

### 2. Staff Payments Page (`/staff-portal/payments`)
**Location:** `src/app/staff-portal/payments/page.tsx`

**Features:**
- 💳 Total earned and pending amount cards
- 🏦 Bank details management with edit/save functionality
- 📋 Payment history table with status tracking
- 🔒 Account number masking (shows last 4 digits)
- ✅ Status badges: Pending, Processing, Paid

**Bank Details Fields:**
- Account Holder Name
- Bank Name
- Account Number (masked in view mode)
- IFSC Code
- UPI ID (optional)

**API Endpoints:**
- `GET /api/staff/payments` - Fetch payment history
- `PUT /api/staff/bank-details` - Update bank account info

---

### 3. Admin Staff Payments Page (`/admin/staff-payments`)
**Location:** `src/app/admin/(dashboard)/staff-payments/page.tsx`

**Features:**
- 📊 Summary cards: Total Paid, Processing, Pending amounts
- 📝 Create payment records for staff
- 🔄 Update payment status (Pending → Processing → Paid)
- 💳 Add transaction IDs when marking as paid
- 🧮 Auto-calculate tasks completed for selected month
- 👥 Full payment history table

**Admin Actions:**
1. Create Payment Record
   - Select staff member
   - Choose month
   - System auto-calculates tasks completed
   - Enter amount
   - Add optional notes
   
2. Update Payment
   - Change status (pending/processing/paid)
   - Add transaction ID
   - System auto-sets paidAt date when marked as paid

**API Endpoints:**
- `GET /api/admin/staff-payments` - Fetch all payments
- `POST /api/admin/staff-payments` - Create payment record
- `PUT /api/admin/staff-payments/[id]` - Update payment status
- `GET /api/admin/staff-tasks-count` - Count tasks for month

---

## Database Collections

### 1. Staff Collection (Updated)
Added `bankDetails` field:
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string,
  role: string,
  assignedClients: string[],
  isActive: boolean,
  bankDetails: {
    accountHolderName: string,
    bankName: string,
    accountNumber: string,
    ifscCode: string,
    upiId?: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Staff Payments Collection (New)
Collection name: `staff_payments`

```typescript
{
  _id: ObjectId,
  staffId: string,
  staffName: string,
  month: string,           // Format: YYYY-MM
  amount: number,
  tasksCompleted: number,
  status: 'pending' | 'processing' | 'paid',
  transactionId?: string,
  paidAt?: Date,
  notes?: string,
  createdAt: Date,
  updatedAt?: Date
}
```

**Recommended Indexes:**
```javascript
db.staff_payments.createIndex({ staffId: 1, month: 1 })
db.staff_payments.createIndex({ status: 1 })
db.staff_payments.createIndex({ createdAt: -1 })
```

---

## API Routes Summary

### Staff Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff/work-summary` | Staff Token | Get weekly/monthly performance stats |
| GET | `/api/staff/payments` | Staff Token | Get payment history for logged-in staff |
| PUT | `/api/staff/bank-details` | Staff Token | Update bank account information |

### Admin Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/staff-payments` | Admin Token | Get all staff payments |
| POST | `/api/admin/staff-payments` | Admin Token | Create new payment record |
| PUT | `/api/admin/staff-payments/[id]` | Admin Token | Update payment status/transaction |
| GET | `/api/admin/staff-tasks-count` | Admin Token | Count approved tasks for month |

---

## Workflow

### Staff Workflow
1. **Complete Tasks** → Staff works on assigned tasks
2. **View Performance** → Check work summary (weekly/monthly stats)
3. **Calculate Payments** → See approved tasks count
4. **Check Payments** → View payment history and status
5. **Manage Bank Details** → Add/update account information

### Admin Workflow
1. **Monitor Performance** → Review staff task completion
2. **Create Payment** → Select staff, month, calculate amount
3. **Process Payment** → Update status to processing
4. **Transfer Money** → Make bank transfer
5. **Mark as Paid** → Update status with transaction ID

---

## UI Components

### Staff Portal Sidebar
Updated with 4 menu items:
1. 📊 Dashboard
2. 📋 My Tasks
3. 📈 Work Summary (NEW)
4. 💰 Payments (NEW)

### Admin Sidebar
Added to Accounts & Finance section:
- 💳 Wallet icon: Staff Payments

---

## Security Features

1. **Authentication:**
   - Staff routes verify `staff-token` cookie
   - Admin routes verify `admin-token` cookie
   - JWT verification using jose library

2. **Data Protection:**
   - Account numbers masked in UI (last 4 digits shown)
   - Bank details only accessible to staff owner and admin
   - Payment records scoped to staff member

3. **Validation:**
   - Required field checks on bank details
   - Status enum validation for payments
   - Amount and task count validation

---

## TypeScript Interfaces

### Staff Interface (Updated)
```typescript
interface Staff {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  assignedClients: string[];
  isActive: boolean;
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment Interface (New)
```typescript
interface Payment {
  _id?: string;
  staffId: string;
  staffName: string;
  month: string;
  amount: number;
  tasksCompleted: number;
  status: 'pending' | 'processing' | 'paid';
  transactionId?: string;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

### WorkSummary Interface
```typescript
interface WorkSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  approvedTasks: number;
  weeklyStats: Array<{
    week: string;
    completed: number;
    approved: number;
  }>;
  monthlyStats: Array<{
    month: string;
    completed: number;
    approved: number;
  }>;
}
```

---

## Statistics Calculations

### Work Summary Stats
- **Total Tasks:** All tasks assigned to staff member
- **Completed:** Tasks with status: completed, submitted, or approved
- **In Progress:** Tasks with status: in-progress
- **Approved:** Tasks with status: approved

### Weekly Stats
- Shows last 4 weeks
- Groups by week (Sunday to Saturday)
- Counts completed and approved tasks per week
- Calculates success rate percentage

### Monthly Stats
- Shows last 6 months
- Groups by calendar month
- Counts completed and approved tasks per month
- Calculates success rate percentage

### Payment Calculations
Admin can auto-calculate tasks completed for a selected month using the `/api/admin/staff-tasks-count` endpoint.

---

## CSV Export Feature

Staff can download their performance report as CSV:
- Includes period, completed tasks, approved tasks, success rate
- Filename: `work-summary-{date}.csv`
- Downloads automatically when clicked

---

## Testing Checklist

### Staff Portal Testing
- [ ] View work summary with correct statistics
- [ ] Toggle between weekly and monthly views
- [ ] Download CSV report
- [ ] View payment history
- [ ] Add/edit bank details
- [ ] Verify account number masking
- [ ] Check payment status badges

### Admin Portal Testing
- [ ] View all staff payments
- [ ] Create new payment record
- [ ] Auto-calculate tasks for month
- [ ] Update payment status
- [ ] Add transaction ID
- [ ] Verify summary cards update
- [ ] Check payment filtering

### API Testing
- [ ] Test authentication on all routes
- [ ] Verify work summary calculations
- [ ] Test bank details update
- [ ] Test payment creation
- [ ] Test payment status update
- [ ] Test tasks count calculation

---

## Environment Variables
No new environment variables required. Uses existing:
- `JWT_SECRET` - For token verification
- MongoDB connection string

---

## Next Steps

1. **Test the System:**
   - Create test staff accounts
   - Assign tasks and mark as completed/approved
   - View work summary statistics
   - Create payment records
   - Test bank details management

2. **Optional Enhancements:**
   - Email notifications for new payments
   - Payment approval workflow
   - Bulk payment creation
   - Payment reports and analytics
   - Bank account verification
   - Payment reminders
   - Tax calculation fields

3. **Production Considerations:**
   - Encrypt sensitive bank details
   - Add audit logs for payment changes
   - Implement payment approval chain
   - Add payment dispute handling
   - Create payment receipts/slips

---

## Files Created/Modified

### New Files:
1. `src/app/api/staff/work-summary/route.ts`
2. `src/app/api/staff/payments/route.ts`
3. `src/app/api/staff/bank-details/route.ts`
4. `src/app/api/admin/staff-payments/route.ts`
5. `src/app/api/admin/staff-payments/[id]/route.ts`
6. `src/app/api/admin/staff-tasks-count/route.ts`
7. `src/app/staff-portal/work-summary/page.tsx`
8. `src/app/staff-portal/payments/page.tsx`
9. `src/app/admin/(dashboard)/staff-payments/page.tsx`

### Modified Files:
1. `src/components/StaffSidebar.tsx` - Added Work Summary and Payments menu items
2. `src/components/AdminSidebar.tsx` - Added Staff Payments menu item
3. `src/types/staff.ts` - Added bankDetails to Staff interface, added Payment interface

---

## Support

For issues or questions:
1. Check MongoDB collections exist
2. Verify JWT_SECRET is set
3. Ensure staff has tasks with completedDate
4. Check browser console for API errors
5. Verify authentication cookies are set

---

**System Status:** ✅ Complete and Ready for Testing

All frontend pages, backend APIs, database structures, and type definitions are in place. The system is ready for deployment and testing.
