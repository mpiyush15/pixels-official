#!/bin/bash

# Navigate to the project directory if needed, assuming the script is run from the project root
echo "🚀 Starting deployment..."

echo "📥 Pulling latest changes from git..."
git pull origin main # Change 'main' if your default branch is 'master'

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building the production application..."
npm run build

echo "🔄 Restarting PM2 process..."
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "✅ Deployment successful!"
