import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing file information' },
        { status: 400 }
      );
    }

    // Validate file type - check both MIME type and extension
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/octet-stream', // Sometimes PDFs/docs are sent as this
    ];

    // Get file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt'];

    // Check both MIME type and extension
    const isValidType = allowedTypes.includes(fileType);
    const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      console.log('File validation failed:', { 
        fileName, 
        fileType, 
        fileExtension 
      });
      return NextResponse.json(
        { 
          error: `Invalid file type. Received: ${fileType}. Allowed: PDF, Word, Excel, Images, Text`,
          fileName,
          fileType,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    console.log('Generating presigned URL for:', {
      fileName,
      fileType,
      fileSize
    });

    // Generate presigned URL for upload
    const result = await getPresignedUploadUrl(fileName, fileType);

    if (!result.success) {
      console.error('Failed to generate presigned URL:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    console.log('Presigned URL generated successfully');

    return NextResponse.json({
      success: true,
      uploadUrl: result.uploadUrl,
      fileKey: result.key,
      fileUrl: result.downloadUrl,
      fileName,
      fileSize,
      fileType,
    });
  } catch (error: any) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
