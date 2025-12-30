# Project Contract & Cancellation System

## Overview
Complete contract management system for projects with:
- ✅ Admin creates contracts and sends to clients
- ✅ Clients review and accept contracts
- ✅ Contracts locked for 1 year after acceptance
- ✅ Admin can cancel projects with reasons
- ✅ Full audit trail and logging

---

## 📁 Files Created/Modified

### 1. **API Endpoints**

#### `/api/projects/[id]/contract/route.ts` (NEW)
- **GET** - Fetch contract details
- **POST** - Admin creates/updates contract content
- **PUT** - Client accepts contract (locked for 1 year)

```typescript
// GET - Fetch contract
GET /api/projects/{projectId}/contract

// POST - Admin updates contract
POST /api/projects/{projectId}/contract
Body: { contractContent: "..." }

// PUT - Client accepts contract
PUT /api/projects/{projectId}/contract
Body: { 
  clientId: "...",
  clientName: "...",
  accepted: true 
}
```

#### `/api/admin/projects/[id]/cancel/route.ts` (NEW)
- **POST** - Admin cancels project with reason
- **GET** - Fetch cancellation details

```typescript
// POST - Cancel project
POST /api/admin/projects/{projectId}/cancel
Headers: { Authorization: "Bearer {adminToken}" }
Body: { 
  reason: "client_request",
  notes: "Optional additional notes"
}

// GET - Fetch cancellation info
GET /api/admin/projects/{projectId}/cancel
```

### 2. **Database Schema Updates**

**Projects Collection - New Fields:**

```javascript
{
  // Contract Fields
  contractContent: String,              // Full contract text
  contractAccepted: Boolean,            // Is it accepted?
  contractAcceptedAt: Date,             // When was it accepted?
  contractAcceptedBy: String,           // Who accepted (client name/ID)
  canModifyUntil: Date,                 // When lock expires (1 year)
  contractLocked: Boolean,              // Is it locked?

  // Cancellation Fields
  cancelled: Boolean,                   // Is project cancelled?
  cancelledAt: Date,                    // When was it cancelled?
  cancelledBy: String,                  // Admin who cancelled
  cancellationReason: String,           // Reason for cancellation
  cancellationNotes: String,            // Additional notes
  
  // Existing Fields
  ...
}
```

### 3. **Admin Components**

#### Admin Projects Page (`/admin/(dashboard)/projects/page.tsx`)
**Updated with:**
- ✅ Contract textarea in project creation form
- ✅ Contract section with helpful tips
- ✅ Cancel project button (red alert icon)
- ✅ Cancellation modal with reason dropdown and notes
- ✅ Reason options: client_request, scope_change, budget_constraint, technical_issue, resource_unavailable, other

**Screenshot Features:**
- Beautiful blue section for contract input
- Professional cancellation modal
- Auto-status update to "cancelled" when cancelled
- Activity logging to MongoDB

### 4. **Client Components**

#### Updated `ContractModal.tsx` Component
**Features:**
- ✅ Displays custom contract content from admin
- ✅ Project details header with dates
- ✅ Checkbox to accept T&C
- ✅ Shows "Contract Locked" state after acceptance
- ✅ Lock date and locked until date display
- ✅ Disabled accept button when already locked
- ✅ Read-only view for locked contracts

**Props:**
```typescript
interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  projectId: string;
  projectName: string;
  projectType: string;
  clientName: string;
  clientId: string;
  contractContent: string;         // Full contract from admin
  contractAccepted?: boolean;
  contractAcceptedAt?: string;
  canModifyUntil?: string;
}
```

---

## 🔄 Workflow

### Admin Side:
1. Create new project
2. Fill in "Project Contract" section with full terms
3. Save project
4. Client gets notified and views contract

### Client Side:
1. Client logs into portal
2. Sees projects with "Contract Pending" badge
3. Clicks "View Contract"
4. Reads full contract from admin
5. Checks "I agree to terms and conditions"
6. Clicks "Accept & Start Project"
7. Contract is locked for 1 year
8. Project status changes to "in-progress"
9. Client can view contract anytime but cannot modify it

### Admin Cancellation:
1. Admin views project details
2. Clicks red "Cancel Project" button
3. Modal appears with cancellation form
4. Admin selects reason (dropdown)
5. Admin adds optional notes
6. Clicks "Confirm Cancellation"
7. Project marked as cancelled
8. Activity logged to database
9. Client notified (email notification optional)

---

## 📊 Data Flow

### Contract Acceptance Flow:
```
Admin Creates Contract
    ↓
Project stored with contractContent
    ↓
Client views project
    ↓
Client opens contract modal
    ↓
Client reads contract
    ↓
Client clicks "Accept & Agree"
    ↓
PUT /api/projects/[id]/contract
    ↓
Server validates client ownership
    ↓
Server sets:
  - contractAccepted: true
  - contractAcceptedAt: now
  - contractAcceptedBy: clientName
  - canModifyUntil: now + 1 year
  - contractLocked: true
  - status: "in-progress" (auto-start)
    ↓
Return success response
    ↓
Client sees "Contract Accepted - Locked until [date]"
    ↓
Contract becomes read-only
```

### Project Cancellation Flow:
```
Admin clicks "Cancel Project"
    ↓
Cancellation modal opens
    ↓
Admin selects reason from dropdown
    ↓
Admin adds optional notes
    ↓
Admin clicks "Confirm Cancellation"
    ↓
POST /api/admin/projects/[id]/cancel
Headers: { Authorization: Bearer token }
Body: { reason, notes }
    ↓
Server validates admin token
    ↓
Server updates project:
  - cancelled: true
  - cancelledAt: now
  - cancelledBy: adminName
  - cancellationReason: reason
  - cancellationNotes: notes
  - status: "cancelled"
    ↓
Server logs to activityLogs collection:
  {
    type: "project_cancelled",
    projectId,
    adminId,
    adminName,
    reason,
    notes,
    timestamp
  }
    ↓
Return success response
    ↓
UI refreshes and shows cancelled status
```

---

## 🔒 Security Features

1. **Contract Locking:**
   - Once accepted, locked for exactly 1 year
   - Cannot be modified by anyone during lock period
   - Client verification required
   - Timestamp recorded

2. **Admin Authorization:**
   - Only admins can cancel projects (JWT token check)
   - Admin name logged with cancellation
   - Reason required (prevents accidental cancellation)
   - Activity audit trail created

3. **Client Ownership:**
   - Contract acceptance validates project belongs to client
   - Clients can only accept their own contracts
   - ClientId verification on PUT request

4. **Data Validation:**
   - Contract content required for admin creation
   - Cancellation reason required
   - Client must explicitly agree to terms

---

## 🧪 Testing Checklist

- [ ] Admin creates project with contract
- [ ] Contract content displays correctly in modal
- [ ] Client accepts contract
- [ ] Check MongoDB: contractAccepted = true
- [ ] Check MongoDB: contractLocked = true
- [ ] Check MongoDB: canModifyUntil = ~1 year from now
- [ ] Client views contract again
- [ ] "Contract Locked" message displays
- [ ] Accept button is disabled
- [ ] Admin views project details
- [ ] Cancel button appears
- [ ] Admin clicks cancel, modal opens
- [ ] Admin selects reason from dropdown
- [ ] Admin adds notes
- [ ] Admin confirms cancellation
- [ ] Check MongoDB: cancelled = true
- [ ] Check MongoDB: status = "cancelled"
- [ ] Check activityLogs: new entry created
- [ ] Project shows "Cancelled" status in UI
- [ ] Client can view contract history

---

## 📝 API Response Examples

### Accept Contract Success:
```json
{
  "success": true,
  "message": "Contract accepted successfully. Project started!",
  "lockedUntil": "2026-12-30T12:00:00Z"
}
```

### Cancel Project Success:
```json
{
  "success": true,
  "message": "Project cancelled successfully",
  "cancelledAt": "2025-12-30T12:00:00Z"
}
```

### Contract Locked Error:
```json
{
  "error": "Contract already accepted by client. Cannot modify."
}
```

---

## 🚀 Next Steps (Optional Enhancements)

1. **Email Notifications:**
   - Notify client when contract is ready for review
   - Notify admin/client when contract is accepted
   - Notify client when project is cancelled

2. **Contract Templates:**
   - Pre-made contract templates for different project types
   - Admin can select and customize templates

3. **Contract Versioning:**
   - Keep history of contract changes
   - Show what changed between versions
   - Allow rollback to previous versions

4. **E-Signature:**
   - Integrate digital signature capability
   - Legally binding signed contracts
   - Signature timestamp and IP logging

5. **Contract Analytics:**
   - Track acceptance rates
   - Time to accept contract
   - Common cancellation reasons

---

## 📞 Support Notes

**For Admin:**
- Write clear, detailed contracts
- Include payment terms, timeline, and revision policy
- Be specific about deliverables
- Save before sending to client

**For Client:**
- Read contract carefully before accepting
- Contract is locked for 1 year after acceptance
- Cannot undo acceptance
- Contact admin if you have questions

---

**System Status:** ✅ Ready for Testing
**Last Updated:** 2025-12-30
**Version:** 1.0
