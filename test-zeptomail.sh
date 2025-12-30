#!/bin/bash

# Quick Zeptomail API test
echo "🧪 Testing Zeptomail API Token..."

# Check if token is set
if [ -z "$ZEPTOMAIL_API_TOKEN" ]; then
  echo "❌ ZEPTOMAIL_API_TOKEN not set in environment"
  exit 1
fi

echo "✅ Token found"
echo "Token length: ${#ZEPTOMAIL_API_TOKEN} characters"
echo "Token starts with: $(echo $ZEPTOMAIL_API_TOKEN | cut -c1-20)..."

# Test with curl
echo ""
echo "🔍 Testing API endpoint..."

RESPONSE=$(curl -s -X POST https://api.zeptomail.com/v1.1/email \
  -H "Authorization: $ZEPTOMAIL_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {
      "address": "no-reply@pixelsdigital.tech",
      "name": "Pixels Digital"
    },
    "to": [{
      "email_address": {
        "address": "test@example.com",
        "name": "Test"
      }
    }],
    "subject": "Test Email",
    "htmlbody": "<p>This is a test</p>"
  }')

echo "Response:"
echo $RESPONSE | jq '.' 2>/dev/null || echo $RESPONSE

# Check for error
if echo $RESPONSE | grep -q "error\|Error\|failed\|Failed"; then
  echo ""
  echo "❌ API returned an error"
  exit 1
else
  echo ""
  echo "✅ API response looks good"
fi
