import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import { getParentChildren } from "../../services/api";

export default function LearningProgress() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    getParentChildren().then((data) => setChildren(data?.children || [])).catch(() => setChildren([]));
  }, []);

  return (
    <ProductShell title="Learning Progress" subtitle="Milestones, activity recency, and progress velocity.">
      <div className="grid gap-5 md:grid-cols-2">
        {children.map((child) => (
          <article key={child.studentId} className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h2 className="text-lg font-semibold text-mentisText">{child.name || "Student"}</h2>
            <p className="mt-1 text-sm text-mentisTextSecondary">{child.tier || "tier not set"}</p>
            <div className="mt-5 h-2 rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary" style={{ width: `${child.readiness || 0}%` }} />
            </div>
            <p className="mt-3 text-sm text-mentisTextSecondary">Last activity: {child.lastActivity || "No activity yet"}</p>
          </article>
        ))}
      </div>
    </ProductShell>
  );
}
