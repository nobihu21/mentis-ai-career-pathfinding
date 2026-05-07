/**
 * MENTIS — Firestore Database Service
 * Sab data yahan se aata hai — koi mock nahi
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────
export async function getUserProfile(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveUserProfile(userId, data) {
  const ref = doc(db, "users", userId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ─────────────────────────────────────────────
// ASSESSMENT
// ─────────────────────────────────────────────
export async function saveAssessment(userId, answers) {
  // Compute scores from answers
  const scores = computeScores(answers);
  const ref = doc(db, "assessments", userId);
  await setDoc(ref, {
    userId,
    answers,
    scores,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Also update user's readiness on profile
  await saveUserProfile(userId, {
    readiness: scores.readiness,
    topCareer: scores.topCareer,
    hasAssessment: true,
  });
  return scores;
}

export async function getAssessment(userId) {
  const ref = doc(db, "assessments", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

function computeScores(answers) {
  // Simple scoring from 1-5 answers
  const interests = Math.round(((answers.interests || 3) / 5) * 100);
  const aptitude  = Math.round(((answers.aptitude  || 3) / 5) * 100);
  const values    = Math.round(((answers.values    || 3) / 5) * 100);
  const readiness = Math.round((interests * 0.4 + aptitude * 0.4 + values * 0.2));

  // Basic top career logic based on answers
  const careerMap = {
    1: "Product Manager",
    2: "UX Researcher",
    3: "Growth Analyst",
    4: "Data Scientist",
    5: "Software Engineer",
  };
  const topCareer = careerMap[answers.careerInterest] || "Product Manager";

  return { interests, aptitude, values, readiness, topCareer, progress: 0 };
}

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
export async function getDashboardStats(userId) {
  const [profile, assessment, roadmapDoc] = await Promise.all([
    getUserProfile(userId),
    getAssessment(userId),
    getRoadmapProgress(userId),
  ]);

  return {
    readiness:      assessment?.scores?.readiness  ?? 0,
    progress:       roadmapDoc?.progressPercent    ?? 0,
    topCareerMatch: assessment?.scores?.topCareer  ?? "Complete Assessment",
    completedTasks: roadmapDoc?.completedCount     ?? 0,
    totalTasks:     roadmapDoc?.totalCount         ?? 9,
    interests:      assessment?.scores?.interests  ?? 0,
    aptitude:       assessment?.scores?.aptitude   ?? 0,
    hasAssessment:  !!assessment,
    displayName:    profile?.displayName           ?? "",
  };
}

// ─────────────────────────────────────────────
// ROADMAP PROGRESS
// ─────────────────────────────────────────────
export async function getRoadmapProgress(userId) {
  const ref = doc(db, "roadmapProgress", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveRoadmapProgress(userId, checked, totalCount) {
  const completedCount  = Object.values(checked).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const ref = doc(db, "roadmapProgress", userId);
  await setDoc(ref, {
    userId,
    checked,
    completedCount,
    totalCount,
    progressPercent,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  // Sync progress back to user profile
  await saveUserProfile(userId, { progress: progressPercent });
  return { completedCount, totalCount, progressPercent };
}

// ─────────────────────────────────────────────
// DECISION JOURNAL
// ─────────────────────────────────────────────
export async function addJournalEntry(userId, event, note) {
  const ref = collection(db, "users", userId, "journal");
  await addDoc(ref, {
    event,
    note,
    date: new Date().toISOString().split("T")[0],
    createdAt: serverTimestamp(),
  });
}

export async function getJournalEntries(userId) {
  const ref = collection(db, "users", userId, "journal");
  // Simple query without composite index needed
  const snap = await getDocs(ref);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

// ─────────────────────────────────────────────
// CAREER MATCHES (saved from assessment)
// ─────────────────────────────────────────────
export async function getCareerMatches(userId) {
  const assessment = await getAssessment(userId);
  if (!assessment) return null;

  // Generate matches from assessment scores
  return generateMatches(assessment.answers, assessment.scores);
}

function generateMatches(answers, scores) {
  const careerInterest = answers?.careerInterest || 1;

  const allCareers = [
    {
      id: "product-manager",
      title: "Product Manager",
      fitScore: Math.min(99, scores.readiness + 10),
      readinessScore: scores.readiness,
      opportunityScore: 86,
      confidenceScore: Math.round((scores.readiness + 86) / 2),
      uncertaintyLevel: scores.readiness > 70 ? "Low" : "Medium",
      summary: "Lead product strategy and deliver measurable user outcomes.",
      timeToReadiness: "6-9 months",
      market: { salary: "$95k - $165k", demand: "High", growth: "+18%/5y", marketScore: 88 },
      rationale: ["Strong market demand", "High communication fit", "Growth trajectory"],
      alternatives: ["Growth Product Analyst", "Program Manager"],
      nextActions: ["Complete PM fundamentals", "Shadow one planning meeting"],
      riskFlags: ["Analytics depth needed"],
      strengthsAlignment: "Communication, prioritization, execution",
      weaknessGaps: "Product analytics depth",
      recommendedRoute: "Portfolio-led transition",
      explainability: { confidenceFactors: ["Behavioral fit", "Market demand"], uncertaintyReason: "Analytics gap remains" },
    },
    {
      id: "ux-researcher",
      title: "UX Researcher",
      fitScore: Math.min(99, scores.interests + 5),
      readinessScore: Math.round(scores.readiness * 0.9),
      opportunityScore: 79,
      confidenceScore: Math.round((scores.interests + 79) / 2),
      uncertaintyLevel: "Medium",
      summary: "High fit role with moderate market velocity.",
      timeToReadiness: "5-8 months",
      market: { salary: "$85k - $140k", demand: "Medium-High", growth: "+11%/5y", marketScore: 74 },
      rationale: ["Strong empathy profile", "Research mindset fit"],
      alternatives: ["Product Analyst", "UX Strategist"],
      nextActions: ["Run one usability study", "Build research portfolio"],
      riskFlags: ["Portfolio depth required"],
      strengthsAlignment: "User empathy, insight synthesis",
      weaknessGaps: "Research ops and mixed-method analytics",
      recommendedRoute: "Research portfolio pathway",
      explainability: { confidenceFactors: ["Behavioral fit"], uncertaintyReason: "Market velocity moderate" },
    },
    {
      id: "growth-analyst",
      title: "Growth Analyst",
      fitScore: Math.min(99, scores.aptitude + 5),
      readinessScore: Math.round(scores.readiness * 0.85),
      opportunityScore: 81,
      confidenceScore: Math.round((scores.aptitude + 81) / 2),
      uncertaintyLevel: "Medium-High",
      summary: "Data-driven option with high opportunity but skill risk.",
      timeToReadiness: "7-10 months",
      market: { salary: "$80k - $135k", demand: "High", growth: "+16%/5y", marketScore: 80 },
      rationale: ["High opportunity score", "Cross-industry demand"],
      alternatives: ["Business Analyst", "Product Ops Analyst"],
      nextActions: ["Complete SQL project", "Practice experiment design"],
      riskFlags: ["SQL depth needed", "Experimentation basics required"],
      strengthsAlignment: "Data-informed thinking, iteration mindset",
      weaknessGaps: "SQL fluency and growth experimentation",
      recommendedRoute: "Analytics-first pathway",
      explainability: { confidenceFactors: ["Opportunity signal"], uncertaintyReason: "Technical gap severity" },
    },
  ];

  // Sort by fitScore descending
  return allCareers.sort((a, b) => b.fitScore - a.fitScore);
}

// ─────────────────────────────────────────────
// AI CHAT HISTORY
// ─────────────────────────────────────────────
export async function saveChatMessage(userId, role, content) {
  if (!userId || !content) return null;
  const ref = collection(db, "users", userId, "chatHistory");
  return addDoc(ref, {
    role,
    content,
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });
}

export async function getChatHistory(userId, limitCount = 15) {
  if (!userId) return [];
  const ref = collection(db, "users", userId, "chatHistory");
  const snap = await getDocs(ref);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0))
    .slice(-limitCount);
}
