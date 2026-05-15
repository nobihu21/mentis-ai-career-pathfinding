import React from "react";

export default function AlertCenter() {
  // Backend v2 flag schema isn't fully wired in this repo snapshot.
  // Keep UI stable and show placeholder.
  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Alerts & Notifications</h3>
      <p className="text-sm text-slate-400">
        No alerts wired yet. When counselor flags are connected, this section will show at-risk recommendations.
      </p>
    </div>
  );
}

