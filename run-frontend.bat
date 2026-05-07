@echo off
cd /d "%~dp0"
echo Starting MENTIS frontend on http://localhost:5173
if not exist node_modules (
  echo node_modules not found. Installing frontend dependencies...
  npm install
  if errorlevel 1 (
    echo npm install failed. Check internet connection and Node.js installation.
    pause
    exit /b 1
  )
)
npm run dev
pause
