import { auth } from "../config/firebase";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_FASTAPI_URL || "";

// ===== STUDENT APIs =====

export async function getStudentProfile(userId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/student/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function logStudentActivity(actionType, domain, careerRelated = null, details = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/student/activity`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actionType,
      domain,
      careerRelated,
      details
    })
  });
  if (!res.ok) throw new Error("Failed to log activity");
  return res.json();
}

export async function getCareerMatches(userId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/student/career-matches`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch career matches");
  return res.json();
}

export async function chatWithAiMentor(message, careerGoal = null, tier = null) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/student/chat`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      careerGoal,
      tier,
      queryType: "student"
    })
  });
  if (!res.ok) throw new Error("Failed to chat");
  return res.json();
}

export async function updateStudentProfile(payload) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/student/profile`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function validateCustomCareer(careerId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/student/custom-career-validation`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ careerId })
  });
  if (!res.ok) throw new Error("Failed to validate career");
  return res.json();
}

// ===== PARENT APIs =====

export async function getParentChildren(parentId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/children`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch children");
  return res.json();
}

export async function getChildOverview(childId, parentId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/child/${childId}/overview`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch child overview");
  return res.json();
}

export async function getChildInterestHeatmap(childId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/child/${childId}/interest-heatmap`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch heatmap");
  return res.json();
}

export async function getChildCareerForecast(childId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/child/${childId}/career-forecast`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}

export async function chatWithParentAi(message, childId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/chat`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      careerGoal: childId,
      queryType: "parent"
    })
  });
  if (!res.ok) throw new Error("Failed to chat");
  return res.json();
}

export async function getParentNotifications() {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/notifications`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function generateParentReport(childId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/parent/reports/generate?childId=${encodeURIComponent(childId)}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to generate report");
  return res.json();
}

// ===== COUNSELOR APIs =====

export async function getCounselorBatches(counselorId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/counselor/batches`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch batches");
  return res.json();
}

export async function getBatchOverview(batchId, counselorId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/counselor/batch/${batchId}/overview`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch batch overview");
  return res.json();
}

export async function getBatchStudents(batchId, filters = {}) {
  const token = await getAuthToken();
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/v1/counselor/batch/${batchId}/students?${params}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function flagStudent(studentId, severity, reason, description, suggestedActions = []) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/counselor/student/${studentId}/flag`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      severity,
      reason,
      description,
      suggestedActions
    })
  });
  if (!res.ok) throw new Error("Failed to flag student");
  return res.json();
}

export async function sendBulkMessage(studentIds, subject, message) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/counselor/bulk-message`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      studentIds,
      subject,
      message
    })
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getBatchAnalytics(batchId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/counselor/batch/${batchId}/analytics`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch batch analytics");
  return res.json();
}

export async function chatWithCounselorAi(message, batchId) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/v1/counselor/chat`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      careerGoal: batchId,
      queryType: "counselor"
    })
  });
  if (!res.ok) throw new Error("Failed to chat");
  return res.json();
}

// ===== AI Compatibility Wrapper (used by legacy AiAssistant.jsx) =====

export const aiApi = {
  // AiAssistant expects: aiApi.chat(text, context)
  chat: async (message, context = "") => {
    const token = await getAuthToken();

    // Backend only exposes /v1/student/chat and /v1/parent/chat.
    // Use student chat as default fallback.
    const res = await fetch(`${API_BASE}/v1/student/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `${context ? context + "\n\n" : ""}${message}`,
        careerGoal: null,
        tier: null,
        queryType: "student",
      }),
    });

    if (!res.ok) throw new Error("AI chat failed");
    return res.json();
  },
};

// ===== HELPER =====

async function getAuthToken() {
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }
  return localStorage.getItem("mentis_auth_token") || "";
}
