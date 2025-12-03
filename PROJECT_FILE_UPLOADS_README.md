# Project File Uploads Feature

## Overview
Added file upload functionality to project milestones, allowing admins to attach documents (reports, PDFs, Word files, etc.) that clients can view and download.

## Features Implemented

### 1. S3 Storage Integration
**File**: `src/lib/s3.ts`
- Added `uploadProjectDocument()` function for uploading project documents
- Files stored in `project-documents/` prefix in S3 bucket
- Automatic filename sanitization and timestamping
- Presigned URLs valid for 30 days
- Metadata includes original filename and upload date

**Supported File Types:**
- PDF documents (`.pdf`)
- Word documents (`.doc`, `.docx`)
- Excel spreadsheets (`.xls`, `.xlsx`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`)
- Text files (`.txt`)

**File Size Limit:** 10MB per file

### 2. Upload API Endpoint
**File**: `src/app/api/upload/route.ts`
- POST endpoint for file uploads
- Admin authentication required
- File type validation
- File size validation (max 10MB)
- Returns S3 key, presigned URL, filename, size, and type

**Usage:**
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// Returns: { success, fileKey, fileUrl, fileName, fileSize, fileType }
```

### 3. Admin Project Management
**File**: `src/app/admin/(dashboard)/projects/page.tsx`

**Updated Milestone Interface:**
```typescript
{
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  fileUrl?: string;      // S3 presigned URL
  fileKey?: string;      // S3 object key
  fileName?: string;     // Original filename
  fileSize?: number;     // File size in bytes
  uploadedAt?: string;   // Upload timestamp
}
```

**Features:**
- File upload button for each milestone
- Drag-and-drop file picker UI
- Upload progress indicator (loading spinner)
- File preview showing filename and size
- Download button for attached files
- Remove file functionality
- Files persist when editing projects

**UI Components:**
- Upload area with dashed border
- File type and size information
- Upload progress feedback
- Attached file display with download link
- Remove file button

### 4. Client Portal Integration
**File**: `src/app/client-portal/projects/page.tsx`

**Features:**
- Displays attached files for each milestone
- File icon with filename and size
- Download button that opens file in new tab
- Responsive design for mobile and desktop
- Clean, professional file attachment display

**UI Design:**
- File cards with icons
- Hover effects on download buttons
- Truncated filenames for long names
- File size display in KB

## Usage Guide

### For Admins:

1. **Creating/Editing a Project:**
   - Navigate to Admin → Projects
   - Click "New Project" or edit existing project
   - Add milestones as usual

2. **Attaching Files to Milestones:**
   - In the milestone section, find "Attach Document (Report, PDF, etc.)"
   - Click "Choose file to upload"
   - Select a file (PDF, Word, Excel, Image, or Text)
   - Wait for upload to complete (spinner shown)
   - File will appear with download and remove options

3. **Managing Attached Files:**
   - View: Click the download icon to preview/download
   - Remove: Click the X button to detach file
   - Replace: Remove existing file and upload new one

4. **Viewing Projects:**
   - Open project view modal
   - Attached files shown under each milestone
   - Click download icon to access file

### For Clients:

1. **Viewing Project Files:**
   - Log in to Client Portal
   - Navigate to "Your Projects"
   - Expand project to see milestones
   - Attached documents shown with file icon

2. **Downloading Files:**
   - Click the download icon next to any attached file
   - File opens in new tab or downloads based on browser settings
   - Files are securely accessible via presigned URLs

## Security Features

- **Authentication:** Only admins can upload files
- **File Type Validation:** Only allowed file types accepted
- **File Size Limits:** 10MB maximum per file
- **Presigned URLs:** Temporary access URLs (30 days validity)
- **S3 Private Bucket:** Files not publicly accessible without presigned URL
- **Filename Sanitization:** Special characters removed from filenames

## Database Schema

Milestone objects in the `projects` collection now include:

```json
{
  "milestones": [
    {
      "name": "Design Phase Complete",
      "status": "completed",
      "dueDate": "2024-12-15",
      "fileUrl": "https://bucket.s3.amazonaws.com/...",
      "fileKey": "project-documents/1234567890-report.pdf",
      "fileName": "Design Report.pdf",
      "fileSize": 524288,
      "uploadedAt": "2024-12-02T10:30:00Z"
    }
  ]
}
```

## Technical Details

### S3 Configuration Required:
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: S3 bucket region
- `S3_BUCKET_NAME`: Bucket name

### API Routes:
- `POST /api/upload` - Upload file to S3
- `POST /api/projects` - Create project with milestones
- `PATCH /api/projects/[id]` - Update project with milestones

### File Storage Structure:
```
s3://your-bucket/
├── invoices/
│   └── ... (existing invoices)
└── project-documents/
    ├── 1733136600000-project_report.pdf
    ├── 1733136700000-design_mockup.pdf
    └── ...
```

## Benefits

1. **Centralized Document Management:** All project documents in one place
2. **Client Access:** Clients can download reports and documents anytime
3. **Professional Presentation:** Clean UI for document sharing
4. **Scalable Storage:** AWS S3 handles unlimited documents
5. **Secure Access:** Presigned URLs ensure controlled access
6. **File Organization:** Timestamped filenames prevent conflicts

## Future Enhancements (Optional)

- [ ] Multiple files per milestone
- [ ] File version history
- [ ] Bulk file upload
- [ ] File preview (PDF viewer)
- [ ] Email notifications when files are added
- [ ] File expiry/renewal mechanism
- [ ] Folder structure for better organization
- [ ] Search/filter files by type or date

## Testing

1. **Admin Upload Test:**
   - Create a new project with milestone
   - Upload a PDF file
   - Verify file appears in form
   - Save project
   - Check file is accessible in view modal

2. **Client Access Test:**
   - Log in as client
   - View project with attached files
   - Download file to verify access
   - Check file opens correctly

3. **Error Handling Test:**
   - Try uploading file > 10MB (should fail)
   - Try uploading unsupported file type (should fail)
   - Try uploading without admin auth (should fail)

## Support

For issues or questions:
- Check S3 credentials are correctly configured
- Verify file size is under 10MB
- Ensure file type is supported
- Check browser console for detailed error messages
