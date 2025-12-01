import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { google } from 'googleapis';
import { Readable } from 'stream';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secret);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const clientId = formData.get('clientId') as string;
    const clientName = formData.get('clientName') as string;
    const contentType = formData.get('contentType') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Google Drive
    let driveFileId = '';
    let driveFileUrl = '';

    try {
      // Set up Google Drive OAuth2 client with your credentials
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set the refresh token to get access tokens automatically
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });
      }
      
      const drive = google.drive({ 
        version: 'v3', 
        auth: oauth2Client 
      });

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      const fileMetadata = {
        name: fileName || file.name,
        parents: folderId ? [folderId] : [],
      };

      const media = {
        mimeType: file.type || 'application/octet-stream',
        body: Readable.from(buffer),
      };

      console.log('Uploading to Google Drive:', fileName || file.name);

      const uploadResult = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      if (uploadResult.data.id) {
        driveFileId = uploadResult.data.id;
        driveFileUrl = uploadResult.data.webViewLink || `https://drive.google.com/file/d/${uploadResult.data.id}/view`;
        
        console.log('Successfully uploaded to Google Drive:', driveFileId);
        
        // Make file accessible - set permissions to anyone with link
        try {
          await drive.permissions.create({
            fileId: uploadResult.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
          console.log('File permissions set to public');
        } catch (permErr) {
          console.log('Permission setting skipped:', permErr);
        }
      }

    } catch (driveError: any) {
      console.error('Google Drive upload error:', driveError.message);
      
      // Fallback: Save to server temporarily and provide folder link
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filename = `${Date.now()}_${file.name}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      
      driveFileId = filename;
      driveFileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${filename}`;
      
      console.log('File saved locally at:', filepath);
      console.log('Access at:', driveFileUrl);
    }

    // Create daily content entry
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/daily-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `staff-token=${token}`,
      },
      body: JSON.stringify({
        name: fileName || file.name,
        type: contentType,
        clientId,
        clientName,
        driveFileId: driveFileId,
        driveFileUrl: driveFileUrl,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create content entry');
    }

    const content = await response.json();

    return NextResponse.json({
      success: true,
      fileId: driveFileId,
      fileUrl: driveFileUrl,
      content,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
