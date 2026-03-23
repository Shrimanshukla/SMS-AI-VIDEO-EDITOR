# 🛠️ Local Development Setup (Optional - Docker Recommended)

If you prefer to run the application locally without Docker, follow this guide.

## ⚠️ Recommendation

**Docker is recommended** because it:
- Eliminates "it works on my machine" problems
- Automatically installs all dependencies
- Matches production environment exactly
- Requires no manual FFmpeg installation

However, if you want to develop locally, this guide walks you through manual setup.

---

## Prerequisites

### Windows

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Install and verify: `node --version`

2. **FFmpeg**
   ```bash
   # Using Chocolatey (recommended)
   choco install ffmpeg
   ```
   
   OR manually:
   - Download: https://ffmpeg.org/download.html
   - Add to PATH
   - Verify: `ffmpeg -version`

3. **Git** (optional, for cloning)
   - Download: https://git-scm.com/

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install FFmpeg
brew install ffmpeg

# Verify installations
node --version
ffmpeg -version
```

### Linux (Ubuntu/Debian)

```bash
# Update package manager
sudo apt-get update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg
sudo apt-get install -y ffmpeg

# Verify installations
node --version
ffmpeg -version
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- Express.js (web server)
- SQLite3 (database)
- JWT libraries (authentication)
- AWS SDK (S3 integration)
- FFmpeg wrapper (video processing)
- MediaPipe libraries (pose detection)

### 2. Configure Environment

Create `backend/.env`:

```env
DATABASE_URL=./sms-video-editor.db
JWT_SECRET=your-super-secret-jwt-key-change-this-to-32-characters
PORT=5000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=sms-video-editor

NODE_ENV=development
```

### 3. Start Backend Server

```bash
npm start
```

Output should show:
```
✓ Server running on http://localhost:5000
✓ Database initialized
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- React 18 (UI framework)
- Vite (build tool)
- Zustand (state management)
- Axios (API client)
- React Router (navigation)
- Framer Motion (animations)

### 2. Configure Environment

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

Output should show:
```
  VITE v5.0.0  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Running the Application

### Terminal Setup

You need **two terminal windows** (or use tmux/screen):

**Terminal 1** - Backend:
```bash
cd backend
npm start
```

**Terminal 2** - Frontend:
```bash
cd frontend
npm run dev
```

### Access Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

### Test It Works

1. Open http://localhost:5173 in browser
2. Sign up with test credentials
3. Create a project
4. Upload a video
5. Backend processes video and returns pose data

---

## Database

### Using SQLite

The application uses SQLite for development (automatically created):

```bash
# Database file location
backend/sms-video-editor.db
```

### Initialize Database

When you first start the backend, it automatically:
- Creates database file
- Creates tables (users, projects, analysis)
- Sets up indexes

### View Database (Optional)

```bash
# Install SQLite browser (optional)
# Windows/macOS: https://sqlitebrowser.org/
# Linux: sudo apt-get install sqlitebrowser

# Or use command line
sqlite3 sms-video-editor.db
sqlite> .tables
sqlite> SELECT * FROM users;
sqlite> .quit
```

### Reset Database

```bash
# Stop backend server (Ctrl+C)

# Delete database file
rm backend/sms-video-editor.db

# Restart backend - new database will be created
npm start
```

---

## Troubleshooting Local Setup

### "FFmpeg not found"

```bash
# Verify FFmpeg is installed
ffmpeg -version

# Add to PATH (if needed):
# macOS/Linux: Check installation path
which ffmpeg

# Windows: Add to PATH
# Settings → Environment Variables → PATH → Add C:\ffmpeg\bin
```

### "Port 5000 already in use"

```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in backend/.env
PORT=5001
```

### "npm install fails"

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### "Cannot connect to database"

```bash
# Ensure backend is running
npm start

# Check SQLite is installed
npm list sqlite3

# Rebuild sqlite3 (sometimes needed)
npm rebuild sqlite3
```

### "AWS S3 upload fails"

```bash
# Verify AWS credentials in .env
# Test credentials:
aws s3 ls --profile default

# Ensure bucket exists
aws s3 ls s3://sms-video-editor --region us-east-1
```

---

## Development Workflow

### Making Changes

**Backend**:
```bash
# Edit backend files
# Server auto-reloads if using nodemon
# Or manually restart: Ctrl+C, npm start
```

**Frontend**:
```bash
# Edit React files
# Vite hot-reloads automatically
# Changes appear in browser instantly
```

### Debugging

**Backend**:
```bash
# Add debug logging
console.log('Debug message:', variable);

# View in terminal where npm start is running
```

**Frontend**:
```bash
# Use browser DevTools
# F12 or Right-click → Inspect

# Add console logging
console.log('State:', store);
```

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/dist/`:
- Minified JavaScript
- Optimized CSS
- Source maps for debugging
- Gzip compression

### Backend Production

```bash
# Backend doesn't need compilation
# Just run in production environment
NODE_ENV=production npm start
```

---

## Comparison: Docker vs Local Setup

| Aspect | Docker | Local |
|--------|--------|-------|
| Setup Time | 1 minute | 10-15 minutes |
| Dependencies | Auto-installed | Manual install |
| FFmpeg | Automatic | Manual |
| Database | Isolated container | Local file |
| Port conflicts | Contained | Can clash |
| Environment match | Exact production | May differ |
| Team consistency | Everyone same | Varies by machine |
| **Recommendation** | ✅ **Use This** | Used only for dev |

---

## Switching Between Docker and Local

```bash
# To switch FROM local TO Docker:
npm run stop  # Stop local servers
npm start     # Start Docker

# To switch FROM Docker TO local:
npm run stop  # Stop Docker
cd backend && npm start  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

---

## Performance Tips for Local Development

```bash
# 1. Use faster database queries
# 2. Disable auto-reload if too slow
# 3. Stop unused containers
# 4. Clear browser cache (F12 → Application)
# 5. Use production build for testing performance
npm run build
npm run preview
```

---

**Need Help?** See the main [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
