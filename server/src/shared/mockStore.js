export const mockStore = {
  profile: {
    id: "user_001",
    role: "student",
    name: "Ayesha",
    preferences: { market: "global", pathway: "fast-entry" }
  },
  diagnose: {
    interests: 84,
    aptitude: 76,
    readiness: 79,
    confidence: 81
  },
  match: [
    { id: "product-manager", fit: 89, readiness: 78, opportunity: 86, confidence: 84 },
    { id: "ux-researcher", fit: 82, readiness: 70, opportunity: 79, confidence: 76 }
  ],
  validate: {
    market: { salary: "$95k-$165k", demand: "High", growth: "+18%", automationRisk: "Low-Medium" }
  },
  roadmap: {
    day30: ["Complete PM fundamentals course"],
    day60: ["Run one user interview cycle"],
    day90: ["Lead scoped feature discovery sprint"]
  },
  track: {
    readinessNow: 78,
    completedTasks: 21,
    totalTasks: 34
  },
  reports: {
    summary: "Top fit: Product Manager",
    generatedAt: "2026-04-29T00:00:00.000Z"
  }
};
