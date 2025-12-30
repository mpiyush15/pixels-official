import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Validate AWS credentials
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'pixelsdigital';

if (!awsAccessKeyId || !awsSecretAccessKey) {
  console.error('Missing AWS credentials in environment variables');
}

// Initialize S3 client
const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId || '',
    secretAccessKey: awsSecretAccessKey || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    // Validate AWS credentials first
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.error('AWS credentials not configured');
      return NextResponse.json(
        { error: 'S3 upload not configured. Please set AWS credentials.' },
        { status: 500 }
      );
    }

    // Check authentication (staff or admin)
    const staffToken = request.cookies.get('staff-token')?.value;
    const adminToken = request.cookies.get('admin-token')?.value;
    
    if (!staffToken && !adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `task-uploads/${timestamp}-${sanitizedFileName}`;

    console.log('S3 Key:', key);
    console.log('Bucket:', bucketName);
    console.log('Region:', awsRegion);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 - Try with ACL first, fallback without ACL if it fails
    let uploadParams: any = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    console.log('Uploading to S3...');
    try {
      // Try with ACL first
      uploadParams.ACL = 'public-read';
      const result = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('S3 upload result (with ACL):', result);
    } catch (aclError: any) {
      // If ACL fails, try without it
      if (aclError.name === 'AccessControlListNotSupported' || aclError.Code === 'AccessControlListNotSupported') {
        console.log('ACL not supported, retrying without ACL...');
        delete uploadParams.ACL;
        const result = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log('S3 upload result (without ACL):', result);
      } else {
        throw aclError;
      }
    }

    // Construct URL
    const url = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${key}`;

    console.log('File uploaded successfully:', url);

    return NextResponse.json({
      success: true,
      url,
      key,
      name: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error uploading to S3:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error.message,
        code: error.code || error.name,
      },
      { status: 500 }
    );
  }
}
