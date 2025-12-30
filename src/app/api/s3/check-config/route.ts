import { NextResponse } from 'next/server';

export async function GET() {
  const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID;
  const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY;
  const hasRegion = !!process.env.AWS_REGION;
  const hasBucket = !!process.env.AWS_S3_BUCKET_NAME;

  const accessKeyLength = process.env.AWS_ACCESS_KEY_ID?.length || 0;
  const secretKeyLength = process.env.AWS_SECRET_ACCESS_KEY?.length || 0;

  return NextResponse.json({
    configured: hasAccessKey && hasSecretKey,
    details: {
      AWS_ACCESS_KEY_ID: hasAccessKey ? `Set (${accessKeyLength} chars)` : 'Missing',
      AWS_SECRET_ACCESS_KEY: hasSecretKey ? `Set (${secretKeyLength} chars)` : 'Missing',
      AWS_REGION: hasRegion ? process.env.AWS_REGION : 'Missing (default: ap-south-1)',
      AWS_S3_BUCKET_NAME: hasBucket ? process.env.AWS_S3_BUCKET_NAME : 'Missing (default: pixelsdigital)',
    },
    ready: hasAccessKey && hasSecretKey,
  });
}
