# Personal Accounts Module

## Overview
The **Personal Accounts** section is completely separate from business accounts and is NOT shown on the main dashboard. It allows you to track your personal finances after receiving salary from Pixels Digital.

## 🔄 Auto-Sync with Business Salary

### Automatic Personal Income Recording
When you create a **paid** salary record for yourself (Admin/Director/Owner) in the business salary system, it automatically creates a corresponding income entry in your personal accounts.

**Triggers:**
- Designation contains: "Admin", "Director", or "Owner"
- Salary status: **Paid**
- Creates personal income entry with same amount, date, and payment method

**What Gets Auto-Recorded:**
- ✅ Type: Income
- ✅ Category: Salary
- ✅ Amount: Net salary amount (after deductions + bonus)
- ✅ Date: Payment date from salary record
- ✅ Payment Method: Same as business salary
- ✅ Description: Auto-generated with month/year
- ✅ Blue "Auto" badge in Personal Accounts table
- ✅ Cannot be manually edited or deleted (managed via business salary)

### How It Works

**Scenario 1: Create Paid Salary**
1. Go to Admin → Salaries
2. Add New Salary
   - Employee: Your Name
   - Designation: **Director** (or Admin/Owner)
   - Amount: ₹50,000
   - Status: **Paid** ✅
3. Click Create
4. **Result:** Automatically creates:
   - Business cash flow entry (expense)
   - Personal account income entry ✅

**Scenario 2: Mark Pending Salary as Paid**
1. Salary initially created as "Pending"
2. Later, click "Mark as Paid"
3. **Result:** Auto-creates personal income entry when status changes to paid

**Scenario 3: Change Paid to Pending**
1. Salary was marked as paid
2. Change status back to "Pending"
3. **Result:** Auto-removes personal income entry

**Scenario 4: Delete Paid Salary**
1. Delete a paid salary record
2. **Result:** Auto-removes linked personal income entry

**Scenario 5: Update Salary Amount**
1. Edit paid salary and change amount/bonus/deductions
2. **Result:** Auto-updates personal income entry with new net amount

## Key Features

### ✅ What's Included
- **Personal Income Tracking**: Record salary received from Pixels Digital and other personal income
- **Personal Expense Management**: Track all your personal spending
- **Personal Balance**: See your current personal cash/bank balance
- **Category-wise Analysis**: View expenses broken down by category
- **Monthly Trends**: Track income and expenses over time

### ❌ What's NOT Included
- Personal accounts **DO NOT** appear on the main business dashboard
- Personal transactions **DO NOT** affect business financial stats
- Completely isolated from business accounting

## How It Works

### 1. Navigation
Access via: **Admin Sidebar → Personal → Personal Accounts**

### 2. Income Categories
When you receive money (Type: Income):
- **Salary**: Your salary from Pixels Digital
- **Freelance**: Income from side projects
- **Investment Return**: Dividends, interest, etc.
- **Other**: Any other personal income

### 3. Expense Categories
When you spend money (Type: Expense):
- **Food**: Groceries, dining out
- **Travel**: Transportation, fuel, tickets
- **Shopping**: Clothes, electronics, etc.
- **Bills**: Utilities, internet, phone
- **Rent**: Monthly rent or housing costs
- **Healthcare**: Medical expenses, insurance
- **Entertainment**: Movies, subscriptions, hobbies
- **Investment**: SIPs, mutual funds, stocks
- **Education**: Courses, books, training
- **Other**: Miscellaneous expenses

### 4. Payment Methods
Track how you paid:
- **Bank Transfer**: NEFT, IMPS, internet banking
- **UPI**: Google Pay, PhonePe, Paytm
- **Cash**: Physical cash transactions
- **Card**: Debit/Credit card payments

## Workflow Example

### Scenario: You receive salary and manage personal expenses

1. **Receive Salary (1st of month)** - 🔄 AUTO-SYNCED
   - Go to Admin → Salaries
   - Add New Salary
   - Employee Name: Your Name
   - Designation: **Director**
   - Amount: ₹50,000
   - Status: **Paid** ✅
   - **Result:** Automatically appears in Personal Accounts as income!
   - No need to manually add it

2. **Pay Rent (5th of month)** - Manual Entry
   - Add Transaction
   - Type: **Expense**
   - Category: **Rent**
   - Amount: ₹15,000
   - Description: "December rent"
   - Payment Method: UPI

3. **Grocery Shopping (Weekly)**
   - Type: **Expense**
   - Category: **Food**
   - Amount: ₹3,500
   - Description: "Weekly groceries"
   - Payment Method: Cash

4. **Investment (SIP)**
   - Type: **Expense**
   - Category: **Investment**
   - Amount: ₹5,000
   - Description: "Monthly SIP"
   - Payment Method: Bank Transfer

## Dashboard Cards

### Total Income (Green)
Shows all money you've received (salary + other income)

### Total Expenses (Red)
Shows all money you've spent across all categories

### Current Balance (Blue/Orange)
- **Blue**: Positive balance (income > expenses)
- **Orange**: Negative balance (expenses > income)
- Formula: `Total Income - Total Expenses`

## Key Benefits

### For You
1. **Financial Clarity**: Know exactly where your money goes
2. **Budget Planning**: See spending patterns by category
3. **Privacy**: Completely separate from business accounts
4. **Expense Control**: Identify areas where you can save

### Separation from Business
- Business dashboard shows: Revenue, Expenses, Salaries, Cash Flow
- Personal accounts show: Your income, expenses, balance
- No mixing of business and personal finances
- Clean accounting for tax purposes

## Transaction Management

### Auto-Recorded Transactions (Salary)
- Marked with blue **"Auto"** badge
- Shows "Auto-recorded" instead of Edit/Delete buttons
- Cannot be manually edited or deleted
- Managed through business salary system only
- Changes in business salary automatically sync to personal accounts

### Manual Transactions (All Other Income/Expenses)

#### Add Transaction
1. Click **"Add Transaction"** button
2. Select Type: Income or Expense
3. Choose Category
4. Enter Amount and Date
5. Add Description (optional)
6. Select Payment Method
7. Add Notes (optional)

### Edit Transaction
1. Click the **Edit** icon (pencil) on any transaction
2. Modify the details
3. Click **"Update Transaction"**

### Delete Transaction
1. Click the **Delete** icon (trash) on any transaction
2. Confirm deletion
3. Transaction is permanently removed

## API Endpoints

### Get All Transactions
```
GET /api/personal-accounts
```

### Create Transaction
```
POST /api/personal-accounts
Body: {
  type: 'income' | 'expense',
  category: string,
  amount: number,
  date: string,
  description: string,
  paymentMethod: string,
  notes: string
}
```

### Update Transaction
```
PATCH /api/personal-accounts/[id]
```

### Delete Transaction
```
DELETE /api/personal-accounts/[id]
```

### Get Stats
```
GET /api/personal-accounts/stats
```

## Database Collection

**Collection**: `personal_accounts`

**Schema**:
```typescript
{
  type: 'income' | 'expense',
  category: string,
  amount: number,
  date: string,
  description: string,
  paymentMethod: 'bank_transfer' | 'upi' | 'cash' | 'card',
  notes: string,
  salaryId: ObjectId | null, // Links to business salary record if applicable
  createdAt: Date,
  updatedAt: Date
}
```

## Tips for Best Use

### 1. Record Regularly
- Add transactions daily or weekly
- Don't wait till month-end
- Fresh memory = accurate records

### 2. Use Categories Consistently
- Stick to the same category for similar expenses
- Makes analysis easier over time

### 3. Add Descriptions
- Brief notes help remember what the expense was for
- Useful for future reference

### 4. Review Monthly
- Check your spending patterns
- Identify areas to reduce expenses
- Plan next month's budget

### 5. Link Salary to Business
- When recording salary income, you can reference the business salary record
- Helps track if salary was actually received

## Future Enhancements (Optional)

### Potential Features
- [ ] Monthly budget limits per category
- [ ] Spending alerts when approaching limits
- [ ] Savings goals tracker
- [ ] Export to Excel/PDF for tax filing
- [ ] Charts and graphs for spending patterns
- [ ] Compare month-over-month expenses
- [ ] Automatic categorization using AI
- [ ] Receipt photo upload and storage
- [ ] Recurring transaction templates

## Security & Privacy

- Personal accounts are completely private
- Only accessible to logged-in admin
- No visibility to clients or staff
- Separate from business financial data
- Can be easily hidden/removed if not needed

## Support

For any issues or questions about Personal Accounts:
1. Check this documentation first
2. Verify all data is entered correctly
3. Contact support if problems persist

---

**Remember**: This module is entirely optional. If you don't want to track personal finances through this system, you can simply ignore the "Personal Accounts" section in the sidebar. It won't affect any business operations.
