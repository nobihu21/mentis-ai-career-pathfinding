import MetricBar from "../ui/MetricBar";

export default function ReadinessBreakdownCard({ breakdown }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold">Readiness Score Decomposition</h3>
      <div className="mt-4 space-y-4">
        <MetricBar label="Fit score" value={breakdown.fitScore} />
        <MetricBar label="Skill readiness" value={breakdown.skillReadiness} />
        <MetricBar label="Market demand" value={breakdown.marketDemand} />
        <MetricBar label="Confidence level" value={breakdown.confidenceLevel} />
        <MetricBar label="Progress tracking" value={breakdown.progressTracking} />
      </div>
      <div className="mt-5 rounded-lg border border-slate-700 bg-mentisBg/70 p-3 text-sm text-mentisTextSecondary">
        {breakdown.methodology}
      </div>
      <p className="mt-3 text-2xl font-bold text-mentisSecondary">{breakdown.weightedResult}%</p>
    </section>
  );
}
