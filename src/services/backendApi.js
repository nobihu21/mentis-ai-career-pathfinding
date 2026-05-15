const FASTAPI_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_FASTAPI_URL || "";

async function request(path, { token, userId, ...options } = {}) {
  const res = await fetch(`${FASTAPI_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { "x-user-id": userId } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = await res.text();
    try {
      detail = JSON.parse(detail).detail || detail;
    } catch {
      // ignore
    }
    throw new Error(typeof detail === "string" ? detail : `API error ${res.status}`);
  }

  return res.json();
}

export const studentApi = {
  profile: async (token, userId) => request("/v1/student/profile", { method: "GET", token, userId }),
  activity: async (token, userId, payload) =>
    request("/v1/student/activity", { method: "POST", token, userId, body: JSON.stringify(payload) }),
  careerMatches: async (token, userId) => request("/v1/student/career-matches", { method: "GET", token, userId }),
};

