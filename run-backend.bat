@echo off
cd /d "%~dp0backend"
echo Cleaning stale Python/Uvicorn backend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
  echo Stopping process %%a on port 8000
  taskkill /PID %%a /F >nul 2>nul
)

echo Starting MENTIS FastAPI backend on http://localhost:8000
if not exist .env (
  echo WARNING: backend\.env not found. Create it and add OPENROUTER_API_KEY=your_key
)
if not exist serviceAccountKey.json (
  echo WARNING: backend\serviceAccountKey.json not found. Firebase protected APIs will return 503.
)
python -m pip install -r requirements.txt
python main.py
pause
