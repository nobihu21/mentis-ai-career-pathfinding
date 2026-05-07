@echo off
cd /d "%~dp0backend"
echo Starting MENTIS FastAPI backend on http://localhost:8000
if not exist .env (
  echo WARNING: backend\.env not found. Create it and add OPENROUTER_API_KEY=your_key
)
python -m pip install -r requirements.txt
python main.py
pause
