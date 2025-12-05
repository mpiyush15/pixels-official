# Auto-Sync: Business Salary → Personal Accounts

## Summary
Admin/Director/Owner salaries are now automatically recorded in Personal Accounts when marked as **paid**.

## How It Works

### 1. Create Paid Salary (Admin/Director/Owner)
```
Business Salary System → Personal Accounts
├─ Amount: Net salary (after deductions + bonus)
├─ Date: Payment date
├─ Payment Method: Same as business
├─ Category: Salary (Income)
└─ Link: salaryId stored for sync
```

### 2. Who Gets Auto-Synced?
**Designations containing:**
- "Admin"
- "Director" 
- "Owner"

**Example:**
- ✅ "Director" → Auto-synced
- ✅ "Admin Manager" → Auto-synced
- ✅ "Business Owner" → Auto-synced
- ❌ "Marketing Manager" → NOT synced
- ❌ "Content Creator" → NOT synced

### 3. Automatic Actions

| Business Action | Personal Account Result |
|----------------|------------------------|
| Create paid salary (Admin) | ➕ Creates income entry |
| Mark pending → paid | ➕ Creates income entry |
| Mark paid → pending | ➖ Deletes income entry |
| Update paid salary amount | 🔄 Updates income amount |
| Delete paid salary | ➖ Deletes income entry |

### 4. Visual Indicators

**In Personal Accounts:**
- Blue "Auto" badge on salary entries
- "Auto-recorded" text instead of Edit/Delete buttons
- Cannot be manually modified
- All changes must be done in business salary system

## Benefits

### For You
1. **No Double Entry:** Create salary once, appears in both places
2. **Always in Sync:** Changes in business auto-update personal
3. **Accurate Records:** Can't forget to record salary income
4. **Clean Separation:** Business expense = Your personal income

### For Accounting
1. **Audit Trail:** salaryId links personal to business
2. **Data Integrity:** Single source of truth (business salary)
3. **Tax Ready:** Clear separation of business vs personal
4. **No Duplicates:** System prevents manual creation of linked entries

## Database Schema

### Business Salary (salaries collection)
```typescript
{
  employeeName: "Your Name",
  designation: "Director",
  amount: 50000,
  status: "paid", // Triggers auto-sync
  netAmount: 50000,
  // ... other fields
}
```

### Personal Account (personal_accounts collection)
```typescript
{
  type: "income",
  category: "salary",
  amount: 50000,
  salaryId: "linked_salary_id", // Link to business
  description: "Monthly salary - Your Name (12/2024)",
  notes: "Auto-recorded from business salary payment",
  // ... other fields
}
```

## Important Notes

### ⚠️ Do NOT Manually Add Salary Income
- System automatically handles it
- Manual salary entries won't link to business records
- Use "Add Transaction" only for:
  - Freelance income
  - Investment returns
  - Other non-business income

### ✅ Use Business Salary System for:
- Creating salary records
- Changing amounts
- Updating payment dates
- Marking as paid/pending
- Deleting salary records

### 🔄 Automatic Sync Happens When:
1. Creating new paid salary for Admin/Director/Owner
2. Marking pending salary as paid
3. Updating paid salary details
4. Deleting paid salary
5. Changing salary status

## Testing

### Test Case 1: Create Paid Director Salary
1. Go to Salaries → Add New Salary
2. Employee: "Piyush", Designation: "Director"
3. Amount: ₹50,000, Status: "Paid"
4. Create salary
5. Check Personal Accounts → Should show ₹50,000 income

### Test Case 2: Pending to Paid
1. Create salary with Status: "Pending"
2. Check Personal Accounts → No entry
3. Edit salary, change Status to "Paid"
4. Check Personal Accounts → Entry appears

### Test Case 3: Update Amount
1. Edit existing paid director salary
2. Change amount from ₹50,000 to ₹55,000
3. Check Personal Accounts → Amount updated to ₹55,000

### Test Case 4: Staff Salary (Not Synced)
1. Create salary for "Marketing Manager"
2. Status: "Paid"
3. Check Personal Accounts → No entry (correct behavior)

## API Endpoints Modified

### POST /api/salaries
- Added: Auto-create personal account entry for Admin/Director/Owner
- Triggers: When status = 'paid'

### PATCH /api/salaries/[id]
- Added: Auto-sync on status changes
- Added: Auto-update personal entry when amount changes
- Added: Auto-delete personal entry when marked pending

### DELETE /api/salaries/[id]
- Added: Auto-delete linked personal account entry

## Files Modified

1. `/src/app/api/salaries/route.ts` - Added auto-create logic
2. `/src/app/api/salaries/[id]/route.ts` - Added auto-update and auto-delete logic
3. `/src/app/admin/(dashboard)/personal-accounts/page.tsx` - Added "Auto" badge and read-only display
4. `PERSONAL_ACCOUNTS_README.md` - Added auto-sync documentation

---

**Last Updated:** December 4, 2025
**Status:** ✅ Fully Implemented & Tested
