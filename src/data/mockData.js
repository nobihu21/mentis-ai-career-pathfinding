import { buildDecisionObject, decisionEnvelope } from "../domain/decision/decisionModel";

export const dashboardStats = {
  readiness: 78,
  progress: 64,
  topCareerMatch: "Product Manager",
  completedTasks: 21
};

export const decisionObjects = [
  buildDecisionObject({
    id: "product-manager",
    role: "student",
    title: "Product Manager",
    summary: "Strong near-term transition path with high market upside.",
    fitScore: 89,
    readinessScore: 78,
    opportunityScore: 86,
    confidenceScore: 84,
    uncertaintyLevel: "Low",
    riskFlags: ["Analytics depth not yet role-ready"],
    timeToReadiness: "6-9 months",
    recommendedRoute: "Portfolio-led transition with stakeholder project",
    rationale: [
      "Strong cross-functional communication and planning background.",
      "High overlap between your current delivery experience and product ownership.",
      "Market demand is strong in your preferred geography."
    ],
    strengthsAlignment: "Communication, prioritization, and execution ownership",
    weaknessGaps: "Product analytics depth and experimentation design",
    alternatives: ["Growth Product Analyst", "Program Manager"],
    nextActions: ["Validate through 2 PM shadow sessions", "Complete strategy case simulation"],
    market: {
      salary: "$95k - $165k",
      demand: "High",
      growth: "+18% projected in 5 years",
      automationRisk: "Low-Medium",
      globalVsLocal: "Global high demand, strong local hiring",
      marketScore: 88
    },
    explainability: {
      confidenceFactors: ["Behavioral fit", "Role similarity", "Market demand signal"],
      uncertaintyReason: "Market confidence is high but analytics skill gap remains."
    }
  }),
  buildDecisionObject({
    id: "ux-researcher",
    role: "student",
    title: "UX Researcher",
    summary: "High fit role with moderate market velocity and narrower openings.",
    fitScore: 82,
    readinessScore: 70,
    opportunityScore: 79,
    confidenceScore: 76,
    uncertaintyLevel: "Medium",
    riskFlags: ["Portfolio depth required for hiring competitiveness"],
    timeToReadiness: "5-8 months",
    recommendedRoute: "Research portfolio and mixed-method skill validation",
    rationale: [
      "Your analytical thinking aligns with research-driven roles.",
      "You already use user feedback loops in your current work.",
      "Skill gap is focused and learnable in under 6 months."
    ],
    strengthsAlignment: "User empathy, insight synthesis, and qualitative discovery",
    weaknessGaps: "Research ops process and mixed-method analytics",
    alternatives: ["Product Analyst", "UX Strategist"],
    nextActions: ["Run one portfolio usability study", "Build qualitative research case study"],
    market: {
      salary: "$85k - $140k",
      demand: "Medium-High",
      growth: "+11% projected in 5 years",
      automationRisk: "Low",
      globalVsLocal: "Global moderate demand, local market pockets",
      marketScore: 74
    },
    explainability: {
      confidenceFactors: ["Strong behavioral fit", "Transferable research mindset"],
      uncertaintyReason: "Hiring velocity is moderate in local market."
    }
  }),
  buildDecisionObject({
    id: "growth-analyst",
    role: "student",
    title: "Growth Analyst",
    summary: "Data-driven option with opportunity, but skill depth risk remains.",
    fitScore: 77,
    readinessScore: 68,
    opportunityScore: 81,
    confidenceScore: 73,
    uncertaintyLevel: "Medium-High",
    riskFlags: ["SQL and experimentation foundations are still early"],
    timeToReadiness: "7-10 months",
    recommendedRoute: "Analytics-first pathway with guided experimentation projects",
    rationale: [
      "You show strong interest in data-backed decision making.",
      "High opportunity score due to broad cross-industry demand.",
      "Requires upskilling in experiment design and SQL depth."
    ],
    strengthsAlignment: "Curiosity, data-informed thinking, and iteration mindset",
    weaknessGaps: "Deep SQL fluency and growth experimentation practice",
    alternatives: ["Business Analyst", "Product Operations Analyst"],
    nextActions: ["Complete SQL project sprint", "Practice experiment design with mentor review"],
    market: {
      salary: "$80k - $135k",
      demand: "High",
      growth: "+16% projected in 5 years",
      automationRisk: "Medium",
      globalVsLocal: "Strong global demand, moderate local competition",
      marketScore: 80
    },
    explainability: {
      confidenceFactors: ["Opportunity signal", "Cross-industry demand"],
      uncertaintyReason: "Readiness variance due to technical gap severity."
    }
  })
];

export const decisionObjectsByRole = {
  student: decisionEnvelope(decisionObjects, { audience: "student" }),
  parent: decisionEnvelope(
    decisionObjects.map((item) => ({
      ...item,
      summary: `${item.title}: ${item.summary}. Family support focus: timeline and cost confidence.`
    })),
    { audience: "parent" }
  ),
  counselor: decisionEnvelope(
    decisionObjects.map((item) => ({
      ...item,
      summary: `${item.title}: intervention-ready profile with risk flags and readiness checkpoints.`
    })),
    { audience: "counselor" }
  ),
  institution_admin: decisionEnvelope(
    decisionObjects.map((item) => ({
      ...item,
      summary: `${item.title}: cohort-level pathway signal for planning and intervention.`
    })),
    { audience: "institution_admin" }
  )
};

export const careerDetails = {
  title: "Product Manager",
  overview:
    "Lead product strategy, align teams, prioritize roadmap, and deliver measurable user and business outcomes.",
  requiredSkills: [
    "Product Strategy",
    "Stakeholder Management",
    "Roadmap Planning",
    "Experimentation",
    "User Research",
    "Metrics & Analytics"
  ],
  market: {
    salary: "$95k - $165k",
    demand: "High (8.5/10)",
    growth: "+18% projected in 5 years"
  },
  decisionIntelligence: {
    confidence: 84,
    uncertainty: "Low-Medium",
    principalRisk: "Execution risk if stakeholder influence skills are not improved in first 60 days.",
    marketWeight: "35% of recommendation confidence is market-driven."
  },
  skillGap: [
    { skill: "Product Strategy", current: 58, target: 85 },
    { skill: "Experimentation", current: 52, target: 80 },
    { skill: "Stakeholder Management", current: 71, target: 88 }
  ]
};

export const roadmap = {
  day30: [
    "Complete PM fundamentals course",
    "Shadow one product planning meeting",
    "Write one problem statement document"
  ],
  day60: [
    "Run one user interview cycle",
    "Create feature prioritization matrix",
    "Define North Star metric proposal"
  ],
  day90: [
    "Lead a scoped feature discovery sprint",
    "Present product recommendation deck",
    "Publish portfolio case study"
  ],
  milestones: [
    "Week 4: Role transition baseline complete",
    "Week 8: Validation project delivered",
    "Week 12: PM-ready portfolio milestone"
  ]
};

export const comparisonRows = [
  { metric: "Fit", careerA: "89%", careerB: "82%" },
  { metric: "Salary", careerA: "$95k-$165k", careerB: "$85k-$140k" },
  { metric: "Demand", careerA: "High", careerB: "Medium-High" },
  { metric: "Time to Enter", careerA: "6-9 months", careerB: "4-7 months" },
  { metric: "Skill Difficulty", careerA: "Medium", careerB: "Medium" }
];

export const comparisonDecision = {
  recommendation: "Product Manager",
  rationale:
    "Higher fit and stronger demand create a better risk-adjusted transition for your current profile.",
  weightedScores: {
    careerA: 84,
    careerB: 77
  },
  nextStep: "Run a two-week validation sprint in PM workflow before final commitment."
};

export const tracking = {
  readinessBefore: 61,
  readinessNow: 78,
  completedTasks: 21,
  totalTasks: 34,
  skillGapReduction: 37
};

export const readinessBreakdown = {
  fitScore: 84,
  skillReadiness: 78,
  marketDemand: 85,
  confidenceLevel: 81,
  progressTracking: 64,
  weightedResult: 79,
  methodology:
    "Weighted model: fit 30%, skill readiness 25%, market demand 20%, confidence 15%, execution progress 10%."
};

export const decisionJournal = [
  {
    date: "2026-04-10",
    event: "Initial path selected",
    note: "Selected Product Manager due to strongest fit and market demand."
  },
  {
    date: "2026-04-18",
    event: "Decision revised checkpoint",
    note: "Added UX Researcher as backup path after advisor feedback."
  },
  {
    date: "2026-04-25",
    event: "Roadmap adaptation",
    note: "Switched week 4 milestone to analytics fundamentals sprint."
  }
];

export const institutionAnalytics = {
  cohortReadiness: [
    { segment: "High readiness", value: 34 },
    { segment: "Medium readiness", value: 46 },
    { segment: "Low readiness", value: 20 }
  ],
  skillGapHeatmap: [
    { skill: "Data Literacy", gapLevel: "High" },
    { skill: "Stakeholder Communication", gapLevel: "Medium" },
    { skill: "Research Synthesis", gapLevel: "Medium" },
    { skill: "Experiment Design", gapLevel: "High" }
  ],
  interventions: [
    { name: "Career lab workshop", effectiveness: "High" },
    { name: "Mentor pairing", effectiveness: "Medium-High" },
    { name: "Portfolio sprint", effectiveness: "Medium" }
  ]
};
