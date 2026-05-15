export default function InterestHeatmap({ domains = [] }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-mentisText">Interest Strengths</h3>
      <p className="mt-1 text-sm text-mentisTextSecondary">Based on recent activity</p>

      <div className="mt-6 space-y-4">
        {domains.length === 0 ? (
          <p className="text-sm text-mentisTextSecondary">
            No interest data yet. Log a few activities to start building your real-time profile.
          </p>
        ) : (
          domains.map((domain) => (
            <div key={domain.name}>
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-medium text-mentisText">{domain.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-mentisPrimary">{domain.score}%</span>
                  {domain.trend === "up" && <span className="text-green-400">📈</span>}
                  {domain.trend === "stable" && <span className="text-slate-400">→</span>}
                  {domain.trend === "down" && <span className="text-red-400">📉</span>}
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${domain.score}%`,
                    background: "linear-gradient(to right, #6366f1, #06b6d4)",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

