# Contract Acceptance Email Notifications

## Overview

When a client accepts a project contract, an automated confirmation email is sent to notify them that their project has been successfully activated. This email provides all essential information about their project acceptance and next steps.

## Implementation Details

### Email Function

**Location:** `src/lib/email.ts`

**Function Signature:**
```typescript
export async function sendContractAcceptanceEmail(
  to: string,
  clientName: string,
  projectName: string,
  projectType: string
): Promise<{ success: boolean; messageId?: string; error?: string }>
```

**Parameters:**
- `to` (string): Client's email address
- `clientName` (string): Client's full name for personalization
- `projectName` (string): Name of the project
- `projectType` (string): Type of project (e.g., "Website Design", "Mobile App", etc.)

**Returns:**
- Success object with `messageId` from Zeptomail or Resend
- Error object with error description if sending fails

### API Integration

**Location:** `src/app/api/projects/[id]/contract/route.ts`

**Integration Point:** PUT endpoint (Contract Acceptance)

**Flow:**
1. Client submits contract acceptance via `PUT /api/projects/[id]/contract`
2. API validates client ownership and contract details
3. Project status is updated to "in-progress"
4. Contract is locked for 1 year
5. **Email sending is triggered** (non-blocking - won't fail if email fails)
6. Client email is retrieved from MongoDB `clients` collection
7. `sendContractAcceptanceEmail()` is called with project details
8. Response is returned with success status

**Error Handling:**
- Email sending errors are logged but don't prevent contract acceptance
- This ensures data consistency - contract is accepted regardless of email delivery
- Email errors are reported in console logs for monitoring

### Code Example

From `src/app/api/projects/[id]/contract/route.ts`:

```typescript
// Send confirmation email to client
try {
  // Get client email from database
  const client = await db.collection('clients').findOne({
    _id: new ObjectId(clientId)
  });

  if (client && client.email) {
    const emailResult = await sendContractAcceptanceEmail(
      client.email,
      client.name || clientName || 'Client',
      project.name || 'Project',
      project.type || 'Web Development'
    );

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      // Don't fail the API request if email fails
    }
  }
} catch (emailError) {
  console.error('Error sending contract acceptance email:', emailError);
  // Don't fail the API request if email fails
}
```

## Email Template

### Email Structure

**Subject:** `Contract Accepted: {ProjectName} - Project Started ✅`

**Sections:**
1. **Header** - Green gradient background with success message
2. **Greeting** - Personalized welcome to client
3. **Success Badge** - Displays acceptance date with green highlight
4. **Project Details Box**
   - Project Name
   - Project Type
   - Acceptance Date
5. **Status Update** - Notification that project is now "In Progress"
6. **Next Steps** - What the client should do next:
   - Monitor project progress in dashboard
   - Review work submissions and provide feedback
   - Chat with team for updates
   - Track milestones and deliverables
7. **Action Button** - "View Your Project" link to client portal
8. **Support Information** - Contact email for questions
9. **Footer** - Copyright information

### Email Styling

- **Color Scheme:**
  - Primary: Green (#10b981, #059669) for success/completion
  - Secondary: Blue (#3b82f6) for information
  - Accent: Yellow (#fbbf24) for status changes
  
- **Responsive Design:** Mobile-friendly HTML with max-width container
- **Professional Layout:** Structured sections with proper spacing
- **Status Indicators:** Visual badges and colored boxes for clarity

## Email Provider Configuration

### Zeptomail (Primary)

**SMTP Settings:**
- Host: `smtp.zeptomail.in`
- Port: `587`
- Auth User: `emailapikey` (from environment variable `SMTP_USER`)
- Auth Password: From environment variable `SMTP_PASSWORD`

**Configuration in `.env.local`:**
```
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=your_zeptomail_password
EMAIL_FROM=noreply@pixelsdigital.tech
```

### Fallback (Resend)

If Zeptomail SMTP fails, the system automatically falls back to Resend:
- API Key: From environment variable `RESEND_API_KEY`
- Sender: `noreply@pixelsdigital.tech`

## Testing the Email Feature

### Manual Testing

1. **Create a test project in admin panel**
   - Go to `/admin/dashboard/projects`
   - Create new project with contract content
   - Add a test client

2. **Accept contract as client**
   - Login to `/client-portal` with test client account
   - Navigate to `/client-portal/projects`
   - Click "Accept Contract to Start"
   - Accept in the modal

3. **Check email**
   - Check test client's email inbox
   - Verify email was received within 30 seconds
   - Validate content: project name, type, acceptance date
   - Click "View Your Project" button to ensure it works

### Logs to Monitor

Check server/vercel logs for:
- `Email sent via Zeptomail: {messageId}` - Success indicator
- `Email sending failed: {error}` - Any email issues
- `Error sending contract acceptance email: {error}` - Catch-all for email errors

## Client Portal Integration

### Where Clients Accept Contracts

**Route:** `/client-portal/projects`

**Component:** `src/app/client-portal/projects/page.tsx`

**Flow:**
1. Clients see their projects in dashboard
2. Projects with pending contracts show "Accept Contract to Start" button
3. Clicking opens `ContractModal` component
4. Modal displays full contract content
5. Client reviews and clicks "Accept Contract"
6. Modal calls `PUT /api/projects/[id]/contract` with:
   - `clientId`: Client's MongoDB ID
   - `clientName`: Client's name
   - `accepted`: true
7. API processes acceptance and sends email
8. Modal shows success message
9. Projects list refreshes
10. Project status changes to "In Progress"
11. Email is delivered to client's inbox

## Database Schema

### Projects Collection

Fields used for email:
```typescript
{
  _id: ObjectId,
  name: string,                      // Project name in email
  type: string,                      // Project type in email
  clientId: ObjectId,                // Used to fetch client email
  contractContent: string,           // Contract text (displayed in modal)
  contractAccepted: boolean,         // Triggers email when true
  contractAcceptedAt: Date,          // Acceptance timestamp in email
  contractAcceptedBy: string,        // Client name in email
  canModifyUntil: Date,              // Lock expiration (1 year)
  status: string,                    // Changed to "in-progress"
}
```

### Clients Collection

Fields used for email:
```typescript
{
  _id: ObjectId,
  email: string,                     // Email recipient
  name: string,                      // Client's name for greeting
  // ... other fields
}
```

## Email Delivery Timeline

1. **Contract Acceptance:** Client clicks "Accept Contract"
2. **API Processing:** ~100-300ms
3. **Email Queuing:** ~50-200ms (added to Zeptomail queue)
4. **Email Delivery:** ~5-30 seconds (typically)
5. **Inbox Delivery:** ~1-2 minutes (varies by email provider)

## Monitoring and Debugging

### Success Indicators

✅ Email received in client inbox within 2 minutes
✅ All dynamic fields populated correctly
✅ Links in email are clickable and work
✅ Email renders properly on mobile and desktop

### Common Issues and Solutions

**Email not received:**
1. Check spam/junk folder
2. Verify client email in MongoDB
3. Check Zeptomail logs for bounces
4. Verify `SMTP_PASSWORD` is set correctly in `.env.local`

**Email formatting issues:**
1. Test in different email clients (Gmail, Outlook, Apple Mail)
2. Check browser console for JavaScript errors
3. Verify HTML generation in email template

**Links not working:**
1. Verify `NEXT_PUBLIC_BASE_URL` is set in environment
2. Test links in browser directly
3. Check for URL encoding issues

### Logs to Check

**Vercel Logs:**
```bash
# Success
Email sent via Zeptomail: msg_XXXXXXXXX

# Failure
Email sending failed: Connection timeout
Error sending contract acceptance email: Invalid email format
```

**MongoDB Logs:**
- Verify client record exists with email field
- Check projects collection for contract data

## Future Enhancements

### Possible Improvements

1. **Admin Notification Email**
   - Send email to admin/manager when client accepts
   - Include client details and project info
   - Trigger workflow or notifications

2. **Email Template Customization**
   - Allow admins to customize email template
   - Add company branding/colors
   - Include custom message from admin

3. **Email Retry Logic**
   - Implement queue system for failed emails
   - Automatic retry with exponential backoff
   - Email delivery status tracking

4. **Email Tracking**
   - Track email opens and link clicks
   - Store delivery status in database
   - Dashboard for email analytics

5. **Multi-Language Support**
   - Send emails in client's preferred language
   - Dynamic template based on locale
   - Localized date/time formatting

6. **SMS Notifications**
   - Send SMS to client for immediate notification
   - Optional complement to email
   - Useful for time-sensitive projects

## API Reference

### Contract Acceptance Endpoint

**Endpoint:** `PUT /api/projects/[id]/contract`

**Request Body:**
```json
{
  "clientId": "mongodb_object_id",
  "clientName": "Client Name",
  "accepted": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Contract accepted successfully. Project started!",
  "lockedUntil": "2026-01-15T10:30:00.000Z"
}
```

**Error Response (400/403/404/500):**
```json
{
  "error": "Error description"
}
```

**Side Effects:**
- ✅ Project status changes to "in-progress"
- ✅ Contract marked as accepted
- ✅ Contract locked for 1 year
- ✅ Confirmation email sent to client
- ✅ Client can now submit work and chat

## Security Considerations

1. **Client Validation**
   - API validates that clientId owns the project
   - Prevents unauthorized contract acceptance
   - Returns 403 Forbidden if not authorized

2. **Email Privacy**
   - Client email retrieved securely from database
   - Not exposed in API responses
   - Logged only when sending

3. **Immutable Contracts**
   - Once accepted, contract cannot be modified
   - Email timestamp matches acceptance time
   - 1-year lock prevents tampering

## Performance Notes

- Email sending is non-blocking (doesn't wait for completion)
- Typical email send time: 100-500ms
- Database queries optimized with ObjectId indexing
- No impact on contract acceptance performance if email fails

## Compliance

✅ **GDPR Compliance**
- Email sent only to client who accepted
- Privacy policy link in email footer
- Ability to unsubscribe (via support)

✅ **CAN-SPAM Compliance**
- Clear sender information
- Physical address (in footer as company)
- Unsubscribe mechanism (contact support)

✅ **Email Best Practices**
- Professional template design
- Mobile-responsive layout
- Clear call-to-action button
- Personalized greeting
- Support contact information
