@echo off
cd /d "%~dp0"

echo ========================================================
echo   Bangalore Rental Platform - Production Single-Server
echo ========================================================
echo.

echo Building client and server bundles...
call npm run build

echo.
echo ========================================================
echo   Starting Production Server (Frontend + API on Port 4000)
echo ========================================================
echo.
echo   Access the website at:
echo   http://localhost:4000
echo.
echo ========================================================

node server/dist/index.js
pause
