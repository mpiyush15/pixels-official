#!/bin/bash

# Test Invoice Email Script
# Usage: ./test-invoice.sh your@email.com

if [ -z "$1" ]; then
    echo "❌ Please provide an email address"
    echo "Usage: ./test-invoice.sh your@email.com"
    exit 1
fi

EMAIL=$1

echo "📧 Sending test invoice email to: $EMAIL"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/email/test-invoice \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"$EMAIL\"}")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Check your inbox at: $EMAIL"
echo "📋 Check spam folder if not found"
