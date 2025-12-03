import { NextRequest, NextResponse } from 'next/server';
import { uploadInvoiceToS3, listInvoices, getPresignedDownloadUrl } from '@/lib/s3';

/**
 * Test S3 Bucket Operations
 * Tests: list, upload, presigned URL generation
 */
export async function POST(request: NextRequest) {
  try {
    const results: any = {
      tests: [],
      bucket: process.env.S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
      prefix: process.env.S3_PREFIX,
    };

    // Test 0: Check bucket region
    console.log('Test 0: Checking bucket region...');
    try {
      const { getBucketRegion } = await import('@/lib/s3');
      const actualRegion = await getBucketRegion();
      results.actualBucketRegion = actualRegion;
      results.tests.push({
        test: 'Detect Bucket Region',
        status: '✅ PASSED',
        message: `Bucket is in region: ${actualRegion}`,
        data: { region: actualRegion },
      });
    } catch (error: any) {
      results.tests.push({
        test: 'Detect Bucket Region',
        status: '❌ FAILED',
        error: error.message,
      });
    }

    // Test 1: List bucket contents
    console.log('Test 1: Listing bucket contents...');
    try {
      const objects = await listInvoices(10);
      results.tests.push({
        test: 'List Bucket',
        status: '✅ PASSED',
        message: `Found ${objects.length} objects`,
        data: objects.map((obj: any) => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified,
        })),
      });
    } catch (error: any) {
      results.tests.push({
        test: 'List Bucket',
        status: '❌ FAILED',
        error: error.message,
      });
    }

    // Test 2: Upload a test invoice
    console.log('Test 2: Uploading test invoice...');
    try {
      const testContent = `
        <!DOCTYPE html>
        <html>
        <head><title>Test Invoice</title></head>
        <body>
          <h1>Test Invoice</h1>
          <p>Invoice #: TEST-${Date.now()}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Amount: ₹25,000</p>
          <p>This is a test invoice generated at ${new Date().toISOString()}</p>
        </body>
        </html>
      `;

      const filename = `test-invoice-${Date.now()}.html`;
      const uploadResult = await uploadInvoiceToS3(filename, testContent, 'text/html');

      if (uploadResult.success) {
        results.tests.push({
          test: 'Upload File',
          status: '✅ PASSED',
          message: 'File uploaded successfully',
          data: {
            key: uploadResult.key,
            presignedUrl: uploadResult.url,
            urlExpiresIn: '7 days',
          },
        });
        results.testFileUrl = uploadResult.url;
      } else {
        results.tests.push({
          test: 'Upload File',
          status: '❌ FAILED',
          error: uploadResult.error,
        });
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Upload File',
        status: '❌ FAILED',
        error: error.message,
      });
    }

    // Test 3: Generate presigned URL for existing file
    console.log('Test 3: Generating presigned URL...');
    try {
      const objects = await listInvoices(1);
      if (objects.length > 0) {
        const url = await getPresignedDownloadUrl(objects[0].Key, 3600);
        results.tests.push({
          test: 'Generate Presigned URL',
          status: '✅ PASSED',
          message: 'Presigned URL generated successfully',
          data: {
            key: objects[0].Key,
            url: url,
            expiresIn: '1 hour',
          },
        });
      } else {
        results.tests.push({
          test: 'Generate Presigned URL',
          status: '⚠️ SKIPPED',
          message: 'No existing files to test with',
        });
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Generate Presigned URL',
        status: '❌ FAILED',
        error: error.message,
      });
    }

    // Summary
    const passed = results.tests.filter((t: any) => t.status.includes('✅')).length;
    const failed = results.tests.filter((t: any) => t.status.includes('❌')).length;
    const skipped = results.tests.filter((t: any) => t.status.includes('⚠️')).length;

    results.summary = {
      total: results.tests.length,
      passed,
      failed,
      skipped,
      allPassed: failed === 0,
    };

    return NextResponse.json(results, { status: failed === 0 ? 200 : 500 });
  } catch (error: any) {
    console.error('S3 test error:', error);
    return NextResponse.json(
      {
        error: 'S3 test failed',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
