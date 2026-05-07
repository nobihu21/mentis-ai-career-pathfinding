const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";

async function request(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (!res.ok) {
    let detail = await res.text();
    try { detail = JSON.parse(detail).detail || detail; } catch {}
    throw new Error(typeof detail === "string" ? detail : `API error ${res.status}`);
  }

  return res.json();
}

export const aiApi = {
  chat: (message, context = "") =>
    request(FASTAPI_BASE, "/v1/chat", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    }),
  health: () => request(FASTAPI_BASE, "/v1/health"),
};

export default { ai: aiApi };
