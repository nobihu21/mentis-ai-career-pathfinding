import { useEffect, useMemo, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import ProductShell from "../../components/layout/ProductShell";
import InterestHeatmap from "../../components/student/InterestHeatmap";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { logStudentActivity } from "../../services/api";
import { DEFAULT_DOMAINS, sortDomainsByScore } from "../../services/interestProfiler";

const ACTIONS = [
  { type: "resource_viewed", label: "Resource viewed", points: 10 },
  { type: "task_completed", label: "Task completed", points: 25 },
  { type: "quiz_taken", label: "Quiz taken", points: 30 },
  { type: "milestone_completed", label: "Milestone completed", points: 40 },
];

export default function InterestTracker() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("programming");
  const [selectedAction, setSelectedAction] = useState("resource_viewed");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      setUserDoc(snap.exists() ? snap.data() : null);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const q = query(collection(db, "users", user.uid, "activityLog"), orderBy("timestamp", "desc"), limit(8));
    return onSnapshot(q, (snap) => {
      setActivities(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, [user]);

  const domains = useMemo(() => {
    const live = userDoc?.interestProfile?.domains || {};
    const merged = DEFAULT_DOMAINS.reduce((acc, name) => {
      acc[name] = live[name] || { score: 0 };
      return acc;
    }, {});
    return sortDomainsByScore(merged).slice(0, 8).map((domain) => ({ ...domain, trend: "stable" }));
  }, [userDoc]);

  async function recordActivity() {
    setSaving(true);
    setError("");
    try {
      await logStudentActivity(selectedAction, selectedDomain, null, { source: "interest_tracker" });
    } catch (err) {
      setError(err?.message || "Activity save nahi ho saki.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProductShell title="Interest Tracker" subtitle="Continuous signals replace the old one-time assessment.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <h2 className="text-lg font-semibold text-mentisText">Log a learning signal</h2>
          <p className="mt-1 text-sm text-mentisTextSecondary">
            Every action updates your interest profile and refreshes recommendations.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm text-mentisTextSecondary">Domain</span>
              <select
                value={selectedDomain}
                onChange={(event) => setSelectedDomain(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText outline-none focus:border-mentisPrimary"
              >
                {DEFAULT_DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-mentisTextSecondary">Action</span>
              <select
                value={selectedAction}
                onChange={(event) => setSelectedAction(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText outline-none focus:border-mentisPrimary"
              >
                {ACTIONS.map((action) => (
                  <option key={action.type} value={action.type}>{action.label} (+{action.points})</option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          <button
            onClick={recordActivity}
            disabled={saving}
            className="mt-6 rounded-xl bg-mentisPrimary px-5 py-3 text-sm font-semibold text-white transition hover:bg-mentisSecondary disabled:opacity-50"
          >
            {saving ? "Recording..." : "Record Signal"}
          </button>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-mentisText">Recent activity</h3>
            <div className="mt-3 space-y-2">
              {activities.length === 0 ? (
                <p className="text-sm text-mentisTextSecondary">No activity yet.</p>
              ) : activities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-slate-700 bg-mentisBg/60 px-3 py-2 text-sm text-mentisTextSecondary">
                  {activity.actionType} in <span className="text-mentisText">{activity.domain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <InterestHeatmap domains={domains} />
      </div>
    </ProductShell>
  );
}
