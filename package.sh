#!/bin/bash

# Package the application for deployment
echo "📦 Creating deployment package..."

# Remove old zip if exists
rm -f diary-backend-deploy.zip

# Create new zip excluding unnecessary files
zip -r diary-backend-deploy.zip . \
  -x "venv/*" \
  -x "*__pycache__*" \
  -x "*.pyc" \
  -x ".git/*" \
  -x ".env" \
  -x "diary-backend.zip" \
  -x "package.sh"

echo "✅ Created: diary-backend-deploy.zip"
echo ""
echo "📤 Upload to EC2 with:"
echo "scp -i your-key.pem diary-backend-deploy.zip ubuntu@your-ec2-ip:/home/ubuntu/"
