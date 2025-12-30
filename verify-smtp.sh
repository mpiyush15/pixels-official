#!/bin/bash

# Quick SMTP Credential Verification Script

echo "🔍 Zeptomail SMTP Verification"
echo "================================"
echo ""

# Check if variables are set
echo "1️⃣  Checking Environment Variables..."
if [ -z "$SMTP_HOST" ]; then
  echo "❌ SMTP_HOST not set"
else
  echo "✅ SMTP_HOST = $SMTP_HOST"
fi

if [ -z "$SMTP_PORT" ]; then
  echo "❌ SMTP_PORT not set"
else
  echo "✅ SMTP_PORT = $SMTP_PORT"
fi

if [ -z "$SMTP_USER" ]; then
  echo "❌ SMTP_USER not set"
else
  echo "✅ SMTP_USER = $SMTP_USER"
fi

if [ -z "$SMTP_PASSWORD" ]; then
  echo "❌ SMTP_PASSWORD not set"
else
  echo "✅ SMTP_PASSWORD is set (length: ${#SMTP_PASSWORD} chars)"
fi

echo ""
echo "2️⃣  Testing SMTP Connection..."
echo "Host: smtp.zeptomail.in"
echo "Port: 587"
echo ""

# Try to connect using curl (if available)
if command -v nc &> /dev/null; then
  timeout 5 nc -zv smtp.zeptomail.in 587
  if [ $? -eq 0 ]; then
    echo "✅ SMTP Server is reachable"
  else
    echo "❌ Cannot reach SMTP server"
  fi
else
  echo "⚠️  'nc' command not found, skipping connectivity test"
fi

echo ""
echo "3️⃣  Next Steps:"
echo "  1. Verify SMTP_PASSWORD in Vercel environment variables"
echo "  2. Check Zeptomail account status at https://www.zeptomail.com/"
echo "  3. If credentials are expired, regenerate API key in Zeptomail"
echo "  4. Redeploy on Vercel after updating variables"
echo ""
