# 🚀 GitHub Pages Deployment Guide

This guide explains how to deploy the SMS Video Editor frontend to GitHub Pages.

## 📋 Requirements

- GitHub account and repository
- The project pushed to GitHub
- GitHub Pages enabled in repository settings

## 🔧 Deployment Options

### Option 1: Automatic Deployment (GitHub Actions) ✅ RECOMMENDED

GitHub Actions automatically builds and deploys your frontend whenever you push to GitHub.

#### Setup (One-Time):

1. **Create workflow directory**:
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create deployment workflow** (already created as `.github/workflows/deploy.yml`)

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Save

4. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

The workflow will:
- Trigger on every push to `main` branch
- Build the frontend
- Deploy to `gh-pages` branch
- GitHub Pages serves from that branch automatically

#### View Deployment:
- Go to Actions tab in GitHub
- Watch the workflow run
- Once complete, site is live at: `https://Shrimanshukla.github.io/SMS-AI-VIDEO-EDITOR`

---

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Build frontend
npm run build:frontend

# 2. Push to GitHub
git add .
git commit -m "Update frontend build"
git push origin main

# 3. Manually deploy using gh-pages package:
npm install --save-dev gh-pages

# 4. Deploy
npx gh-pages -d frontend/dist
```

---

## 📄 What Gets Deployed

Only the **frontend** static build:
- `frontend/dist/index.html` - Main entry point
- `frontend/dist/assets/*.js` - React code (minified)
- `frontend/dist/assets/*.css` - Styles (minified)

**What's NOT deployed:**
- Backend code (Express server)
- Node modules
- Environment files
- Docker configuration

---

## ⚠️ Important Notes

### Backend API
GitHub Pages can **only serve static files**. The backend API cannot run on GitHub Pages.

For a fully functional deployment with backend:
1. **Backend**: Deploy separately to AWS, Heroku, or cloud service
2. **Frontend**: Deploy to GitHub Pages
3. **Connect**: Update `VITE_API_URL` in Actions workflow to point to backend

Example workflow update:
```yaml
- name: Build frontend
  env:
    VITE_API_URL: https://your-backend-api.com
  run: npm run build:frontend
```

### Homepage Configuration
If deploying as a project site (e.g., `username.github.io/SMS-AI-VIDEO-EDITOR`):
- `frontend/vite.config.js` includes base path support
- Routes in React automatically adjust

---

## 🔍 Verify Deployment

After push, check:

1. **Actions Tab**:
   - GitHub repo → Actions
   - Verify workflow completed (✅ green checkmark)

2. **Live Site**:
   - Go to `https://Shrimanshukla.github.io/SMS-AI-VIDEO-EDITOR`
   - Verify page loads without 404 errors
   - Check console (F12) for any errors

3. **Troubleshooting**:
   - If page is 404: Verify `gh-pages` branch exists in repo
   - If blank page: Check build output was created in `frontend/dist`
   - If styling missing: Check asset paths in dist/index.html

---

## 📊 Deployment Flow

```
You push code to main
         ↓
GitHub Actions triggers
         ↓
Runs workflow:
  - npm install (all deps)
  - npm run build:frontend
         ↓
Creates dist/ folder
         ↓
Deploys to gh-pages branch
         ↓
GitHub Pages serves dist/
         ↓
Site live at GitHub Pages URL ✅
```

---

## 🎯 Next Steps

1. ✅ Code is ready to push
2. ✅ GitHub Actions workflow configured
3. ✅ Frontend builds successfully (`frontend/dist/` created)
4. ✅ .gitignore properly configured

**What to do next:**
```bash
# 1. Commit all changes
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main

# 2. Go to GitHub Settings → Pages
# 3. Select gh-pages branch and save
# 4. Wait for first deployment (Actions tab)
# 5. Visit your live site!
```

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| 404 error on site | Verify `gh-pages` branch in settings |
| Blank page | Check dist/ folder was created, rebuild |
| Assets not loading | Check console for 404 paths, verify base path in vite.config.js |
| Workflow fails | Check Actions errors, verify all dependencies install |
| Old version showing | Clear browser cache (Ctrl+Shift+Del) or use private mode |

---

## 🚀 Production Checklist

- ✅ All npm packages installed
- ✅ Frontend builds without errors
- ✅ No console errors or warnings
- ✅ .gitignore excludes node_modules, .env
- ✅ No sensitive data in code
- ✅ GitHub Actions workflow configured
- ✅ GitHub Pages settings configured
- ✅ Main branch is default

---

**Status**: ✅ Ready for GitHub Pages Deployment

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md) and [README.md](./README.md).
