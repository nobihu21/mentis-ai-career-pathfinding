# MENTIS Local Run Instructions

## Your current error
`vite is not recognized` means frontend dependencies are not installed in this exact folder. Run `npm install` inside the project root once, or double-click `run-frontend.bat`.

## Run backend
Open PowerShell:

```powershell
cd C:\Users\ghjg\Pictures\full_project\backend
python main.py
```

Test:

```text
http://localhost:8000/health
http://localhost:8000/v1/health
http://localhost:8000/docs
```

`openrouter_key_loaded` must be `true`.

## Run frontend
Open a second PowerShell:

```powershell
cd C:\Users\ghjg\Pictures\full_project
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Important
Do not run `cd full_project/backend` if you are already inside the `full_project` folder. Use `cd backend`.

If port 5173 is busy:

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

If port 8000 is busy:

```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```
.env
backend/.env
.env.localnode_modules
.env
.env.local
backend/.env
dist
build