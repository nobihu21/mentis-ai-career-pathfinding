import React from "react";

export default function ChildOverviewCard({ childData }) {
  if (!childData) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{childData.name || "Child"}</h3>
          <p className="mt-1 text-sm text-slate-400">Tier: {childData.tier || "N/A"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Readiness</p>
          <p className="text-2xl font-bold text-mentisPrimary">{childData.readiness ?? childData.healthScore ?? 0}%</p>
          {childData.topCareer && (
            <p className="text-xs text-slate-400 mt-1">Top career: {childData.topCareer}</p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-900/30 border border-slate-700 p-4">
        <p className="text-sm text-slate-200">
          Last activity: {childData.lastActivity ? String(childData.lastActivity) : "—"}
        </p>
      </div>
    </div>
  );
}

