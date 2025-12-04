#!/bin/bash

# Upload logo to S3
echo "Uploading logo to S3..."

# You need to have the logo file in the current directory as 'logo.png'
# Run this command manually:
# aws s3 cp logo.png s3://pixels-official/images/logo.png --acl public-read

echo "After uploading, the logo will be accessible at:"
echo "https://pixels-official.s3.ap-south-1.amazonaws.com/images/logo.png"
