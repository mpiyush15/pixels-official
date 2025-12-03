import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetBucketLocationCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ---------------------------------------------------------------------
// Initialize S3 Client
// ---------------------------------------------------------------------
const initializeS3Client = () => {
  const region = process.env.AWS_REGION || 'us-east-1';
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

let s3Client = initializeS3Client();

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const PREFIX = process.env.S3_PREFIX || 'invoices/';
const PROJECT_DOCUMENTS_PREFIX = 'project-documents/';

// ---------------------------------------------------------------------
// Detect Bucket Region
// ---------------------------------------------------------------------
export async function getBucketRegion(): Promise<string> {
  try {
    const locationClient = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetBucketLocationCommand({ Bucket: BUCKET_NAME });
    const response = await locationClient.send(command);

    const bucketRegion = response.LocationConstraint || 'us-east-1';

    if (bucketRegion !== (process.env.AWS_REGION || 'us-east-1')) {
      s3Client = new S3Client({
        region: bucketRegion,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
    }

    return bucketRegion;
  } catch (error) {
    console.error('Error getting bucket region:', error);
    return process.env.AWS_REGION || 'us-east-1';
  }
}

// ---------------------------------------------------------------------
// Helpers & Types
// ---------------------------------------------------------------------
export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

// ---------------------------------------------------------------------
// Generate Presigned DOWNLOAD URL — Fixed (< 7 days max)
// ---------------------------------------------------------------------
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  // AWS max allowed: 604800 (7 days)
  if (expiresIn > 604800) expiresIn = 604800;

  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, getCommand, {
    expiresIn,
  });
}

// ---------------------------------------------------------------------
// Upload Invoice Directly (Server Upload)
// ---------------------------------------------------------------------
export async function uploadInvoiceToS3(
  filename: string,
  content: Buffer | string,
  contentType: string = 'application/pdf'
): Promise<UploadResult> {
  try {
    const key = `${PREFIX}${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Download URL – valid for 7 days max
    const presignedUrl = await getPresignedDownloadUrl(key, 604800);

    return {
      success: true,
      key,
      url: presignedUrl,
    };
  } catch (error: any) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload to S3',
    };
  }
}

// ---------------------------------------------------------------------
// Direct Browser Upload (Presigned PUT URL)
// ---------------------------------------------------------------------
export async function getPresignedUploadUrl(
  filenameOrKey: string,
  contentType: string = 'application/pdf'
): Promise<{
  success: boolean;
  uploadUrl?: string;
  key?: string;
  downloadUrl?: string;
  error?: string;
}> {
  try {
    // Check if this is already a full key path (e.g., work-submissions/...)
    // or just a filename that needs the default prefix
    let key: string;
    
    if (filenameOrKey.includes('/')) {
      // It's already a full key path
      key = filenameOrKey;
    } else {
      // It's just a filename, add the default prefix and timestamp
      const sanitizedFilename = filenameOrKey.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      key = `${PROJECT_DOCUMENTS_PREFIX}${timestamp}-${sanitizedFilename}`;
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Metadata: {
        'original-filename': filenameOrKey.split('/').pop() || filenameOrKey,
        'upload-date': new Date().toISOString(),
      },
    });

    // Upload URL valid 1 hour
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Download URL valid max 7 days
    const downloadUrl = await getPresignedDownloadUrl(key, 604800);

    return {
      success: true,
      uploadUrl,
      key,
      downloadUrl,
    };
  } catch (error: any) {
    console.error('Error generating presigned upload URL:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate presigned upload URL',
    };
  }
}

// ---------------------------------------------------------------------
// Deprecated Server Upload for Project Docs (Still Works)
// ---------------------------------------------------------------------
export async function uploadProjectDocument(
  filename: string,
  content: Buffer,
  contentType: string = 'application/pdf'
): Promise<UploadResult> {
  try {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const key = `${PROJECT_DOCUMENTS_PREFIX}${timestamp}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: contentType,
      Metadata: {
        'original-filename': filename,
        'upload-date': new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Download URL max 7 days
    const presignedUrl = await getPresignedDownloadUrl(key, 604800);

    return {
      success: true,
      key,
      url: presignedUrl,
    };
  } catch (error: any) {
    console.error('S3 project document upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload project document',
    };
  }
}

// ---------------------------------------------------------------------
// List Files
// ---------------------------------------------------------------------
export async function listInvoices(maxKeys: number = 10): Promise<any[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: PREFIX,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('S3 list error:', error);
    return [];
  }
}

// ---------------------------------------------------------------------
// Check File Exists
// ---------------------------------------------------------------------
export async function checkFileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}
