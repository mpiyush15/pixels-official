# 📋 Client Contract & Project Management Guide

## Where to Find Contracts

### 1. **Client Projects Dashboard**
**URL:** `https://your-site.com/client-portal/projects`

Location on page:
```
┌─────────────────────────────────────────────────────────────┐
│  Your Projects                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📁 Project Name                          [Status Badge]     │
│  ├─ Description here                                         │
│  ├─ 50% Progress                                             │
│  ├─ Milestones (expandable)                                 │
│  │                                                          │
│  └─ [Action Buttons] ──────────────────────────────────────►│
│     ┌────────────────────────────────────────┐              │
│     │  IF NOT ACCEPTED:                      │              │
│     │  🔵 Accept Contract to Start           │              │
│     │                                        │              │
│     │  IF ALREADY ACCEPTED:                  │              │
│     │  🔵 View Contract 📋                   │              │
│     │  🟢 Submit Work 📤                     │              │
│     │  🟣 Chat 💬                            │              │
│     └────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 Contract Viewing Workflow

### Step 1: See the Project Card
When you log in to client portal, you'll see all your projects listed:
- Project name and description
- Current status (Planning, In Progress, etc.)
- Progress percentage
- Milestones (if any)
- Action buttons at the bottom

### Step 2: Accept Contract (First Time)
**When:** You first see a project and contract is pending approval
**Button:** 🔵 "Accept Contract to Start" (Blue gradient button)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│           📄 Project Contract & Terms                        │
│                                                              │
│  Status: ⚠️ PENDING ACCEPTANCE                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PROJECT DETAILS                                            │
│  ├─ Project Name: E-commerce Website                        │
│  ├─ Project Type: Website Development                       │
│  ├─ Client: John Doe                                        │
│  └─ Date: 30 December 2025                                  │
│                                                              │
│  CONTRACT CONTENT (Scrollable)                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Full contract terms written by admin...               │  │
│  │                                                       │  │
│  │ • Project scope and deliverables                     │  │
│  │ • Payment terms and schedule                         │  │
│  │ • Timeline and deadlines                             │  │
│  │ • Revision policy                                    │  │
│  │ • Confidentiality agreement                          │  │
│  │ • Cancellation terms                                 │  │
│  │ • Support & warranty                                 │  │
│  │                                                       │  │
│  │ ... (continue scrolling to read full terms)          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ACCEPTANCE CHECKBOX & BUTTONS                              │
│  ☑️ I agree to all terms and conditions                      │
│  [Cancel]                    [Accept & Start Project]       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**What happens when you click "Accept & Start Project":**
1. Contract is accepted and locked
2. Project status changes to "In Progress"
3. You get access to Submit Work and Chat buttons
4. Contract is locked for 1 year (cannot be modified)

### Step 3: View Contract (After Acceptance)
**When:** Any time after accepting the contract
**Button:** 🔵 "View Contract" (Blue button, available next to Submit Work button)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│        📄 Project Contract & Terms  🔒 LOCKED               │
│                                                              │
│  Status: ✅ ACCEPTED AND LOCKED                             │
│  Locked Until: 30 December 2026                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PROJECT DETAILS                                            │
│  ├─ Project Name: E-commerce Website                        │
│  ├─ Project Type: Website Development                       │
│  ├─ Client: John Doe                                        │
│  └─ Date: 30 December 2025                                  │
│                                                              │
│  CONTRACT CONTENT (Scrollable - Read Only)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Full contract terms (same as when accepted)           │  │
│  │                                                       │  │
│  │ • Project scope and deliverables                     │  │
│  │ • Payment terms and schedule                         │  │
│  │ • Timeline and deadlines                             │  │
│  │ • Revision policy                                    │  │
│  │ • Confidentiality agreement                          │  │
│  │ • Cancellation terms                                 │  │
│  │ • Support & warranty                                 │  │
│  │                                                       │  │
│  │ ... (continue scrolling to read full terms)          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  CONTRACT LOCKED NOTICE                                     │
│  🔒 This contract was accepted on 30 Dec 2025              │
│     and is locked until 30 Dec 2026.                       │
│     You can view this contract but no modifications        │
│     can be made during the locked period.                  │
│                                                              │
│  [Close]                                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 What "Contract Locked" Means

Once you accept a contract:

| Feature | Before Acceptance | After Acceptance |
|---------|------------------|------------------|
| **View Contract** | ✅ Can accept | ✅ Can view anytime |
| **Modify Contract** | ❌ N/A | ❌ Cannot modify for 1 year |
| **See Terms** | ✅ Yes | ✅ Yes |
| **Submit Work** | ❌ Blocked | ✅ Can submit |
| **Chat with Admin** | ❌ Blocked | ✅ Can communicate |
| **Make Payments** | ❌ Blocked | ✅ Can pay milestones |
| **Download Contract** | ✅ Yes | ✅ Yes |

---

## 📊 Project Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│                    PROJECT LIFECYCLE                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1️⃣  PROJECT CREATED                                           │
│     └─ Admin creates project with contract terms              │
│     └─ Status: Planning                                       │
│     └─ Your button: "Accept Contract to Start"                │
│                                                                │
│  2️⃣  CONTRACT PENDING                                          │
│     └─ You see project in dashboard                           │
│     └─ You read the contract terms                            │
│     └─ You decide to accept or wait                           │
│                                                                │
│  3️⃣  CONTRACT ACCEPTED                                         │
│     └─ You click "Accept & Start Project"                     │
│     └─ Contract is locked for 1 year                          │
│     └─ Status: In Progress                                    │
│     └─ Your buttons: "View Contract", "Submit Work", "Chat"   │
│                                                                │
│  4️⃣  ACTIVE PROJECT PHASE                                      │
│     └─ You submit work whenever required                      │
│     └─ You communicate via chat                               │
│     └─ You make payments for milestones                       │
│     └─ Admin reviews and approves work                        │
│                                                                │
│  5️⃣  PROJECT REVIEW                                            │
│     └─ Admin reviews final deliverables                       │
│     └─ Status: Review                                         │
│                                                                │
│  6️⃣  PROJECT COMPLETED                                         │
│     └─ All milestones done                                    │
│     └─ All payments received                                  │
│     └─ Status: Completed                                      │
│     └─ Contract still locked (read-only access)               │
│                                                                │
│  7️⃣  OPTIONAL: PROJECT CANCELLED (by admin)                   │
│     └─ Admin can cancel with reason                           │
│     └─ Status: Cancelled                                      │
│     └─ You'll be notified                                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## ❓ Common Questions

### Q: What if I don't accept the contract?
**A:** You won't be able to:
- Submit work
- Access chat
- Make payments
- See project details fully

The project will stay in "Planning" status. You can view the contract anytime from the "Accept Contract to Start" button.

### Q: Can I modify the contract after accepting?
**A:** No. Once accepted, the contract is locked for 1 year. This protects both parties by ensuring stable, unchanging terms. If you need to discuss contract changes, contact your admin.

### Q: How long is the contract locked?
**A:** **1 year from the acceptance date**

For example:
- Accepted: 30 December 2025
- Locked until: 30 December 2026
- After that date: Contract modifications become possible (if needed)

### Q: What if I want to cancel the project?
**A:** Only your admin can initiate cancellation. Contact them with your request. They'll provide a reason for the cancellation and notify you.

### Q: Can I view the contract after completion?
**A:** Yes! The contract stays available in read-only mode even after project completion for your records.

### Q: What information is in the contract?
The contract typically includes:
- **Scope of Work:** What will be delivered
- **Payment Terms:** How much and when to pay
- **Timeline:** Project start and end dates
- **Milestones:** Deliverables and deadlines
- **Revision Policy:** How many revisions are included
- **Confidentiality:** Data protection terms
- **Warranty:** Support period after launch
- **Cancellation Terms:** How to cancel and refund policy
- **Dispute Resolution:** How to resolve disagreements

---

## 🎯 Action Steps

### To Accept a Contract:
1. Go to: **Client Portal > Your Projects**
2. Find the project with pending contract
3. Click: **"Accept Contract to Start"** button
4. Read the full contract (scroll to bottom)
5. Check the **"I agree to all terms"** checkbox
6. Click: **"Accept & Start Project"**
7. You'll see a success message
8. Project is now active!

### To View an Accepted Contract:
1. Go to: **Client Portal > Your Projects**
2. Find the project (should show as "In Progress")
3. Click: **"View Contract"** button
4. Read the contract (read-only mode)
5. You'll see "🔒 Contract Locked until [date]" notice
6. Click: **"Close"** when done

---

## 📞 Need Help?

If you have questions about your contract:
1. **Chat with Admin:** Use the "Chat" button on your project
2. **Email Support:** Contact your project admin
3. **Read FAQ:** See this guide for common questions

---

## ⚖️ Legal Reminder

By accepting a contract, you are agreeing to all terms outlined. This is a legally binding agreement. Please:
- ✅ Read the entire contract before accepting
- ✅ Understand all payment terms and timeline
- ✅ Clarify any questions before accepting
- ⚠️ Remember: Once accepted, contract is locked for 1 year

---

**Last Updated:** 30 December 2025  
**Version:** 1.0  
**Status:** ✅ Active
