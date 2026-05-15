import React from "react";

export default function BatchOverviewCards({ analytics }) {
  const a = analytics || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
        <p className="text-sm text-slate-400">Total Students</p>
        <p className="text-2xl font-bold text-white">{a.totalStudents ?? 0}</p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
        <p className="text-sm text-slate-400">Avg Readiness</p>
        <p className="text-2xl font-bold text-mentisPrimary">{a.avgReadiness ?? 0}%</p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
        <p className="text-sm text-slate-400">Engagement</p>
        <p className="text-2xl font-bold text-green-400">{a.engagementRate ?? 0}%</p>
      </div>
    </div>
  );
}

