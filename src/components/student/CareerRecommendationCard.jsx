export default function CareerRecommendationCard({ career, rank }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-mentisTextSecondary">#{rank} Recommended</p>
          <h4 className="mt-1 text-xl font-semibold text-mentisText">{career.name}</h4>
        </div>
        <span className="inline-block rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
          {career.suitability}% fit
        </span>
      </div>

      <p className="mt-4 text-sm text-mentisTextSecondary">
        {career.reason || "Based on your current interest profile and readiness signals."}
      </p>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-lg bg-mentisPrimary px-3 py-2 text-sm font-semibold text-white hover:opacity-90 transition-smooth">
          View Breakdown
        </button>
        <button className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-mentisText hover:border-mentisSecondary transition-smooth">
          Discuss with AI
        </button>
      </div>
    </div>
  );
}

