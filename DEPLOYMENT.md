# 🚀 SMS Video Editor - Deployment Guide

A complete, fully automated deploymnt guide for the SMS AI-Powered Video Editor platform.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Docker Deployment](#docker-deployment)
4. [AWS Setup](#aws-setup)
5. [Environment Configuration](#environment-configuration)
6. [Local Development](#local-development)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Scaling & Performance](#scaling--performance)

---

## Quick Start

### 30-Second Setup (No Manual Installation Required)

```bash
# 1. Clone/navigate to project
cd sms-video-editor

# 2. Configure environment (interactive setup)
npm run setup

# 3. Start everything with Docker
npm start

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000/api/health
```

That's it! Everything installs and runs automatically inside Docker containers.

---

## Prerequisites

### Required (Automated in Docker)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** - Included with Docker Desktop

### Optional (Development Only)
- Node.js 18+ (for local development without Docker)
- FFmpeg (automatic in Docker, manual if running locally)

## Docker Deployment

### What's in the Docker Setup?

```
Docker Containers:
├── Backend (Node.js + Express)
│   ├── Port: 5000
│   ├── FFmpeg: ✓ Auto-installed
│   ├── Node packages: ✓ Auto-installed
│   └── Database: SQLite (persistent volume)
│
└── Frontend (React + Vite)
    ├── Port: 3000
    ├── Build: ✓ Auto-compiled
    └── Serve: ✓ Production-ready
```

### One-Command Start

```bash
npm start
```

This command:
1. Checks Docker/docker-compose installation ✓
2. Reads environment variables from `.env` ✓
3. Builds backend image (FFmpeg + Node packages) ✓
4. Builds frontend image (Vite build + serve) ✓
5. Starts both containers ✓
6. Verifies health checks ✓
7. Displays access URLs ✓

### Useful Docker Commands

```bash
# View all running containers and status
npm run status

# View real-time logs
npm run logs

# View backend logs only
npm run logs:backend

# View frontend logs only
npm run logs:frontend

# Restart containers
npm run restart

# Stop all containers
npm run stop

# Remove containers and volumes (fresh start)
npm run clean

# Rebuild images without cache
npm run rebuild
```

### Manual Docker Commands (if needed)

```bash
# Build images
docker-compose build

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v

# Stream logs
docker-compose logs -f
```

---

## AWS Setup

### Create S3 Bucket

1. **Go to AWS S3 Console** - https://s3.console.aws.amazon.com/

2. **Create bucket**:
   - Name: `sms-video-editor` (or your preference)
   - Region: `us-east-1` (recommended for lower latency)
   - Block public access: Leave default (application handles access)

3. **Create IAM User** for application access:
   - Go to IAM Console - https://console.aws.amazon.com/iam/
   - Users → Create user
   - Name: `sms-video-editor-app`
   - Attach policy: **AmazonS3FullAccess** (or create custom policy)

4. **Generate Access Keys**:
   - User → Security credentials
   - Create access key (choose Application running outside AWS)
   - Copy **Access Key ID** and **Secret Access Key**

### Bucket CORS Configuration (Optional)

If frontend uploads directly to S3, add CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Environment Configuration

### Interactive Setup Script

```bash
# Windows
npm run setup
# or
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# macOS/Linux
npm run setup
# or
bash scripts/setup.sh
```

### Manual `.env` Configuration

Create `backend/.env`:

```env
# Environment
NODE_ENV=production
PORT=5000

# Database (SQLite in Docker at /app/backend/data/)
DATABASE_URL=./data/sms-video-editor.db

# JWT Token Secret (change this to random 32+ char string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=sms-video-editor
```

### Generate Secure JWT Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (using PowerShell)
[Convert]::ToBase64String((1..32 | % {[byte](Get-Random -Max 256)}))
```

---

## Local Development

### Running Without Docker (For Development)

```bash
# Install dependencies
cd backend
npm install

cd ../frontend
npm install

# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Requirements for Local Development

0. **FFmpeg** - Required for video processing
   - **Windows**: Use Chocolatey: `choco install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `apt-get install ffmpeg`

---

## Production Deployment

### Option 1: AWS EC2 with Docker

```bash
# 1. Launch EC2 instance
# - AMI: Ubuntu 22.04 LTS
# - Instance: t3.medium (2 vCPU, 4GB RAM minimum)
# - Storage: 50GB SSD minimum
# - Security group: Allow ports 80, 443, 3000, 5000

# 2. SSH into instance
ssh -i keypair.pem ubuntu@your-instance-ip

# 3. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clone repository
git clone <your-repo-url>
cd sms-video-editor

# 5. Configure environment
npm run setup

# 6. Start application
npm start

# 7. (Optional) Setup reverse proxy with Nginx for SSL
```

### Option 2: Docker Hub / Container Registry

```bash
# Build and push to Docker Hub
docker login
docker build -t yourusername/sms-video-editor-backend ./backend
docker build -t yourusername/sms-video-editor-frontend ./frontend
docker push yourusername/sms-video-editor-backend
docker push yourusername/sms-video-editor-frontend

# Update docker-compose.yml to use pushed images
# Then deploy to any Docker-compatible platform
```

### Option 3: AWS ECS (Elastic Container Service)

1. Create ECR repositories for backend and frontend
2. Push Docker images to ECR
3. Create ECS cluster
4. Create task definitions pointing to ECR images
5. Create services from task definitions
6. Configure load balancer for frontend

Documentation: https://docs.aws.amazon.com/ecs/

### Option 4: Kubernetes (K8s)

Update `kubernetes/` manifests:
- `deployment.yaml` - Pod definitions
- `service.yaml` - Load balancer config
- `ingress.yaml` - URL routing
- `configmap.yaml` - Environment variables
- `secret.yaml` - AWS credentials

```bash
kubectl apply -f kubernetes/
```

---

## Troubleshooting

### Docker Issues

**Problem**: "Cannot connect to Docker daemon"
```bash
# Solution: Start Docker Desktop or Docker service
# Windows: Open Docker Desktop
# macOS: Open Docker Desktop
# Linux: sudo systemctl start docker
```

**Problem**: "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
docker-compose down
# Edit docker-compose.yml, change port: "3001:3000"
docker-compose up -d
```

**Problem**: Container keeps restarting
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Common issue: Missing .env file
# Solution: Run npm run setup
```

### AWS S3 Issues

**Problem**: "Access Denied" when uploading
```
Solution:
1. Verify AWS credentials in .env are correct
2. Check IAM user has S3FullAccess policy
3. Verify bucket name matches AWS_S3_BUCKET_NAME
4. Check bucket exists in correct region (AWS_REGION)
```

**Problem**: "NoSuchBucket" error
```
Solution:
1. Verify bucket name in AWS_S3_BUCKET_NAME
2. Verify bucket exists in AWS console
3. Check bucket is in correct region
```

### Application Issues

**Problem**: "Cannot connect to backend" (Frontend error)
```bash
# Solution 1: Verify backend is running
npm run logs:backend

# Solution 2: Check API URL in frontend
# Should be http://localhost:5000/api

# Solution 3: Verify backend health
curl http://localhost:5000/api/health
```

**Problem**: "FFmpeg not found" (Video analysis fails)
```bash
# Solution: Check FFmpeg is installed
ffmpeg -version

# In Docker: It's auto-installed, just rebuild
npm run rebuild
```

**Problem**: Database is corrupted or needs reset
```bash
# Solution: Remove database volume
npm run clean

# Then start fresh
npm start
```

---

## Scaling & Performance

### Database Optimization

For production with many users, migrate from SQLite to PostgreSQL:

```bash
# Update backend/package.json
npm install pg

# Update backend/database/init.js to use PostgreSQL
# Use Prisma ORM for easier migration

# Deploy PostgreSQL on AWS RDS
```

### S3 Integration Optimization

```bash
# Use CloudFront CDN for video distribution
# Configure S3 lifecycle policies to archive old files
# Enable S3 Transfer Acceleration for faster uploads
```

### Backend Scaling

```bash
# Scale backend horizontally:
# 1. Use load balancer (AWS ALB)
# 2. Deploy multiple backend containers
# 3. Use shared database (PostgreSQL)
# 4. Use shared file storage (S3)

# In docker-compose.yml:
services:
  backend:
    deploy:
      replicas: 3  # Run 3 instances
```

### Frontend Optimization

```bash
# Already optimized:
# ✓ Vite for fast hot-reload (dev)
# ✓ Production build with minification
# ✓ Code splitting for lazy loading
# ✓ Gzip compression enabled

# Additional: Deploy to CDN
# Use Cloudflare or AWS CloudFront
```

### Video Processing Optimization

```bash
# Current: Synchronous processing (takes time)
# 
# Better approaches:
# 1. Use AWS Lambda for async processing
# 2. Use job queue (Bull/RabbitMQ)
# 3. Process videos in background
# 4. Send progress updates via WebSocket

# Implementation guide in backend/services/
```

---

## Monitoring & Logs

### View Application Logs

```bash
# All containers
npm run logs

# Specific service
npm run logs:backend
npm run logs:frontend

# With timestamp
docker-compose logs --timestamps

# Follow new logs only
docker-compose logs -f --tail=100
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend access
curl http://localhost:3000

# Check container status
npm run status
```

### Performance Monitoring

```bash
# View container resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## Support & Updates

### Check for Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild images with latest code
npm run rebuild

# Restart applications
npm start
```

### Backup Database

```bash
# Database is stored in volume
# Default location: ./backend/data/sms-video-editor.db

# Backup
cp ./backend/data/sms-video-editor.db ./backup/$(date +%Y%m%d).db

# Restore
cp ./backup/DATE.db ./backend/data/sms-video-editor.db
docker-compose restart backend
```

---

## Additional Resources

- **Docker Docs**: https://docs.docker.com
- **docker-compose Reference**: https://docs.docker.com/compose/compose-file/
- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/
- **MediaPipe**: https://mediapipe.dev
- **FFmpeg Wiki**: https://trac.ffmpeg.org/wiki
- **Express.js**: https://expressjs.com
- **React**: https://react.dev

---

**Last Updated**: 2026-03-23  
**Version**: 1.0.0
