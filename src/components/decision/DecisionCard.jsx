export default function DecisionCard({ decision, onToggleReasoning, isOpen, actionLink }) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
      <h3 className="text-xl font-semibold">{decision.title}</h3>
      <p className="mt-1 text-xs text-mentisTextSecondary">{decision.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-mentisBg/70 p-3"><p className="text-mentisTextSecondary">Fit</p><p className="font-semibold">{decision.fitScore}%</p></div>
        <div className="rounded-lg bg-mentisBg/70 p-3"><p className="text-mentisTextSecondary">Readiness</p><p className="font-semibold">{decision.readinessScore}%</p></div>
        <div className="rounded-lg bg-mentisBg/70 p-3"><p className="text-mentisTextSecondary">Opportunity</p><p className="font-semibold">{decision.opportunityScore}%</p></div>
        <div className="rounded-lg bg-mentisBg/70 p-3"><p className="text-mentisTextSecondary">Confidence</p><p className="font-semibold">{decision.confidenceScore}%</p></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-slate-700 bg-mentisBg/50 p-3">
          <p className="text-mentisTextSecondary">Uncertainty</p>
          <p className="font-semibold text-mentisText">{decision.uncertaintyLevel}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-mentisBg/50 p-3">
          <p className="text-mentisTextSecondary">Market Score</p>
          <p className="font-semibold text-mentisText">{decision.market.marketScore}%</p>
        </div>
      </div>
      <button onClick={onToggleReasoning} className="mt-4 text-sm text-mentisSecondary hover:text-mentisText">
        Why this match {isOpen ? "-" : "+"}
      </button>
      {isOpen ? (
        <div className="mt-3 space-y-3">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mentisTextSecondary">
            {decision.rationale.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <div className="rounded-lg border border-mentisPrimary/30 bg-mentisPrimary/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-mentisSecondary">Actionable next steps</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mentisTextSecondary">
              {decision.nextActions.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
      {actionLink}
    </article>
  );
}
