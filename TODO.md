# MENTIS AI v2.0 — Implementation TODO

## Phase 1: Real-time Interest Profiling + Career Recs
- [ ] Update backend `/v1/student/activity` to recalculate and persist `careerMatches` deterministically after updating `interestProfile`.
- [ ] Ensure backend `GET /v1/student/career-matches` returns the persisted `careerMatches` (sorted by `suitabilityScore`).
- [ ] Update student UI to fetch and display backend `careerMatches` (switch off assessment-derived results).

## Phase 2: Real-time Student UX Alignment
- [ ] Wire student dashboard/results routes so primary flow uses `/dashboard/student` (not `/assessment`).
- [ ] Update chat context payloads (tier/topDomains/career goal) when calling backend AI endpoint.

## Phase 3: Validation + Testing
- [ ] Smoke test with a logged-in student:
  - [ ] Log activity -> interest heatmap changes
  - [ ] careerMatches appear/refresh
  - [ ] Results page matches dashboard recommendations
- [ ] Run frontend + backend locally; fix any runtime errors.

