#!/bin/bash

# SMS Video Editor - Setup Script
# This script initializes the environment variables for Docker deployment

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SMS AI-Powered Video Editor - Setup Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✓ .env file already exists"
    read -p "Do you want to reconfigure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration"
        exit 0
    fi
fi

echo ""
echo "AWS S3 Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# AWS Configuration
read -p "AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
while [ -z "$AWS_ACCESS_KEY_ID" ]; do
    echo "✗ AWS Access Key ID is required"
    read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
done

read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
while [ -z "$AWS_SECRET_ACCESS_KEY" ]; do
    echo "✗ AWS Secret Access Key is required"
    read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
done
echo ""

read -p "AWS S3 Bucket Name: " AWS_S3_BUCKET_NAME
while [ -z "$AWS_S3_BUCKET_NAME" ]; do
    echo "✗ S3 Bucket Name is required"
    read -p "AWS S3 Bucket Name: " AWS_S3_BUCKET_NAME
done

echo ""
echo "JWT Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "JWT Secret (leave blank to auto-generate): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "✓ Generated JWT Secret"
fi

# Create .env file
cat > .env << EOF
# Environment Configuration
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=./data/sms-video-editor.db

# JWT
JWT_SECRET=$JWT_SECRET

# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=$AWS_S3_BUCKET_NAME
EOF

echo ""
echo "✓ Configuration saved to .env"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                           ║"
echo "║  Run: docker-compose up                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
