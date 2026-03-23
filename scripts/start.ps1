@echo off
REM SMS Video Editor - Docker Deployment Script for Windows

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  SMS AI-Powered Video Editor - Docker Deployment          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker is not installed. Please install Docker Desktop from https://www.docker.com
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo ✗ .env file not found
    echo Run: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
    exit /b 1
)

echo Starting Docker containers...
echo.

REM Build and start containers
docker-compose up -d

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Deployment Started!                                       ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Frontend: http://localhost:3000                           ║
echo ║  Backend:  http://localhost:5000/api/health               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo View logs: docker-compose logs -f
echo Stop containers: docker-compose down
echo.
