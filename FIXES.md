# MENTIS — Bug Fixes Applied

## Issues Fixed

### 1. AI Chat — 402 Credit Error (`backend/main.py`)

**Root cause:** Used old `openai.ChatCompletion.create()` (v0 SDK API) with an expensive free-tier model (`google/gemini-2.0-flash-exp:free`) that had exceeded credits. No `max_tokens` cap.

**Fix:**
- Upgraded to `openai>=1.0.0` SDK — uses `client.chat.completions.create()`
- Changed model to `openai/gpt-4o-mini` (cost-effective, widely available)
- Added `max_tokens=400` to prevent runaway token usage
- Proper `OpenAI(base_url=..., default_headers=...)` client setup
- Updated `requirements.txt`: removed `cors` (not a Python package), pinned `openai>=1.0.0`

### 2. Express Not Responding (`server/src/index.js`, `server/package.json`)

**Root cause:** CORS was missing — browsers block cross-origin requests from `localhost:5173` to `localhost:3001`.

**Fix:**
- Added `cors` npm package to `server/package.json`
- Configured `app.use(cors({...}))` in `server/src/index.js` with explicit allowed origins
- Port `3001` was already correct — no route changes made

### 3. Authentication Broken

**Root cause:** `AuthContext.jsx`, `LoginPage.jsx`, `SignupPage.jsx`, and `src/config/firebase.js` were never committed to git. `App.jsx` had no login/signup routes and no `AuthProvider` wrapper.

**Fix:**
- Created `src/contexts/AuthContext.jsx` — Firebase `onAuthStateChanged`, `login()`, `signup()`, `logout()` 
- Created `src/config/firebase.js` — reads config from `VITE_FIREBASE_*` env vars
- Created `src/pages/LoginPage.jsx` — real Firebase email/password auth
- Created `src/pages/SignupPage.jsx` — real Firebase registration with display name
- Created `src/components/layout/ProtectedRoute.jsx` — redirects unauthenticated users to `/login`
- Updated `src/App.jsx` — wraps everything in `<AuthProvider>`, adds `/login` and `/signup` routes, wraps protected pages in `<ProtectedRoute>`

### 4. Data Flow (`src/services/api.js`, `src/components/chat/AiAssistant.jsx`)

**Root cause:** `api.js` did not exist. `AiAssistant.jsx` had no service layer and used the wrong port/endpoint.

**Fix:**
- Created `src/services/api.js` with explicit routing:
  - `api.*` → Express port `3001` (match, diagnose, profile, etc.)
  - `aiApi.chat()` → FastAPI port `8000` (chat only)
- Updated `AiAssistant.jsx` to use `aiApi.chat()`, show logged-in user info, handle errors gracefully
- Added Vite dev proxy in `vite.config.js` so `/v1/chat` proxies to `:8000` and all other `/v1/*` proxy to `:3001`

---

## Setup Instructions

### 1. Firebase Configuration

Create `.env.local` in the project root (template provided):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Enable **Email/Password** auth in your Firebase Console → Authentication → Sign-in method.

### 2. Backend `.env`

The file `backend/.env` should contain:
```
OPENROUTER_API_KEY=sk-or-v1-...
```

### 3. Start Services

**Terminal 1 — FastAPI (port 8000):**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Express (port 3001):**
```bash
cd server
npm install
npm run dev
```

**Terminal 3 — Frontend (port 5173):**
```bash
# project root
npm install
npm run dev
```

---

## Files Changed

| File | Change |
|------|--------|
| `backend/main.py` | Fixed OpenAI SDK v1 client, model → `gpt-4o-mini`, added `max_tokens=400` |
| `backend/requirements.txt` | Fixed: `openai>=1.0.0`, removed invalid `cors` package |
| `server/src/index.js` | Added `cors` middleware |
| `server/package.json` | Added `cors` dependency |
| `src/App.jsx` | Added `AuthProvider`, `/login`, `/signup` routes, `ProtectedRoute` |
| `src/contexts/AuthContext.jsx` | **Created** — Firebase auth state management |
| `src/config/firebase.js` | **Created** — Firebase app initialisation from env vars |
| `src/pages/LoginPage.jsx` | **Created** — Real Firebase login UI |
| `src/pages/SignupPage.jsx` | **Created** — Real Firebase signup UI |
| `src/components/layout/ProtectedRoute.jsx` | **Created** — Auth guard component |
| `src/services/api.js` | **Created** — Correct port routing for Express vs FastAPI |
| `src/components/chat/AiAssistant.jsx` | Uses `aiApi.chat()`, shows auth user, error handling |
| `vite.config.js` | Added dev proxy for `/v1/chat` → 8000, `/v1/*` → 3001 |
| `package.json` | Added `firebase` dependency |
| `.env.local` | Template with Firebase env var keys |
