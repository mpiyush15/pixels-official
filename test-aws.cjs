const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function testAWS() {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    console.log('Testing AWS with Access Key:', process.env.AWS_ACCESS_KEY_ID);
    console.log('Secret Key length:', process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.length : 0);
    
    const data = await s3.send(new ListBucketsCommand({}));
    console.log('Success! Buckets:', data.Buckets.map(b => b.Name));
  } catch (error) {
    console.error('AWS Error:', error.message);
  }
}

testAWS();
