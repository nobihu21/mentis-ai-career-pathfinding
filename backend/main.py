import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv(Path(__file__).with_name(".env"))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini").strip()

# Token cap requested: 300
MAX_TOKENS = int(os.getenv("OPENROUTER_MAX_TOKENS", "300"))

app = FastAPI(title="MENTIS AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    context: str = ""


@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "mentis-fastapi",
        "docs": "http://localhost:8000/docs",
        "openrouter_key_loaded": bool(OPENROUTER_API_KEY),
    }


@app.get("/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "mentis-fastapi",
        "openrouter_key_loaded": bool(OPENROUTER_API_KEY),
        "model": OPENROUTER_MODEL,
        "max_tokens": MAX_TOKENS,
    }


@app.get("/health")
def health_alias():
    return health_check()


@app.get("/favicon.ico")
def favicon():
    return {"status": "no favicon"}


@app.post("/v1/chat")
async def chat_with_ai(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY missing in backend/.env",
        )

    headers = {
        # Hardening: ensure no hidden whitespace and ensure Authorization is present.
        "Authorization": f"Bearer {OPENROUTER_API_KEY.strip()}",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MENTIS AI",
    }


    payload = {
        "model": OPENROUTER_MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are MENTIS, a professional AI Career Pathfinding Assistant. "
                    "Provide concise, practical, explainable career guidance. "
                    "Use the user's dashboard/assessment context when provided."
                ),
            },
            {
                "role": "user",
                "content": f"Context: {request.context}\n\nUser Question: {request.message}",
            },
        ],
    }

    try:
        # Debug header issue: if Authorization is missing/empty, OpenRouter returns 401.
        # Keeping this lightweight to avoid leaking full secrets.
        if not headers.get("Authorization", "").strip().startswith("Bearer "):
            raise HTTPException(status_code=500, detail=f"Invalid Authorization header: {headers.get('Authorization')!r}")

        # Extra hardening: openrouter is sensitive to missing/empty auth headers.
        # Log only prefix to avoid leaking the full key.
        auth_prefix = headers.get("Authorization", "")[7:15]  # after "Bearer "
        # attach prefix to error messages (not secrets)

        r = requests.post(

            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=90,
        )


        if not r.ok:
            # includes 401 details (missing header/key) for faster debugging
            raise HTTPException(
                status_code=500,
                detail=f"OpenRouter error: {r.status_code} {r.text}",
            )

        data = r.json()
        return {"response": data["choices"][0]["message"]["content"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)

