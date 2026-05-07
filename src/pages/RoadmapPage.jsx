import { useEffect, useState } from "react";
import ProductShell from "../components/layout/ProductShell";
import { useAuth } from "../contexts/AuthContext";
import { getRoadmapProgress, saveRoadmapProgress } from "../services/firestore";

const defaultRoadmap = {
  day30: [
    "PM fundamentals course complete karo",
    "3 customer interviews run karo",
    "Problem brief publish karo",
  ],
  day60: [
    "Roadmap case artifact banao",
    "Ek cross-functional planning session lead karo",
    "KPI design practice karo",
  ],
  day90: [
    "Ek scoped initiative ship karo",
    "Impact narrative present karo",
    "Transition portfolio finalize karo",
  ],
};

const allTasks = [
  ...defaultRoadmap.day30,
  ...defaultRoadmap.day60,
  ...defaultRoadmap.day90,
];

function PlanColumn({ title, tasks, checked, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {tasks.map((task) => (
          <li key={task} className="flex items-start gap-3 rounded-lg bg-mentisBg/70 p-3">
            <input
              type="checkbox"
              checked={!!checked[task]}
              onChange={() => onToggle(task)}
              className="mt-1 h-4 w-4 accent-mentisPrimary"
            />
            <span className={`text-sm ${checked[task] ? "text-mentisTextSecondary line-through" : "text-white"}`}>
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
  const [checked, setChecked]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // Load from Firestore
  useEffect(() => {
    if (!user) return;
    getRoadmapProgress(user.uid).then((data) => {
      if (data?.checked) {
        setChecked(data.checked);
      } else {
        // Default: sab unchecked
        const init = allTasks.reduce((acc, t) => ({ ...acc, [t]: false }), {});
        setChecked(init);
      }
      setLoading(false);
    });
  }, [user]);

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
  const total     = allTasks.length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <ProductShell
      title="30 / 60 / 90 Day Execution Roadmap"
      subtitle="Act layer: operational plan with tasks synced to your profile."
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
              <span className="font-semibold text-white">
                {completed}/{total} tasks ({percent}%)
                {saving && <span className="ml-2 text-xs text-mentisTextSecondary">saving…</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <PlanColumn title="Day 1–30"  tasks={defaultRoadmap.day30} checked={checked} onToggle={handleToggle} />
            <PlanColumn title="Day 31–60" tasks={defaultRoadmap.day60} checked={checked} onToggle={handleToggle} />
            <PlanColumn title="Day 61–90" tasks={defaultRoadmap.day90} checked={checked} onToggle={handleToggle} />
          </div>
        </>
      )}
    </ProductShell>
  );
}
