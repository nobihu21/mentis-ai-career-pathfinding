import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductShell from "../components/layout/ProductShell";
import MetricBar from "../components/ui/MetricBar";
import ReadinessBreakdownCard from "../components/decision/ReadinessBreakdownCard";
import { useAuth } from "../contexts/AuthContext";
import { getCareerMatches } from "../services/firestore";

export default function CareerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCareerMatches(user.uid).then((matches) => {
      if (matches) {
        const found = matches.find((m) => m.id === id) || matches[0];
        setCareer(found);
      }
      setLoading(false);
    });
  }, [user, id]);

  if (loading) {
    return (
      <ProductShell title="Career Detail" subtitle="Validate layer">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
        </div>
      </ProductShell>
    );
  }

  if (!career) {
    return (
      <ProductShell title="Career Detail" subtitle="Validate layer">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <p className="text-lg font-semibold text-amber-300">Pehle Assessment Complete Karo</p>
          <Link to="/assessment" className="mt-4 inline-block rounded-lg bg-mentisPrimary px-6 py-2.5 text-sm font-semibold text-white">
            Assessment Karo →
          </Link>
        </div>
      </ProductShell>
    );
  }

  const breakdown = {
    fitScore:        career.fitScore,
    skillReadiness:  career.readinessScore,
    marketDemand:    career.opportunityScore,
    confidenceLevel: career.confidenceScore,
    progressTracking: 60,
    methodology:     "Weighted composite: 40% fit + 30% readiness + 30% market opportunity",
    weightedResult:  career.confidenceScore,
  };

  return (
    <ProductShell
      title="Career Validation Detail"
      subtitle="Validate layer: role realities, market signals, and skill gap visibility."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h2 className="text-xl font-semibold">{career.title}</h2>
            <p className="mt-3 text-mentisTextSecondary">{career.summary}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-mentisBg/70 p-3 text-sm">
                <p className="text-mentisTextSecondary">Confidence</p>
                <p className="font-semibold">{career.confidenceScore}%</p>
              </div>
              <div className="rounded-lg bg-mentisBg/70 p-3 text-sm">
                <p className="text-mentisTextSecondary">Uncertainty</p>
                <p className="font-semibold">{career.uncertaintyLevel}</p>
              </div>
              <div className="rounded-lg bg-mentisBg/70 p-3 text-sm">
                <p className="text-mentisTextSecondary">Time to Ready</p>
                <p className="font-semibold">{career.timeToReadiness}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h3 className="text-lg font-semibold">Market Intelligence</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["Salary Range", career.market?.salary],
                ["Demand", career.market?.demand],
                ["Growth", career.market?.growth],
                ["Market Score", `${career.market?.marketScore}%`],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-mentisBg/70 p-3 text-sm">
                  <p className="text-mentisTextSecondary">{label}</p>
                  <p className="font-semibold">{val}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h3 className="text-lg font-semibold">Strengths & Gaps</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <p className="text-green-400 font-semibold">Strengths</p>
                <p className="mt-1 text-white">{career.strengthsAlignment}</p>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-amber-400 font-semibold">Gaps to Bridge</p>
                <p className="mt-1 text-white">{career.weaknessGaps}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h3 className="text-lg font-semibold">Next Actions</h3>
            <ul className="mt-4 space-y-2">
              {career.nextActions?.map((action) => (
                <li key={action} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-mentisSecondary">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <Link to="/roadmap" className="mt-5 inline-block rounded-lg bg-mentisPrimary px-5 py-2 text-sm font-semibold text-white">
              Open Roadmap
            </Link>
          </section>
        </div>

        <ReadinessBreakdownCard breakdown={breakdown} />
      </div>
    </ProductShell>
  );
}
