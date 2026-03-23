@echo off
REM SMS Video Editor - Setup Script for Windows
REM This script initializes the environment variables for Docker deployment

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  SMS AI-Powered Video Editor - Setup Script               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if .env exists
if exist .env (
    echo ✓ .env file already exists
    set /p RECONFIGURE="Do you want to reconfigure? (y/n): "
    if not "!RECONFIGURE!"=="y" (
        if not "!RECONFIGURE!"=="Y" (
            echo Keeping existing configuration
            exit /b 0
        )
    )
)

echo.
echo AWS S3 Configuration
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM AWS Configuration
set /p AWS_REGION="AWS Region (default: us-east-1): "
if "!AWS_REGION!"=="" set AWS_REGION=us-east-1

set /p AWS_ACCESS_KEY_ID="AWS Access Key ID: "
:aws_key_loop
if "!AWS_ACCESS_KEY_ID!"=="" (
    echo ✗ AWS Access Key ID is required
    set /p AWS_ACCESS_KEY_ID="AWS Access Key ID: "
    goto aws_key_loop
)

set /p AWS_SECRET_ACCESS_KEY="AWS Secret Access Key: "
:aws_secret_loop
if "!AWS_SECRET_ACCESS_KEY!"=="" (
    echo ✗ AWS Secret Access Key is required
    set /p AWS_SECRET_ACCESS_KEY="AWS Secret Access Key: "
    goto aws_secret_loop
)

set /p AWS_S3_BUCKET_NAME="AWS S3 Bucket Name: "
:bucket_loop
if "!AWS_S3_BUCKET_NAME!"=="" (
    echo ✗ S3 Bucket Name is required
    set /p AWS_S3_BUCKET_NAME="AWS S3 Bucket Name: "
    goto bucket_loop
)

echo.
echo JWT Configuration
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

set /p JWT_SECRET="JWT Secret (leave blank to use default): "
if "!JWT_SECRET!"=="" set JWT_SECRET=your-super-secret-jwt-key-change-this

REM Create .env file
echo # Environment Configuration > .env
echo NODE_ENV=production >> .env
echo PORT=5000 >> .env
echo. >> .env
echo # Database >> .env
echo DATABASE_URL=./data/sms-video-editor.db >> .env
echo. >> .env
echo # JWT >> .env
echo JWT_SECRET=%JWT_SECRET% >> .env
echo. >> .env
echo # AWS Configuration >> .env
echo AWS_REGION=%AWS_REGION% >> .env
echo AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% >> .env
echo AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% >> .env
echo AWS_S3_BUCKET_NAME=%AWS_S3_BUCKET_NAME% >> .env

echo.
echo ✓ Configuration saved to .env
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Setup Complete!                                           ║
echo ║  Run: docker-compose up                                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
