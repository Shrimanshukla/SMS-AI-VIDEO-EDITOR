# ⚡ Quick Start (2 Minutes)

No experience needed. Just Windows, Mac, or Linux with Docker.

## Step 1: Download Docker (1 minute)

**Windows & Mac**: 
- Go to https://www.docker.com/products/docker-desktop
- Download and install
- Launch Docker Desktop

**Linux**: 
```bash
sudo apt-get update && sudo apt-get install -y docker docker-compose
```

## Step 2: Configure (30 seconds)

```bash
npm run setup
```

You'll be asked for:
1. AWS bucket name
2. AWS access key
3. AWS secret key
4. JWT secret (optional - auto-generated)

[Don't have AWS? Create free account here: https://aws.amazon.com/free/]

## Step 3: Start (30 seconds)

```bash
npm start
```

Opening http://localhost:3000 in your browser...

## ✅ You're Done!

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Stop**: Press Ctrl+C
- **View logs**: `npm run logs`

---

**Need help?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- See [LOCAL_SETUP.md](./LOCAL_SETUP.md) if you want to avoid Docker
- Check troubleshooting section in guides above
