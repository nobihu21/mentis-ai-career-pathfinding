import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import ProductShell from "../../components/layout/ProductShell";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import InterestHeatmap from "../../components/student/InterestHeatmap";
import StudentAiChat from "../../components/student/StudentAiChat";
import { getTrendingCareersForTier, scoreCareersForStudent } from "../../services/careerRecommender";
import { calculateInterestScore, DEFAULT_DOMAINS } from "../../services/interestProfiler";

const ACTIONS = [
  { type: "resource_viewed", label: "Viewed", points: 10 },
  { type: "task_completed", label: "Task", points: 25 },
  { type: "quiz_taken", label: "Quiz", points: 30 },
  { type: "milestone_completed", label: "Milestone", points: 40 },
];

const ROADMAP_TOTAL = 9;

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
      <p className="text-sm text-mentisTextSecondary">{label}</p>
      <p className="mt-2 text-3xl font-bold text-mentisText">{value}</p>
      {hint && <p className="mt-1 text-xs text-mentisTextSecondary">{hint}</p>}
    </div>
  );
}

function PredictionRow({ career, index }) {
  const demand = career.marketData?.demand || "Medium";
  const score = career.suitabilityScore || 0;
  const color = score >= 75 ? "text-green-300" : score >= 55 ? "text-amber-300" : "text-slate-300";

  return (
    <div className="grid gap-4 rounded-xl border border-slate-700 bg-mentisBg/60 p-4 md:grid-cols-[40px_1.2fr_90px_1fr] md:items-center">
      <p className="text-sm font-semibold text-mentisTextSecondary">#{index + 1}</p>
      <div>
        <p className="font-semibold text-mentisText">{career.careerName}</p>
        <p className="mt-1 text-xs text-mentisTextSecondary">{career.timeToReadiness} readiness path</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{score}%</p>
      <div className="text-sm text-mentisTextSecondary">
        <p>{demand} demand - {career.marketData?.avgSalary}</p>
        <p className="mt-1">Gap: {(career.skillGaps || []).slice(0, 2).join(", ")}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("programming");
  const [selectedAction, setSelectedAction] = useState("resource_viewed");
  const [status, setStatus] = useState("");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      setUserDoc(snap.exists() ? snap.data() : null);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, "roadmapProgress", user.uid), (snap) => {
      setRoadmap(snap.exists() ? snap.data() : null);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const q = query(collection(db, "users", user.uid, "activityLog"), orderBy("timestamp", "desc"), limit(6));
    return onSnapshot(q, (snap) => {
      setRecentActivity(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, [user]);

  const tier = profile?.tier || profile?.profile?.tier || userDoc?.profile?.tier || "intermediate";
  const learningStyle = profile?.learningStyle || profile?.profile?.learningStyle || userDoc?.profile?.learningStyle || "visual";

  const domains = useMemo(() => {
    const live = userDoc?.interestProfile?.domains || {};
    const merged = DEFAULT_DOMAINS.reduce((acc, name) => {
      acc[name] = live[name] || { score: 0 };
      return acc;
    }, {});
    return Object.entries(merged)
      .map(([name, obj]) => ({
        name,
        score: Math.round(Number(obj?.score || 0)),
        trend: "stable",
      }))
      .sort((a, b) => b.score - a.score);
  }, [userDoc]);

  const predictions = useMemo(() => {
    const liveMatches = Object.entries(userDoc?.careerMatches || {})
      .map(([id, c]) => ({
        id,
        careerName: c.careerName || c.title || id,
        suitabilityScore: c.suitabilityScore ?? c.score ?? 0,
        reasoning: c.reasoning || ["Matched against live activity"],
        timeToReadiness: c.timeToReadiness || "6-9 months",
        skillGaps: c.skillGaps || [],
        marketData: c.marketData || { demand: "Medium", avgSalary: "PKR market data pending" },
      }))
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    if (liveMatches.length > 0) return liveMatches;
    return scoreCareersForStudent(userDoc?.interestProfile || {}, tier);
  }, [userDoc, tier]);

  const topDomains = domains.filter((domain) => domain.score > 0).slice(0, 3);
  const readiness = predictions.length
    ? Math.round((predictions[0].suitabilityScore * 0.55) + ((roadmap?.progressPercent || 0) * 0.25) + (Math.min(100, recentActivity.length * 12) * 0.2))
    : 0;
  const roadmapPercent = roadmap?.progressPercent || Math.round(((roadmap?.completedCount || 0) / ROADMAP_TOTAL) * 100) || 0;

  async function logActivity() {
    if (!user) return;
    setLogging(true);
    setStatus("");

    try {
      const currentDomains = userDoc?.interestProfile?.domains || {};
      const nextDomains = Object.entries(currentDomains).reduce((acc, [name, value]) => {
        const score = Number(value?.score || value || 0);
        acc[name] = {
          ...(typeof value === "object" ? value : {}),
          score: Math.round(score * 0.9),
          sources: value?.sources || [],
        };
        return acc;
      }, {});

      const existing = nextDomains[selectedDomain]?.score || 0;
      nextDomains[selectedDomain] = {
        ...(nextDomains[selectedDomain] || {}),
        score: calculateInterestScore(existing, selectedAction),
        sources: [...(nextDomains[selectedDomain]?.sources || []), selectedAction],
        lastUpdated: Date.now(),
      };

      const topDomainsNext = Object.entries(nextDomains)
        .sort((a, b) => Number(b[1]?.score || 0) - Number(a[1]?.score || 0))
        .slice(0, 3)
        .map(([name]) => name);

      const nextInterestProfile = {
        domains: nextDomains,
        topDomains: topDomainsNext,
      };

      const careerMatches = scoreCareersForStudent(nextInterestProfile, tier).reduce((acc, career) => {
        acc[career.id] = {
          careerName: career.careerName,
          suitabilityScore: career.suitabilityScore,
          reasoning: career.reasoning,
          timeToReadiness: career.timeToReadiness,
          skillGaps: career.skillGaps,
          marketData: career.marketData,
          matchedAt: new Date().toISOString(),
        };
        return acc;
      }, {});

      await addDoc(collection(db, "users", user.uid, "activityLog"), {
        actionType: selectedAction,
        domain: selectedDomain,
        careerRelated: Object.keys(careerMatches)[0] || null,
        details: { source: "student_dashboard_v2", points: ACTIONS.find((a) => a.type === selectedAction)?.points || 10 },
        timestamp: serverTimestamp(),
      });

      await setDoc(doc(db, "users", user.uid), {
        readiness,
        interestProfile: {
          ...nextInterestProfile,
          lastUpdated: serverTimestamp(),
        },
        careerMatches,
      }, { merge: true });

      setStatus("Signal recorded. Predictions refreshed.");
    } catch (error) {
      setStatus(error?.message || "Could not record signal.");
    } finally {
      setLogging(false);
    }
  }

  return (
    <ProductShell
      title="Student Dashboard"
      subtitle={`Real-time AI career intelligence - ${tier} - ${learningStyle} learner`}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="AI Readiness" value={`${readiness}%`} hint="Fit + roadmap + activity" />
          <StatCard label="Top Career" value={predictions[0]?.careerName || "Exploring"} hint={`${predictions[0]?.suitabilityScore || 0}% predicted fit`} />
          <StatCard label="Roadmap Progress" value={`${roadmapPercent}%`} hint={`${roadmap?.completedCount || 0}/${roadmap?.totalCount || ROADMAP_TOTAL} tasks done`} />
          <StatCard label="Live Signals" value={recentActivity.length} hint="Recent tracked actions" />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-mentisText">Real-time Interest Tracker</h2>
              <p className="mt-1 text-sm text-mentisTextSecondary">Every signal updates your profile, predictions, and readiness score.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText">
                {DEFAULT_DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
              </select>
              <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText">
                {ACTIONS.map((action) => <option key={action.type} value={action.type}>{action.label} +{action.points}</option>)}
              </select>
              <button onClick={logActivity} disabled={logging} className="rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white hover:bg-mentisSecondary disabled:opacity-50">
                {logging ? "Recording..." : "Record Signal"}
              </button>
            </div>
          </div>
          {status && <p className="mt-4 text-sm text-mentisTextSecondary">{status}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <InterestHeatmap domains={domains.filter((domain) => domain.score > 0)} />

          <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-mentisText">AI Prediction Engine</h3>
                <p className="mt-1 text-sm text-mentisTextSecondary">All tier-relevant careers ranked from live signals.</p>
              </div>
              <Link to="/student/careers" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">Open Explorer</Link>
            </div>
            <div className="mt-5 space-y-3">
              {predictions.map((career, index) => <PredictionRow key={career.id} career={career} index={index} />)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
              <h3 className="text-lg font-semibold text-mentisText">Profile Intelligence</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="text-mentisTextSecondary">Tier: <span className="font-semibold text-mentisText">{tier}</span></p>
                <p className="text-mentisTextSecondary">Learning style: <span className="font-semibold text-mentisText">{learningStyle}</span></p>
                <p className="text-mentisTextSecondary">Top interests: <span className="font-semibold text-mentisText">{topDomains.map((d) => d.name).join(", ") || "Collecting signals"}</span></p>
                <Link to="/student/profile" className="inline-block rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white">Update Profile</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
              <h3 className="text-lg font-semibold text-mentisText">Roadmap Progress</h3>
              <div className="mt-5 h-2 rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary" style={{ width: `${roadmapPercent}%` }} />
              </div>
              <p className="mt-3 text-sm text-mentisTextSecondary">{roadmap?.completedCount || 0} tasks completed from your 30/60/90 execution plan.</p>
              <Link to="/roadmap" className="mt-4 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">Open Roadmap</Link>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-mentisText">Recent Signals</h3>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-mentisTextSecondary md:col-span-3">No activity yet. Record a signal above to start the live profile.</p>
                ) : recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-700 bg-mentisBg/60 p-3 text-sm">
                    <p className="font-semibold text-mentisText">{activity.domain}</p>
                    <p className="mt-1 text-xs text-mentisTextSecondary">{activity.actionType}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <StudentAiChat tier={tier} careerGoal={predictions[0]?.careerName} />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <h3 className="text-lg font-semibold text-mentisText">Trending Careers For Your Tier</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {getTrendingCareersForTier(tier).map((career) => (
              <div key={career.id} className="rounded-lg border border-slate-700 bg-mentisBg/60 p-4">
                <p className="font-semibold text-mentisText">{career.careerName}</p>
                <p className="mt-1 text-sm text-mentisTextSecondary">{career.marketData.demand} demand</p>
                <p className="mt-1 text-xs text-mentisTextSecondary">{career.timeToReadiness}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
