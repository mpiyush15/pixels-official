# Automatic Invoice Generation on Payment

## Overview
Invoices are now automatically generated whenever a milestone payment is completed, either through online payment or admin manual logging.

## Flow Diagram

```
Client Submits Work
        ↓
Admin Converts to Project (with deposit + total amount)
        ↓
Project Created with Milestones:
  - Milestone 1: Initial Deposit (unpaid)
  - Milestone 2: Final Payment (unpaid)
        ↓
Client Sees Project with "Pay Now" Button
        ↓
Client Pays Deposit via Cashfree
        ↓
Payment Callback → /api/payments/milestone/complete
        ↓
AUTOMATICALLY:
  ✅ Milestone marked as "paid"
  ✅ Payment record created
  ✅ INVOICE GENERATED (status: paid)
  ✅ Project unlocked (depositPaid = true)
        ↓
Client Can Now Access Full Project
```

## Invoice Auto-Generation Triggers

### 1. Online Payment (Client Portal)
**Endpoint:** `POST /api/payments/milestone/complete`

**When:** Client pays a milestone via Cashfree payment gateway

**What Happens:**
1. Milestone payment status → `paid`
2. Payment record created in `payments` collection
3. **Invoice auto-generated** with:
   - Invoice number: `INV-{timestamp}`
   - Status: `paid`
   - Items: Milestone description + amount
   - Notes: Includes Cashfree order ID
4. If first milestone (deposit) → project unlocked

**Invoice Fields:**
```javascript
{
  clientId: project.clientId,
  clientName: project.clientName,
  clientEmail: project.clientEmail,
  projectId: projectId,
  projectName: project.title,
  invoiceNumber: "INV-1733234567890",
  issueDate: "2025-12-03",
  dueDate: "2025-12-03", // Same as issue date (already paid)
  status: "paid",
  paidDate: "2025-12-03",
  items: [
    {
      description: "Initial Deposit",
      quantity: 1,
      rate: 15000,
      amount: 15000
    }
  ],
  subtotal: 15000,
  tax: 0,
  taxRate: 0,
  total: 15000,
  notes: "Payment for Initial Deposit - Order ID: order_xyz123",
  milestoneIndex: 0,
  cashfreeOrderId: "order_xyz123"
}
```

---

### 2. Manual Payment Logging (Admin Dashboard)
**Endpoint:** `POST /api/projects/[id]/milestone-payment`

**When:** Admin manually logs offline/manual payment for a milestone

**What Happens:**
1. Milestone payment status → `paid`
2. Payment record created with `loggedBy: 'admin'`
3. **Invoice auto-generated** with:
   - Invoice number: `INV-{timestamp}`
   - Status: `paid`
   - Items: Milestone description + amount
   - Notes: Admin payment details
   - Payment method: As specified by admin
4. If first milestone (deposit) → project unlocked

**Invoice Fields:**
```javascript
{
  clientId: project.clientId,
  clientName: project.clientName,
  clientEmail: project.clientEmail,
  projectId: projectId,
  projectName: project.title,
  invoiceNumber: "INV-1733234567890",
  issueDate: "2025-12-03",
  dueDate: "2025-12-03",
  status: "paid",
  paidDate: "2025-12-03",
  items: [
    {
      description: "Initial Deposit",
      quantity: 1,
      rate: 15000,
      amount: 15000
    }
  ],
  subtotal: 15000,
  tax: 0,
  taxRate: 0,
  total: 15000,
  notes: "Admin logged payment - Cash payment received",
  milestoneIndex: 0,
  paymentMethod: "cash"
}
```

---

## Database Collections Updated

### 1. `projects` Collection
```javascript
// Milestone updated
milestones[index]: {
  paymentStatus: "paid",
  paidAt: new Date(),
  paidAmount: 15000,
  cashfreeOrderId: "order_xyz123" // (if online payment)
  // OR
  paymentMethod: "cash", // (if admin logged)
  paymentDetails: "Cash payment received"
}

// Project unlocked (if deposit payment)
{
  depositPaid: true,
  updatedAt: new Date()
}
```

### 2. `payments` Collection
```javascript
{
  projectId: "ObjectId",
  clientId: "client123",
  milestoneIndex: 0,
  milestoneName: "Initial Deposit",
  amount: 15000,
  orderId: "order_xyz123", // (if online)
  paymentMethod: "Online" | "cash" | "bank transfer" | etc,
  paymentDate: new Date(),
  status: "completed",
  type: "milestone",
  loggedBy: "admin", // (if admin logged)
  createdAt: new Date()
}
```

### 3. `invoices` Collection (NEW)
```javascript
{
  clientId: "client123",
  clientName: "John Doe",
  clientEmail: "john@example.com",
  projectId: "ObjectId",
  projectName: "Website Redesign",
  invoiceNumber: "INV-1733234567890",
  issueDate: "2025-12-03",
  dueDate: "2025-12-03",
  status: "paid",
  paidDate: "2025-12-03",
  items: [
    {
      description: "Initial Deposit",
      quantity: 1,
      rate: 15000,
      amount: 15000
    }
  ],
  subtotal: 15000,
  tax: 0,
  taxRate: 0,
  total: 15000,
  notes: "Payment for Initial Deposit - Order ID: order_xyz123",
  milestoneIndex: 0,
  cashfreeOrderId: "order_xyz123",
  paymentMethod: "Online",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

---

## Client Journey with Invoices

### Step 1: Submit Work
Client submits work through `/client-portal/submit-work`

### Step 2: Project Created
Admin converts submission to project with:
- Total Amount: ₹50,000
- Deposit: ₹15,000

### Step 3: View Locked Project
Client sees project on dashboard with:
- Orange "Payment Required" banner
- "Pay Now" button for ₹15,000 deposit

### Step 4: Make Payment
Client clicks "Pay Now" → Cashfree payment → Success

### Step 5: Auto-Generated Invoice
System automatically:
- Creates payment record
- **Generates invoice** (INV-1733234567890)
- Marks invoice as "paid"
- Unlocks project

### Step 6: View Invoice
Client can now see the paid invoice in:
- `/client-portal/invoices` - All invoices list
- `/client-portal/dashboard` - Invoices tab

---

## Admin Features

### 1. View Auto-Generated Invoices
Admin can see all invoices at `/admin/invoices`, including auto-generated ones from milestone payments.

### 2. Manual Payment Logging
When admin logs payment manually:
1. Go to Projects page
2. Click "Log Payment" on any unpaid milestone
3. Enter payment method and details
4. Submit → Invoice auto-generated

### 3. Invoice Details
Each invoice includes:
- Link to associated project
- Milestone index
- Payment method (Online/Cash/Bank Transfer)
- Cashfree Order ID (if online payment)
- Payment date and status

---

## Benefits

✅ **No Manual Work** - Invoices created automatically on payment
✅ **Always Accurate** - Invoice amount matches exact payment received
✅ **Immediate Availability** - Client can view invoice right after payment
✅ **Audit Trail** - Every payment has corresponding invoice
✅ **Consistent Format** - All invoices follow same structure
✅ **Project Linkage** - Invoices linked to projects and milestones

---

## Edge Cases Handled

### Multiple Milestones
Each milestone payment generates a separate invoice:
- Payment 1 (Deposit): Invoice INV-001
- Payment 2 (Progress): Invoice INV-002
- Payment 3 (Final): Invoice INV-003

### Admin Manual Logging
Same flow as online payment, but includes:
- Payment method specified by admin
- Admin notes/details
- No Cashfree order ID

### Failed Payments
If payment fails:
- No invoice generated
- Milestone remains "unpaid"
- Project stays locked (if deposit)

### Partial Payments
Not currently supported - payment must match milestone amount exactly.

---

## Future Enhancements (Optional)

1. **Email Invoice** - Send invoice PDF to client email after generation
2. **Download PDF** - Client/admin can download invoice as PDF
3. **Invoice Numbering** - Sequential invoice numbers (INV-0001, INV-0002)
4. **Tax Calculation** - Auto-calculate GST/tax if applicable
5. **Partial Payments** - Split milestone into multiple invoices
6. **Invoice Customization** - Company logo, custom terms
7. **Credit Notes** - Generate credit notes for refunds

---

## Testing Checklist

### Online Payment Flow
- [ ] Client pays deposit milestone
- [ ] Invoice auto-generated
- [ ] Invoice visible in client invoices list
- [ ] Invoice marked as "paid"
- [ ] Invoice includes Cashfree order ID
- [ ] Project unlocked after deposit payment

### Manual Payment Flow
- [ ] Admin logs offline payment
- [ ] Invoice auto-generated
- [ ] Invoice visible to client
- [ ] Invoice marked as "paid"
- [ ] Invoice includes payment method
- [ ] Project unlocked if deposit payment

### Multiple Payments
- [ ] Each milestone creates separate invoice
- [ ] Invoice numbers are unique
- [ ] All invoices linked to same project
- [ ] Client sees all invoices in list

### Invoice Details
- [ ] Correct client information
- [ ] Correct project name
- [ ] Correct amount
- [ ] Correct milestone description
- [ ] Correct payment date
- [ ] Correct status (paid)

---

## Files Modified

1. `/src/app/api/payments/milestone/complete/route.ts`
   - Added invoice generation after online payment
   - Added project unlock logic for deposit

2. `/src/app/api/projects/[id]/milestone-payment/route.ts`
   - Added invoice generation after manual payment logging
   - Added payment record creation
   - Added project unlock logic for deposit

---

## Success Criteria

✅ Invoice automatically created on milestone payment
✅ Invoice status always "paid" (since payment already completed)
✅ Invoice includes all payment details
✅ Invoice visible to client immediately
✅ Invoice linked to project and milestone
✅ Works for both online and manual payments
✅ Project unlocks when deposit invoice generated

**Status: COMPLETE**
