export const audienceRoles = ["student", "parent", "counselor", "institution_admin"];

export function buildDecisionObject(input) {
  return {
    id: input.id,
    role: input.role,
    title: input.title,
    summary: input.summary,
    fitScore: input.fitScore,
    readinessScore: input.readinessScore,
    opportunityScore: input.opportunityScore,
    confidenceScore: input.confidenceScore,
    uncertaintyLevel: input.uncertaintyLevel,
    riskFlags: input.riskFlags ?? [],
    timeToReadiness: input.timeToReadiness,
    recommendedRoute: input.recommendedRoute,
    rationale: input.rationale ?? [],
    strengthsAlignment: input.strengthsAlignment,
    weaknessGaps: input.weaknessGaps,
    alternatives: input.alternatives ?? [],
    nextActions: input.nextActions ?? [],
    market: input.market,
    explainability: input.explainability
  };
}

export function decisionEnvelope(data, meta = {}) {
  return {
    data,
    meta,
    explainability: {
      methodologyVersion: "v1",
      scoringModel: "weighted-composite"
    }
  };
}
