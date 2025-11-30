# Pixels Digital - Admin Dashboard

A powerful Next.js admin dashboard for managing leads, clients, invoices, and business analytics.

## Features

### 🔐 Authentication
- Secure admin login with JWT tokens
- Protected dashboard routes
- Admin credentials:
  - Email: `piyush@pixelsdigital.tech`
  - Password: `Pm@22442232`

### 📊 Dashboard
- Real-time business statistics
- Revenue tracking
- Client and lead metrics
- Quick actions

### 📬 Leads Management
- Capture leads from website contact form
- Lead status tracking (New, Contacted, Converted, Closed)
- Lead details and contact information
- Filter and sort leads

### 👥 Client Management
- Add and manage clients
- Client company and contact details
- Track total revenue per client
- Active/Inactive status
- Project count tracking

### 📄 Invoices
- Create professional invoices
- Pre-defined service catalog with pricing:
  - Website Development: ₹50,000
  - E-commerce Website: ₹75,000
  - Social Media Marketing (Monthly): ₹15,000
  - SEO Services (Monthly): ₹12,000
  - Video Content Creation: ₹8,000
  - Corporate Video: ₹25,000
  - Graphic Design: ₹5,000
  - Logo Design: ₹10,000
  - Brand Identity Package: ₹30,000
  - Content Writing: ₹3,000
- Automatic invoice numbering
- Tax calculation (18% GST)
- Invoice status tracking (Draft, Sent, Paid, Overdue)
- Print and download invoices

### 📈 Business Overview
- Total revenue analytics
- Monthly revenue trends
- Top clients by revenue
- Invoice collection rates
- Revenue charts and graphs
- Key business metrics

## Getting Started

### 1. Initialize Admin User

Visit the following URL to create the admin account (only needed once):
```
http://localhost:3000/api/auth/init-admin
```

### 2. Access Dashboard

Navigate to:
```
http://localhost:3000/admin/login
```

Login with:
- Email: `piyush@pixelsdigital.tech`
- Password: `Pm@22442232`

### 3. Dashboard Routes

- `/admin/dashboard` - Main dashboard with statistics
- `/admin/leads` - Manage website leads
- `/admin/clients` - Manage clients
- `/admin/invoices` - Create and manage invoices
- `/admin/overview` - Business analytics and reports

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Authentication**: JWT + HTTP-only cookies
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Database Collections

### admins
- Admin user credentials
- Role-based access

### leads
- Website contact form submissions
- Status tracking
- Source tracking

### clients
- Client information
- Company details
- Revenue tracking
- Project counts

### invoices
- Invoice details
- Service line items
- Payment status
- Client references

## API Routes

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/auth/init-admin` - Initialize admin user

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/overview` - Business overview data

### Leads
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `PATCH /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `PATCH /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP-only cookies
- Protected routes with middleware
- Server-side validation

## Contact Form Integration

The contact form on `/contact` automatically creates leads in the database. All submissions are available in the admin dashboard under Leads section.

## Environment Variables

Required in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Notes

- Default tax rate is set to 18% (Indian GST)
- Invoice numbers are auto-generated (INV-00001, INV-00002, etc.)
- All monetary values are in Indian Rupees (₹)
- Client revenue is automatically updated when invoices are marked as paid
- Dashboard statistics update in real-time

## Future Enhancements

- Email notifications for invoices
- PDF invoice generation
- Advanced analytics and reports
- Multi-user support
- Invoice payment gateway integration
- Automated follow-ups for leads
- Calendar integration for meetings
- Document management system
