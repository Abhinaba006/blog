@echo off
REM Blog Application - Environment Setup Guide for Windows

echo.
echo ===== BLOG APPLICATION - ENVIRONMENT STARTUP =====
echo.
echo Choose your environment:
echo 1. Development (DEBUG logs enabled)
echo 2. Staging (INFO logs only)
echo 3. Production (WARN logs only)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Starting in DEVELOPMENT mode...
    npx env-cmd -f ./config/dev.env npm run dev
) else if "%choice%"=="2" (
    echo.
    echo Starting in STAGING mode...
    npx env-cmd -f ./config/staging.env npm start
) else if "%choice%"=="3" (
    echo.
    echo Starting in PRODUCTION mode...
    npx env-cmd -f ./config/prod.env npm start
) else (
    echo Invalid choice!
    exit /b 1
)
