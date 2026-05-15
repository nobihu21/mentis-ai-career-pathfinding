import React from "react";
import { getChildInterestHeatmap } from "../../services/api";

export default function ParentInterestHeatmap({ childId }) {
  const [domains, setDomains] = React.useState({});

  React.useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    getChildInterestHeatmap(childId)
      .then((data) => {
        if (cancelled) return;
        setDomains(data?.domains || {});
      })
      .catch((e) => console.error("Heatmap fetch error:", e));

    return () => {
      cancelled = true;
    };
  }, [childId]);

  const entries = Object.entries(domains);

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Interest Strengths</h3>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">No heatmap data yet.</p>
        ) : (
          entries
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .map(([domain, score]) => (
              <div key={domain}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white capitalize">{domain}</span>
                  <span className="text-sm font-semibold text-mentisPrimary">{score}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

