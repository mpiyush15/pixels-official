# 🎯 Quick Reference: Where Clients See Contracts

## 📍 Location Overview

### Main Location: **Client Projects Dashboard**
```
URL: https://your-site.com/client-portal/projects
```

---

## 🔴 Before Contract Acceptance

### What Client Sees:

```
Your Projects Page
├─ Tab: All Projects (X) | Active (X) | Completed (X)
│
└─ Project Card 1
   ├─ Title: "Website Development"
   ├─ Status Badge: 🟠 Planning
   ├─ Description: "E-commerce website..."
   ├─ Progress: 0%
   ├─ Milestones section (expandable)
   │
   └─ Action Buttons:
      │
      └─ 🔵 ACCEPT CONTRACT TO START (PROMINENT BLUE BUTTON)
         │
         └─ When clicked:
            └─ Opens Modal with:
               ├─ Header: "📄 Project Contract & Terms"
               ├─ Project Details box
               ├─ Full Contract Content (scrollable)
               ├─ Checkbox: "I agree to terms"
               └─ Buttons: [Cancel] [Accept & Start Project]
```

### Actions Available:
- ✅ View contract
- ✅ Read full terms
- ✅ Accept contract
- ❌ Submit work (blocked)
- ❌ Chat with admin (blocked)

---

## 🟢 After Contract Acceptance

### What Client Sees:

```
Your Projects Page
├─ Tab: All Projects | Active (X) | Completed
│
└─ Project Card 1
   ├─ Title: "Website Development"
   ├─ Status Badge: 🟡 In Progress ✅ (Changed!)
   ├─ Description: "E-commerce website..."
   ├─ Progress: 0%
   ├─ Milestones section (expandable)
   │
   └─ Action Buttons (NOW ACTIVE):
      │
      ├─ 🔵 VIEW CONTRACT (blue)
      │  └─ Shows read-only contract with lock notice
      │     "🔒 Contract locked until [30 Dec 2026]"
      │
      ├─ 🟢 SUBMIT WORK (green)
      │  └─ Upload deliverables
      │
      └─ 🟣 CHAT (purple)
         └─ Communicate with admin
```

### Actions Now Available:
- ✅ View contract (read-only)
- ✅ Submit work
- ✅ Chat with admin
- ✅ Make milestone payments
- ❌ Modify contract (locked)

---

## 📱 UI Components Involved

### 1. **Client Projects Page**
**File:** `/src/app/client-portal/projects/page.tsx`

**Key Elements:**
```typescript
// Project card shows:
- projectName: "Website Development"
- projectType: "Website Development"
- status: "planning" | "in-progress" | "completed" | "cancelled"
- contractAccepted: boolean

// When contractAccepted = false:
Show button: "Accept Contract to Start"

// When contractAccepted = true:
Show buttons: "View Contract", "Submit Work", "Chat"
```

### 2. **ContractModal Component**
**File:** `/src/components/ContractModal.tsx`

**Shows when:**
- Client clicks "Accept Contract to Start" button (initial acceptance)
- Client clicks "View Contract" button (after acceptance)

**Features:**
```
┌─ BEFORE ACCEPTANCE (Editable state)
│  ├─ Blue header: "📄 Project Contract & Terms"
│  ├─ Subtitle: "Please review and accept"
│  ├─ Contract content (full text from admin)
│  ├─ Checkbox: "I agree to terms"
│  └─ Buttons: [Cancel] [Accept & Start Project]
│
└─ AFTER ACCEPTANCE (Locked state)
   ├─ Gray header: "📄 Project Contract (Locked)"
   ├─ Subtitle: "Accepted on [date] - Locked until [date]"
   ├─ Contract content (read-only)
   ├─ Lock notice with 1-year expiration info
   └─ Button: [Close]
```

---

## 🔄 Data Flow

```
1. Admin Creates Project
   └─ Sets contractContent field
   └─ Project saved to MongoDB

2. Client Views Projects Page
   └─ Fetches all client's projects
   └─ Shows project cards with contractAccepted status

3. Client Clicks "Accept Contract to Start"
   └─ Modal opens
   └─ Shows contractContent from database
   └─ Displays project details
   └─ Shows agree checkbox & accept button

4. Client Reads & Accepts
   └─ Clicks "Accept & Start Project"
   └─ API call: PUT /api/projects/[id]/contract
   └─ Server updates:
      ├─ contractAccepted: true
      ├─ contractAcceptedAt: now
      ├─ contractAcceptedBy: clientName
      ├─ canModifyUntil: now + 1 year
      ├─ contractLocked: true
      ├─ status: "in-progress"
      └─ Returns success

5. Projects Page Refreshes
   └─ Fetches updated project data
   └─ contractAccepted is now true
   └─ Buttons change to "View Contract", "Submit Work", "Chat"

6. Client Clicks "View Contract" Later
   └─ Modal opens again
   └─ Header shows "LOCKED"
   └─ Displays lock notice with dates
   └─ Read-only mode
   └─ No accept button, just "Close"
```

---

## 🔐 Contract States

### State 1: Pending Acceptance
```
{
  contractAccepted: false,
  contractAcceptedAt: null,
  contractLocked: false,
  canModifyUntil: null
}

UI: Blue "Accept Contract to Start" button
Modal: Accept checkbox + button visible
Modal Header: "📄 Project Contract & Terms"
Modal Subtitle: "Please review and accept"
```

### State 2: Accepted & Locked
```
{
  contractAccepted: true,
  contractAcceptedAt: "2025-12-30T12:00:00Z",
  contractAcceptedBy: "John Doe",
  contractLocked: true,
  canModifyUntil: "2026-12-30T12:00:00Z",
  status: "in-progress"
}

UI: Blue "View Contract" + Green "Submit Work" + Purple "Chat"
Modal: Lock notice + read-only content
Modal Header: "📄 Project Contract (Locked) 🔒"
Modal Subtitle: "Accepted on 30 Dec 2025 - Locked until 30 Dec 2026"
```

---

## 📲 Mobile View

On mobile/tablet, the action buttons stack vertically:

```
Your Project
├─ Title & Status
├─ Description
├─ Progress bar
├─ Milestones
│
└─ Actions (stacked):
   ├─ [View Contract] or [Accept Contract]
   ├─ [Submit Work]
   └─ [Chat]
```

---

## 🎨 Visual Indicators

### Button Colors:
- **🔵 Blue** = Contract-related (Accept / View)
- **🟢 Green** = Submit/Upload action
- **🟣 Purple** = Chat/Communication
- **🔒 Lock Icon** = Contract locked/read-only

### Status Badges:
- **🟠 Planning** = Contract pending (before acceptance)
- **🟡 In Progress** = Contract accepted, work ongoing
- **🔵 Review** = Final review phase
- **🟢 Completed** = Project finished
- **⚫ Cancelled** = Project cancelled by admin

### Modal Headers:
- **Blue gradient** = Contract accepting mode (editable)
- **Gray** = Contract locked mode (read-only)
- **🔒 Lock icon** = Indicates locked state

---

## 📋 Summary Table

| Aspect | Location | Trigger | Content |
|--------|----------|---------|---------|
| **See projects** | /client-portal/projects | Page load | All client's projects |
| **See contract** | Project card action | Click button | Modal with contract |
| **Accept contract** | Contract modal | Click accept | PUT API call |
| **View contract later** | Project card action | Click button | Read-only modal |
| **Status indication** | Project card badge | Auto-update | Planning → In Progress |

---

## ✅ Checklist for Implementation

- ✅ Client projects page shows all projects
- ✅ Contract-pending projects show "Accept Contract to Start"
- ✅ Clicking button opens ContractModal
- ✅ Modal displays admin-written contract
- ✅ Client can read and accept contract
- ✅ API updates all contract fields
- ✅ Project card shows "View Contract" after acceptance
- ✅ Modal shows locked state for accepted contracts
- ✅ Lock notice displays correct dates
- ✅ Status badge changes to "In Progress"
- ✅ Submit Work & Chat buttons appear

---

**Last Updated:** 30 December 2025  
**Status:** ✅ Complete & Ready
