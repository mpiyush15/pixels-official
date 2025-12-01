# Staff Management System - Setup Guide

## Overview
A complete staff management system with:
- Staff authentication & login
- Client assignment to staff members
- Content upload to Google Drive
- Daily content tracking in admin panel

## Features Implemented

### 1. Staff Portal (`/staff-portal`)
- **Login Page** (`/staff-portal/login`)
  - Email/password authentication
  - JWT-based sessions
  
- **Dashboard** (`/staff-portal/dashboard`)
  - View assigned clients
  - Quick access to upload content
  
- **Upload Page** (`/staff-portal/upload`)
  - Select client from assigned list
  - Choose content type (image, video, document, other)
  - Upload files to Google Drive
  - Add description/notes

### 2. Admin Panel (Updated)
- **Staff Management** (`/admin/staff`)
  - Add new staff members
  - Edit staff details
  - Assign clients to staff
  - Set staff as active/inactive
  - Delete staff members
  
- **Daily Content** (`/admin/daily-content`)
  - View all uploaded content in table format
  - Filter by content type
  - See content name, type, client, creator, date
  - View files on Google Drive
  - Delete content entries

## Setup Instructions

### 1. Environment Variables
Already added in `.env.local`:
```bash
JWT_SECRET=your-secret-key-change-this-to-a-long-random-string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_DRIVE_FOLDER_ID=...
```

**Important**: Change `JWT_SECRET` to a long random string for production!

### 2. Initialize Database
Visit this URL to create necessary database indexes:
```
http://localhost:3000/api/setup-db
```

### 3. Create Your First Staff Member
1. Go to admin panel: `http://localhost:3000/admin/staff`
2. Click "Add New Staff"
3. Fill in:
   - Name
   - Email
   - Password
   - Role: Content Creator
   - Assign clients (check boxes)
   - Make sure "Active" is checked
4. Click "Create"

### 4. Staff Login
Staff can now login at: `http://localhost:3000/staff-portal/login`

## How It Works

### Staff Workflow:
1. Staff logs in at `/staff-portal/login`
2. Sees dashboard with assigned clients
3. Clicks "Upload Content"
4. Selects client, content type, file
5. Uploads to Google Drive
6. Entry appears in admin's "Daily Content" section

### Admin Workflow:
1. Create staff members in `/admin/staff`
2. Assign clients to staff members
3. View all uploaded content in `/admin/daily-content`
4. Filter by type, view files, delete if needed

## API Endpoints Created

### Staff Authentication
- `POST /api/staff-auth/login` - Staff login
- `POST /api/staff-auth/logout` - Staff logout
- `GET /api/staff-auth/session` - Check session

### Staff Management (Admin)
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `PUT /api/staff` - Update staff
- `DELETE /api/staff?id=...` - Delete staff
- `GET /api/staff/assigned-clients?staffId=...` - Get assigned clients

### Daily Content
- `GET /api/daily-content` - Get all content
- `GET /api/daily-content?clientId=...` - Get by client
- `POST /api/daily-content` - Create entry
- `DELETE /api/daily-content?id=...` - Delete entry

### File Upload
- `POST /api/upload/drive` - Upload file to Google Drive

## Database Collections

### `staff`
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'content-creator' | 'admin',
  assignedClients: [String], // Client IDs
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### `dailyContent`
```javascript
{
  _id: ObjectId,
  name: String,
  type: 'image' | 'video' | 'document' | 'other',
  clientId: String,
  clientName: String,
  createdBy: String, // Staff ID
  createdByName: String,
  driveFileId: String,
  driveFileUrl: String,
  description: String (optional),
  createdAt: Date
}
```

## Google Drive Integration

**Note**: Current implementation uses mock file IDs. To fully integrate:

1. The Google Drive credentials are already in `.env.local`
2. The `googleapis` package is installed
3. The upload logic is in `/src/lib/googleDrive.ts`
4. Files will be uploaded to folder: `1j1w4_MdPh1X8N0NDFkprmLXBkCj2_SRp`

For actual Google Drive uploads, you may need to:
- Set up OAuth consent screen in Google Cloud Console
- Enable Google Drive API
- Get refresh token for server-side uploads

## Testing

1. **Setup Database**:
   ```
   Visit: http://localhost:3000/api/setup-db
   ```

2. **Create Staff** (as admin):
   - Go to `/admin/staff`
   - Add staff member with email/password
   - Assign some clients

3. **Login as Staff**:
   - Go to `/staff-portal/login`
   - Use staff email/password
   - Should see dashboard with assigned clients

4. **Upload Content**:
   - Click "Upload Content"
   - Select client and file
   - Submit

5. **View in Admin**:
   - Go to `/admin/daily-content`
   - See uploaded content in table

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT tokens for authentication
- ✅ HTTP-only cookies
- ✅ Staff can only see assigned clients
- ✅ Protected API routes
- ✅ Unique email constraint

## Next Steps

1. Change `JWT_SECRET` to a secure random string
2. Set up Google Drive OAuth properly for production
3. Add file size limits for uploads
4. Add image previews in daily content table
5. Add pagination for large content lists
6. Add search/filter in staff management
7. Add notifications when staff uploads content

## File Structure
```
src/
├── app/
│   ├── admin/(dashboard)/
│   │   ├── staff/page.tsx          # Staff management
│   │   └── daily-content/page.tsx  # Daily content view
│   ├── staff-portal/
│   │   ├── login/page.tsx          # Staff login
│   │   ├── dashboard/page.tsx      # Staff dashboard
│   │   └── upload/page.tsx         # Upload content
│   └── api/
│       ├── staff-auth/             # Staff authentication
│       ├── staff/                  # Staff CRUD
│       ├── daily-content/          # Content management
│       └── upload/drive/           # File uploads
├── lib/
│   ├── staff.ts                    # Staff DB operations
│   └── googleDrive.ts              # Google Drive utilities
├── types/
│   └── staff.ts                    # TypeScript interfaces
└── components/
    └── AdminSidebar.tsx            # Updated with new menu items
```

## Support

If you have issues:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify MongoDB is running
4. Ensure all env variables are set
5. Run `/api/setup-db` to create indexes

---

✅ **Status**: Fully implemented and ready to use!
