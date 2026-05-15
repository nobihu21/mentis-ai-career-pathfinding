import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VisualModeToggle from "../components/modes/VisualModeToggle";
import SectionTitle from "../components/ui/SectionTitle";

const audienceViews = {
  student: {
    label: "Student View",
    tone: "Guided and practical learning-focused insights.",
    complexity: "Simple metrics and clear next steps"
  },
  parent: {
    label: "Parent View",
    tone: "Outcome-oriented and safety-focused guidance.",
    complexity: "Stability, risk, and growth clarity"
  },
  counselor: {
    label: "Counselor View",
    tone: "Advisory and assessment-driven intelligence.",
    complexity: "Expanded metrics and comparative evidence"
  }
};

const profile = {
  interests: 84,
  aptitude: 76,
  personality: "Strategic + collaborative work style",
  values: "Growth, autonomy, and social impact",
  confidence: 81,
  readiness: 79
};

const careers = [
  {
    id: "pm",
    title: "Product Manager",
    fit: 89,
    confidence: 84,
    strengths: "Communication, prioritization, cross-functional ownership",
    gaps: "Product analytics depth, experimentation framework",
    alternatives: "Growth Product Analyst, Program Manager",
    why: "High alignment with your strategic decision style and market demand.",
    market: {
      salary: "$95k - $165k",
      demand: "High",
      growth: "+18% / 5y",
      automation: "Low-Medium",
      scope: "Global high demand, strong local hiring"
    },
    timeline: "6-9 months"
  },
  {
    id: "uxr",
    title: "UX Researcher",
    fit: 82,
    confidence: 76,
    strengths: "User empathy, insight synthesis, structured thinking",
    gaps: "Research ops depth, mixed-method analytics",
    alternatives: "Product Analyst, UX Strategist",
    why: "Strong qualitative profile with moderate market volatility.",
    market: {
      salary: "$85k - $140k",
      demand: "Medium-High",
      growth: "+11% / 5y",
      automation: "Low",
      scope: "Global moderate demand, local pockets"
    },
    timeline: "5-8 months"
  }
];

const roadmap = {
  day30: ["Complete PM core foundations", "Run 3 customer interviews", "Publish problem brief"],
  day60: ["Build roadmap case artifact", "Lead one cross-functional planning session", "Practice KPI design"],
  day90: ["Ship one scoped initiative", "Present impact narrative", "Finalize transition portfolio"]
};

function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-mentisTextSecondary">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [audience, setAudience] = useState("student");
  const [openCareer, setOpenCareer] = useState("pm");
  const [comparisonA, setComparisonA] = useState("pm");
  const [comparisonB, setComparisonB] = useState("uxr");
  const [completed, setCompleted] = useState({});

  const selectedA = careers.find((c) => c.id === comparisonA);
  const selectedB = careers.find((c) => c.id === comparisonB);
  const allTasks = [...roadmap.day30, ...roadmap.day60, ...roadmap.day90];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const trackPercent = Math.round((completedCount / allTasks.length) * 100);

  const unifiedReadiness = useMemo(() => {
    const fit = careers.find((c) => c.id === openCareer)?.fit ?? 0;
    const confidence = careers.find((c) => c.id === openCareer)?.confidence ?? 0;
    const marketWeight = careers.find((c) => c.id === openCareer)?.market.demand === "High" ? 85 : 72;
    const progressWeight = trackPercent || 45;
    return Math.round((fit * 0.3 + profile.readiness * 0.25 + marketWeight * 0.25 + confidence * 0.1 + progressWeight * 0.1));
  }, [openCareer, trackPercent]);

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-700 bg-mentisBg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-mentisPrimary to-mentisSecondary shadow-glow" />
            <span className="text-lg font-semibold text-mentisTextPrimary">MENTIS</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-mentisTextSecondary md:flex">
            <a href="#features" className="hover:text-mentisText">Features</a>
            <a href="#workflow" className="hover:text-mentisText">How It Works</a>
            <a href="#assistant" className="hover:text-mentisText">AI Assistant</a>
          </nav>
          <div className="flex items-center gap-3">
            <VisualModeToggle />
            <Link to="/assessment" className="rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-mentisSecondary">Start Assessment</Link>
          </div>
        </div>
      </header>
      <main>
        <section className="bg-hero-radial border-b border-slate-700/70">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
            <div className="space-y-7">
              <p className="inline-flex rounded-full border border-mentisSecondary/40 bg-mentisSecondary/10 px-4 py-1 text-xs font-medium text-mentisSecondary">
                AI Career Decision Intelligence System
              </p>
              <h1 className="text-4xl font-bold leading-tight text-mentisTextPrimary md:text-5xl">
                Make Career Decisions with Explainable AI Intelligence
              </h1>
              <p className="max-w-xl text-lg text-mentisTextSecondary">
                Diagnose your profile, compare paths with market reality, and execute a measurable 90-day action system.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/assessment" className="rounded-xl bg-mentisPrimary px-6 py-3 text-center text-sm font-semibold text-white shadow-glow transition hover:bg-mentisSecondary">
                  Start Assessment
                </Link>
                <a href="#comparison" className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-mentisTextPrimary transition hover:border-mentisSecondary/60 hover:bg-mentisSecondary/10">Compare Careers</a>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-card-glow p-6 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-mentisTextSecondary">Unified Career Readiness</p>
              <p className="mt-2 text-5xl font-bold text-mentisSecondary">{unifiedReadiness}</p>
              <p className="text-sm text-mentisTextSecondary">Composed of fit, skill readiness, market demand, confidence, and progress.</p>
              <div className="mt-5 space-y-3">
                <ProgressBar label="Fit score contribution" value={careers.find((c) => c.id === openCareer)?.fit ?? 0} />
                <ProgressBar label="Skill readiness contribution" value={profile.readiness} />
                <ProgressBar label="Confidence contribution" value={careers.find((c) => c.id === openCareer)?.confidence ?? 0} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16" id="features">
          <SectionTitle label="Features" title="Decision Intelligence, Not Generic Recommendations" subtitle="Every recommendation is explainable, measurable, and tied to practical action." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {["AI Diagnosis Dashboard", "Explainable Career Matching", "Market Intelligence Validation"].map((feature) => (
              <article key={feature} className="rounded-2xl border border-slate-700 bg-mentisCard/90 p-6 transition hover:-translate-y-1 hover:border-mentisSecondary/50">
                <div className="mb-4 h-10 w-10 rounded-xl bg-gradient-to-br from-mentisPrimary to-mentisSecondary" />
                <h3 className="font-semibold text-white">{feature}</h3>
                <p className="mt-2 text-sm text-mentisTextSecondary">Structured insights with confidence levels, uncertainty context, and next-step execution.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-700/70 bg-mentisCard/30 py-16" id="workflow">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle label="Audience System" title="Multi-Audience View Toggle" subtitle="Student, Parent, and Counselor views adapt insight tone and complexity." />
            <div className="mt-8 flex flex-wrap gap-3">
              {Object.entries(audienceViews).map(([key, value]) => (
                <button key={key} onClick={() => setAudience(key)} className={`rounded-lg px-4 py-2 text-sm transition ${audience === key ? "bg-mentisPrimary text-white" : "border border-slate-700 bg-mentisBg/60 text-mentisTextSecondary hover:text-mentisText"}`}>
                  {value.label}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-700 bg-mentisCard p-5">
              <p className="text-sm text-white">{audienceViews[audience].tone}</p>
              <p className="mt-2 text-sm text-mentisTextSecondary">{audienceViews[audience].complexity}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <SectionTitle label="Diagnosis" title="AI Career Diagnosis Module" subtitle="Structured profile panel across interests, aptitude, personality, values, confidence, and readiness." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
              <div className="space-y-4">
                <ProgressBar label="Interests profile" value={profile.interests} />
                <ProgressBar label="Aptitude profile" value={profile.aptitude} />
                <ProgressBar label="Confidence level" value={profile.confidence} />
                <ProgressBar label="Career readiness score" value={profile.readiness} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
              <p className="text-sm text-mentisTextSecondary">Personality / Work Style</p>
              <p className="mt-1 font-semibold text-white">{profile.personality}</p>
              <p className="mt-4 text-sm text-mentisTextSecondary">Values Alignment</p>
              <p className="mt-1 font-semibold text-white">{profile.values}</p>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-700/70 bg-mentisCard/30 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle label="How It Works" title="Diagnose -> Match -> Validate -> Execute -> Adapt" subtitle="A complete decision flow with explainability and measurable progress." />
            <div className="mt-10 grid gap-5 md:grid-cols-5">
              {["Diagnose", "Match", "Validate", "Act", "Track"].map((step, idx) => (
                <div key={step} className="rounded-xl border border-slate-700 bg-mentisCard p-4">
                  <p className="text-xs text-mentisSecondary">Step {idx + 1}</p>
                  <p className="mt-2 font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <SectionTitle label="Matching + Market Validation" title="Explainable Career Matching Engine" subtitle="No black-box output: each recommendation includes fit logic, gaps, alternatives, and market reality." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {careers.map((career) => (
              <article key={career.id} className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white">{career.title}</h3>
                  <button onClick={() => setOpenCareer(career.id)} className={`rounded-lg px-3 py-1 text-xs ${openCareer === career.id ? "bg-mentisPrimary text-white" : "border border-slate-700 text-mentisTextSecondary hover:text-mentisText"}`}>Use for score</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-mentisBg/70 p-3"><p className="text-mentisTextSecondary">Fit Score</p><p className="font-semibold text-white">{career.fit}%</p></div>
                  <div className="rounded-lg bg-mentisBg/70 p-3"><p className="text-mentisTextSecondary">Confidence</p><p className="font-semibold text-white">{career.confidence}%</p></div>
                </div>
                <p className="mt-4 text-sm text-mentisTextSecondary"><span className="text-white">Why this match:</span> {career.why}</p>
                <p className="mt-2 text-sm text-mentisTextSecondary"><span className="text-white">Strengths:</span> {career.strengths}</p>
                <p className="mt-2 text-sm text-mentisTextSecondary"><span className="text-white">Weakness gaps:</span> {career.gaps}</p>
                <p className="mt-2 text-sm text-mentisTextSecondary"><span className="text-white">Alternative careers:</span> {career.alternatives}</p>

                <div className="mt-5 rounded-xl border border-slate-700 bg-mentisBg/60 p-4 text-sm">
                  <p className="font-semibold text-white">Market Intelligence Panel</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <p className="text-mentisTextSecondary">Salary</p><p className="text-white">{career.market.salary}</p>
                    <p className="text-mentisTextSecondary">Demand</p><p className="text-white">{career.market.demand}</p>
                    <p className="text-mentisTextSecondary">Growth</p><p className="text-white">{career.market.growth}</p>
                    <p className="text-mentisTextSecondary">Automation Risk</p><p className="text-white">{career.market.automation}</p>
                    <p className="text-mentisTextSecondary">Global vs Local</p><p className="text-white">{career.market.scope}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-700/70 bg-mentisCard/30 py-16" id="comparison">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle label="Comparison Engine" title="Career A vs Career B Decision Table" subtitle="Designed for real decision making with tangible trade-offs." />
            <div className="mt-8 flex flex-wrap gap-3">
              <select value={comparisonA} onChange={(e) => setComparisonA(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-white">
                {careers.map((c) => <option key={c.id} value={c.id}>{c.title} (A)</option>)}
              </select>
              <select value={comparisonB} onChange={(e) => setComparisonB(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-white">
                {careers.map((c) => <option key={c.id} value={c.id}>{c.title} (B)</option>)}
              </select>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-700 bg-mentisCard">
              <table className="w-full text-left text-sm">
                <thead className="bg-mentisBg/70 text-mentisTextSecondary">
                  <tr><th className="px-4 py-3">Metric</th><th className="px-4 py-3">{selectedA?.title}</th><th className="px-4 py-3">{selectedB?.title}</th></tr>
                </thead>
                <tbody>
                  {[
                    ["Salary", selectedA?.market.salary, selectedB?.market.salary],
                    ["Growth potential", selectedA?.market.growth, selectedB?.market.growth],
                    ["Difficulty", selectedA?.gaps, selectedB?.gaps],
                    ["Skill requirements", selectedA?.strengths, selectedB?.strengths],
                    ["Time to enter", selectedA?.timeline, selectedB?.timeline],
                    ["Risk level", selectedA?.market.automation, selectedB?.market.automation]
                  ].map(([m, a, b]) => (
                    <tr key={m} className="border-t border-slate-700">
                      <td className="px-4 py-3 text-mentisTextSecondary">{m}</td>
                      <td className="px-4 py-3 text-white">{a}</td>
                      <td className="px-4 py-3 text-white">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <SectionTitle label="Roadmap + Tracking" title="30 / 60 / 90 Career Execution System" subtitle="Actionable tasks, milestones, and progress adaptation in one place." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {Object.entries({ "30-Day": roadmap.day30, "60-Day": roadmap.day60, "90-Day": roadmap.day90 }).map(([label, tasks]) => (
              <div key={label} className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
                <h3 className="font-semibold text-white">{label} Plan</h3>
                <ul className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2 rounded-lg bg-mentisBg/70 p-3">
                      <input type="checkbox" checked={!!completed[task]} onChange={() => setCompleted((prev) => ({ ...prev, [task]: !prev[task] }))} className="mt-1 accent-mentisPrimary" />
                      <span className={`text-sm ${completed[task] ? "line-through text-mentisTextSecondary" : "text-white"}`}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-mentisCard p-5">
            <ProgressBar label="Overall execution progress" value={trackPercent} />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16" id="assistant">
          <SectionTitle label="AI Assistant" title="Decision Co-Pilot, Not Generic Chatbot" subtitle="The assistant explains recommendations, confidence, and next best actions." />
          <div className="mt-10 grid gap-6 rounded-2xl border border-slate-700 bg-mentisCard p-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="w-fit max-w-sm rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-mentisTextPrimary">Why this recommendation?</div>
              <div className="ml-auto w-fit max-w-sm rounded-2xl rounded-br-md bg-mentisPrimary px-4 py-3 text-sm text-white">Product Manager has 89% fit with high market demand. Confidence: 84%. Uncertainty: low-medium due to analytics gap.</div>
              <div className="w-fit max-w-sm rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-mentisTextPrimary">What should I do next week?</div>
              <div className="ml-auto w-fit max-w-sm rounded-2xl rounded-br-md bg-mentisPrimary px-4 py-3 text-sm text-white">Complete 2 stakeholder interviews and a KPI mapping exercise to reduce readiness risk.</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-mentisBg p-5">
              <p className="text-sm font-semibold text-white">Response Intelligence</p>
              <ul className="mt-4 space-y-2 text-sm text-mentisTextSecondary">
                <li>Reasoning breakdown per recommendation</li>
                <li>Confidence indicator with uncertainty note</li>
                <li>Suggested next steps and decision support</li>
              </ul>
              <button className="mt-5 w-full rounded-lg bg-mentisSecondary px-4 py-3 text-sm font-semibold text-white transition hover:bg-mentisPrimary">Ask Career AI Assistant</button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
          <div className="rounded-2xl border border-mentisSecondary/30 bg-gradient-to-r from-mentisPrimary/20 to-mentisSecondary/10 p-8 text-center shadow-glow md:p-10">
            <h2 className="text-3xl font-bold text-mentisTextPrimary md:text-4xl">Ready to Decide with Clarity?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-mentisTextSecondary">MENTIS turns career uncertainty into explainable decisions, validated by market intelligence and backed by action plans.</p>
            <Link to="/assessment" className="mt-8 inline-block rounded-xl bg-mentisPrimary px-8 py-3 text-sm font-semibold text-white transition hover:bg-mentisSecondary">Start Assessment</Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-700 bg-mentisBg">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-mentisTextSecondary md:flex-row md:items-center md:justify-between">
          <p>2026 MENTIS. AI Career Decision Intelligence System.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-mentisText">Privacy</a>
            <a href="#" className="hover:text-mentisText">Terms</a>
            <a href="#" className="hover:text-mentisText">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
