# Client Type Categorization & Payment Link Generation

## Overview
This document describes the implementation of client type categorization and Cashfree payment link generation for invoices.

## Features Implemented

### 1. Client Type Categorization

#### Client Types
- **Development Clients**: Clients who work with us for web development and related services
- **Other Clients**: Clients who need other services like video production, consulting, etc.

#### Database Changes
- Added `clientType` field to Client interface with values: `"development" | "other"`
- Default value: `"development"`
- Legacy clients without this field are treated as development clients

#### UI Changes - Client Management (`/admin/clients`)
- Added "Client Type" dropdown in add/edit client form
- Options: "Development Client" and "Other Services"
- Located between Industry and Status fields

#### Dashboard Filtering

**Admin Dashboard** (`/admin/dashboard` and `/admin/overview`):
- Shows ONLY development clients in statistics
- Total clients count includes only development clients
- Recent clients and activity filtered to development clients
- Legacy clients (without clientType field) are included as development clients

**Client Portal** (`/client-portal`):
- Only development clients can access the portal
- Login page rejects non-development clients with message: "Portal access is only available for development clients"
- Session check enforces development-only access

#### Invoice Creation
- **Important**: Invoice creation is available for ALL client types
- Admin can create invoices for any client regardless of type
- This allows billing for video work, consulting, or other services to non-development clients

### 2. Cashfree Payment Link Generation

#### New API Endpoint
**Route**: `POST /api/invoices/[id]/generate-payment-link`

**Functionality**:
1. Fetches invoice details from MongoDB
2. Creates a Cashfree payment order with invoice details
3. Stores payment link and order details in invoice document
4. Returns shareable payment link

**Fields Added to Invoice**:
- `paymentLink`: The shareable Cashfree payment URL
- `cashfreeOrderId`: The Cashfree order ID for tracking
- `paymentSessionId`: The payment session ID
- `paymentLinkCreatedAt`: Timestamp of link generation

#### Integration with Cashfree
Uses existing Cashfree configuration:
- Environment variable: `CASHFREE_MODE` (PROD or SANDBOX)
- App ID: `NEXT_PUBLIC_CASHFREE_APP_ID`
- Secret Key: `CASHFREE_SECRET_KEY`
- Base URL: `NEXT_PUBLIC_BASE_URL`

**Payment URLs**:
- Production: `https://payments.cashfree.com/order/{session_id}`
- Sandbox: `https://sandbox.cashfree.com/pg/view/order/{session_id}`

#### UI Changes - Invoice Management

**Generate Payment Link Button**:
- Location: Invoice preview modal, in action buttons row
- Visibility: Available for all invoice statuses except "cancelled"
- Color: Purple (#7C3AED)
- Icon: IndianRupee icon
- Functionality:
  1. Generates payment link via API
  2. Automatically copies link to clipboard
  3. Shows alert with the payment link
  4. Updates invoice in state with new payment details

**Button States**:
- Normal: "Generate Payment Link"
- Loading: "Generating..." (disabled)
- Disabled for cancelled invoices

## Modified Files

### 1. Client Management
- `/src/app/admin/(dashboard)/clients/page.tsx`
  - Added clientType to Client interface
  - Updated form with clientType dropdown
  - Added clientType to emptyForm defaults
  - Updated handleEdit to include clientType

### 2. API Routes

**Client APIs**:
- `/src/app/api/clients/route.ts`
  - Added query parameter support: `?type=development` or `?type=other`
  - Returns all clients if no type specified

**Dashboard APIs**:
- `/src/app/api/dashboard/overview/route.ts`
  - Filters clients to show only development type
  - Includes legacy clients (no clientType field)

- `/src/app/api/dashboard/stats/route.ts`
  - Filters client counts for development type only
  - Applies filter to current and previous month calculations

**Client Portal APIs**:
- `/src/app/api/client-auth/login/route.ts`
  - Rejects non-development clients at login
  - Error message: "Portal access is only available for development clients"

- `/src/app/api/client-auth/session/route.ts`
  - Validates client type in session check
  - Returns 403 error for non-development clients

**Payment Link API** (NEW):
- `/src/app/api/invoices/[id]/generate-payment-link/route.ts`
  - Creates Cashfree payment order
  - Stores payment link in invoice
  - Returns shareable payment URL

### 3. Invoice Management
- `/src/app/admin/(dashboard)/invoices/page.tsx`
  - Added payment link fields to Invoice interface
  - Added `generatingPaymentLink` state
  - Added `handleGeneratePaymentLink` function
  - Added "Generate Payment Link" button in modal
  - Button copies link to clipboard automatically

## MongoDB Queries

### Filter Development Clients
```javascript
{
  $or: [
    { clientType: 'development' },
    { clientType: { $exists: false } }
  ]
}
```

### Update Invoice with Payment Link
```javascript
db.collection('invoices').updateOne(
  { _id: new ObjectId(invoiceId) },
  {
    $set: {
      paymentLink: url,
      cashfreeOrderId: orderId,
      paymentSessionId: sessionId,
      paymentLinkCreatedAt: new Date()
    }
  }
)
```

## Usage Instructions

### For Admin Users

#### Categorizing Clients:
1. Go to `/admin/clients`
2. Add or edit a client
3. Select "Development Client" for web dev clients
4. Select "Other Services" for video/consulting clients
5. Save

#### Generating Payment Links:
1. Go to `/admin/invoices`
2. Click on any invoice to view details
3. Click "Generate Payment Link" button (purple button)
4. Link is automatically copied to clipboard
5. Share the link with your client via email, WhatsApp, etc.
6. Client can click the link to pay directly via Cashfree

#### Invoice Creation:
- You can create invoices for ANY client type
- Invoice creation dropdown shows all clients
- Useful for billing video work, consulting to non-dev clients

### For Clients

#### Development Clients:
- Can log in to client portal
- See projects, invoices, progress
- Full dashboard access

#### Other Service Clients:
- Cannot access portal (will see error message)
- Receive invoices via email/WhatsApp
- Pay via payment links
- Contact admin for support

## Benefits

### Business Benefits:
1. **Clear Separation**: Development clients vs other services
2. **Focused Dashboards**: Admin sees only relevant dev clients
3. **Flexible Billing**: Can invoice anyone for any service
4. **Easy Payments**: One-click payment link generation

### Technical Benefits:
1. **Backward Compatible**: Legacy clients without type are treated as development
2. **Type Safe**: TypeScript interfaces ensure data consistency
3. **Scalable**: Easy to add more client types in future
4. **Integrated**: Uses existing Cashfree setup

## Future Enhancements

Possible improvements:
1. Add more client types (e.g., "consulting", "video-production")
2. Send payment link via email directly from admin panel
3. Track payment link clicks and conversions
4. Add payment reminder functionality
5. Support multiple payment links per invoice (for partial payments)
6. Add payment link expiry notifications

## Testing

### Test Scenarios:

1. **Client Type Assignment**:
   - Create new development client ✓
   - Create new "other" client ✓
   - Edit existing client to change type ✓
   - Legacy clients show in dashboard ✓

2. **Dashboard Filtering**:
   - Admin dashboard shows only dev clients ✓
   - Stats reflect only dev clients ✓
   - Invoice creation shows all clients ✓

3. **Portal Access**:
   - Development client can log in ✓
   - Other client gets error message ✓
   - Session validates client type ✓

4. **Payment Links**:
   - Generate link for draft invoice ✓
   - Generate link for sent invoice ✓
   - Link copied to clipboard ✓
   - Link works in Cashfree ✓
   - Cannot generate for cancelled invoice ✓

## Support

For issues or questions:
- Email: info@pixelsdigital.tech
- Check Cashfree dashboard for payment status
- Review MongoDB for client and invoice data
- Check browser console for API errors

## Environment Variables Required

Ensure these are set in `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
CASHFREE_MODE=PROD or SANDBOX
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_BASE_URL=your_app_url
```
