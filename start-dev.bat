@echo off
cd /d "%~dp0"

echo ============================================
echo   BLR Rental - Starting Servers
echo ============================================
echo.

echo [1/2] Starting BACKEND (Port 4000)...
start "BLR Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Starting FRONTEND (Port 5173)...
start "BLR Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ============================================
echo   Servers are starting in new windows.
echo ============================================
echo.
echo   WORKING LINK (open in browser):
echo.
echo   http://localhost:5173
echo.
echo   Wait 10-15 seconds, then open the link above.
echo   Backend API: http://localhost:4000
echo ============================================
echo.
pause
