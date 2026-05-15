import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import ProductShell from "../components/layout/ProductShell";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import { getRoadmapProgress, saveRoadmapProgress } from "../services/firestore";

const fallbackCareer = {
  careerName: "Career Path",
  skillGaps: ["Core foundations", "Portfolio proof", "Interview confidence"],
  marketData: { demand: "Medium" },
};

function buildRoadmap(career) {
  const name = career?.careerName || career?.title || fallbackCareer.careerName;
  const gaps = career?.skillGaps?.length ? career.skillGaps : fallbackCareer.skillGaps;
  return {
    day30: [
      `Learn ${gaps[0]} for ${name}`,
      `Complete one beginner resource related to ${name}`,
      `Log 3 real activities in the strongest interest domain`,
    ],
    day60: [
      `Build a small portfolio artifact for ${name}`,
      `Close skill gap: ${gaps[1] || gaps[0]}`,
      `Discuss progress with AI mentor and update profile goal`,
    ],
    day90: [
      `Ship one complete ${name} project or case study`,
      `Practice interview/storytelling for ${name}`,
      `Create next 90-day specialization plan`,
    ],
  };
}

function flatten(plan) {
  return [...plan.day30, ...plan.day60, ...plan.day90];
}

function PlanColumn({ title, tasks, checked, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
      <h3 className="text-lg font-semibold text-mentisText">{title}</h3>
      <ul className="mt-4 space-y-3">
        {tasks.map((task) => (
          <li key={task} className="flex items-start gap-3 rounded-lg bg-mentisBg/70 p-3">
            <input
              type="checkbox"
              checked={!!checked[task]}
              onChange={() => onToggle(task)}
              className="mt-1 h-4 w-4 accent-mentisPrimary"
            />
            <span className={`text-sm ${checked[task] ? "text-mentisTextSecondary line-through" : "text-mentisText"}`}>
              {task}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      setUserDoc(snap.exists() ? snap.data() : null);
    });
  }, [user]);

  const selectedCareer = useMemo(() => {
    const customId = userDoc?.customCareerChoice?.careerId;
    const matches = userDoc?.careerMatches || {};
    if (customId && matches[customId]) return matches[customId];
    const top = Object.entries(matches).sort((a, b) => (b[1]?.suitabilityScore || 0) - (a[1]?.suitabilityScore || 0))[0];
    return top?.[1] || userDoc?.customCareerChoice || fallbackCareer;
  }, [userDoc]);

  const roadmap = useMemo(() => buildRoadmap(selectedCareer), [selectedCareer]);
  const allTasks = useMemo(() => flatten(roadmap), [roadmap]);

  useEffect(() => {
    if (!user || allTasks.length === 0) return;
    getRoadmapProgress(user.uid).then((data) => {
      const saved = data?.checked || {};
      const init = allTasks.reduce((acc, task) => ({ ...acc, [task]: !!saved[task] }), {});
      setChecked(init);
      setLoading(false);
    });
  }, [user, allTasks]);

  async function handleToggle(task) {
    const newChecked = { ...checked, [task]: !checked[task] };
    setChecked(newChecked);
    setSaving(true);
    try {
      await saveRoadmapProgress(user.uid, newChecked, allTasks.length);
    } finally {
      setSaving(false);
    }
  }

  const completed = Object.values(checked).filter(Boolean).length;
  const total = allTasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <ProductShell
      title={`${selectedCareer?.careerName || selectedCareer?.title || "Career"} Roadmap`}
      subtitle="Dynamic 30 / 60 / 90 plan generated from selected career and skill gaps."
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-slate-700 bg-mentisCard p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-mentisTextSecondary">Execution progress</span>
              <span className="font-semibold text-mentisText">
                {completed}/{total} tasks ({percent}%)
                {saving && <span className="ml-2 text-xs text-mentisTextSecondary">saving...</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-3 text-sm text-mentisTextSecondary">
              Skill gaps: {(selectedCareer?.skillGaps || fallbackCareer.skillGaps).join(", ")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <PlanColumn title="Day 1-30" tasks={roadmap.day30} checked={checked} onToggle={handleToggle} />
            <PlanColumn title="Day 31-60" tasks={roadmap.day60} checked={checked} onToggle={handleToggle} />
            <PlanColumn title="Day 61-90" tasks={roadmap.day90} checked={checked} onToggle={handleToggle} />
          </div>
        </>
      )}
    </ProductShell>
  );
}
