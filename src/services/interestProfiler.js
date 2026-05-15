export const ACTION_WEIGHTS = {
  resource_viewed: 10,
  task_completed: 25,
  quiz_taken: 30,
  milestone_completed: 40,
};

export const INTEREST_DECAY = 0.9;

export const DEFAULT_DOMAINS = [
  "programming",
  "law",
  "business",
  "design",
  "medicine",
  "engineering",
  "data",
  "marketing",
];

export function calculateInterestScore(existingScore = 0, actionType = "resource_viewed") {
  const weight = ACTION_WEIGHTS[actionType] ?? ACTION_WEIGHTS.resource_viewed;
  return Math.min(100, Math.round(Number(existingScore || 0) * INTEREST_DECAY + weight));
}

export function sortDomainsByScore(domains = {}) {
  return Object.entries(domains)
    .map(([name, value]) => ({
      name,
      score: Math.round(Number(value?.score ?? value ?? 0)),
      sources: value?.sources || [],
      lastUpdated: value?.lastUpdated || null,
    }))
    .sort((a, b) => b.score - a.score);
}

export function detectInterestShift(oldDomains = {}, newDomains = {}) {
  const oldTop = sortDomainsByScore(oldDomains).slice(0, 3).map((d) => d.name);
  const newTop = sortDomainsByScore(newDomains).slice(0, 3).map((d) => d.name);
  const changed = newTop.filter((name) => !oldTop.includes(name));
  return {
    shifted: changed.length > 1,
    changedDomains: changed,
    oldTop,
    newTop,
  };
}
