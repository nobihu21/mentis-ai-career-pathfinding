import React from "react";

export default function RealTimeInterestHeatmap({ domains }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <div className="space-y-4">
        {Object.entries(domains || {})
          .sort((a, b) => (b[1]?.score ?? 0) - (a[1]?.score ?? 0))
          .map(([domain, data]) => (
            <div key={domain}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white capitalize">{domain}</span>
                <span className="text-sm font-semibold text-mentisPrimary">
                  {Math.round(Number(data?.score ?? 0))}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary transition-all duration-300"
                  style={{ width: `${Number(data?.score ?? 0)}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

