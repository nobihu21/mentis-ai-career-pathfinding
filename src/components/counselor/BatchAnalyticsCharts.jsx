import React from "react";

export default function BatchAnalyticsCharts({ batchId }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Batch Analytics</h3>
      <p className="text-sm text-slate-400">
        Charts are not wired in this repo snapshot. Batch ID: {batchId || "—"}
      </p>
    </div>
  );
}

