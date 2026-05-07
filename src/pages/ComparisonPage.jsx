import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductShell from "../components/layout/ProductShell";
import { useAuth } from "../contexts/AuthContext";
import { getCareerMatches } from "../services/firestore";

export default function ComparisonPage() {
  const { user } = useAuth();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCareerMatches(user.uid).then((m) => {
      setCareers(m || []);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <ProductShell title="Career Comparison" subtitle="Compare your top career options.">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
        </div>
      </ProductShell>
    );
  }

  if (careers.length < 2) {
    return (
      <ProductShell title="Career Comparison" subtitle="Compare your top career options.">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <p className="text-lg font-semibold text-amber-300">Pehle Assessment Complete Karo</p>
          <Link to="/assessment" className="mt-4 inline-block rounded-lg bg-mentisPrimary px-6 py-2.5 text-sm font-semibold text-white">
            Assessment Karo →
          </Link>
        </div>
      </ProductShell>
    );
  }

  const [careerA, careerB] = careers;

  const rows = [
    ["Fit Score",        `${careerA.fitScore}%`,        `${careerB.fitScore}%`],
    ["Readiness",        `${careerA.readinessScore}%`,  `${careerB.readinessScore}%`],
    ["Opportunity",      `${careerA.opportunityScore}%`,`${careerB.opportunityScore}%`],
    ["Confidence",       `${careerA.confidenceScore}%`, `${careerB.confidenceScore}%`],
    ["Salary",           careerA.market?.salary,         careerB.market?.salary],
    ["Demand",           careerA.market?.demand,         careerB.market?.demand],
    ["Growth",           careerA.market?.growth,         careerB.market?.growth],
    ["Time to Ready",    careerA.timeToReadiness,        careerB.timeToReadiness],
    ["Uncertainty",      careerA.uncertaintyLevel,       careerB.uncertaintyLevel],
  ];

  return (
    <ProductShell title="Career Comparison" subtitle="Compare your top two career options side-by-side.">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-mentisCard p-4">
          <p className="text-xs uppercase tracking-wide text-mentisTextSecondary">Recommended</p>
          <p className="mt-2 text-lg font-semibold text-white">{careerA.title}</p>
          <p className="mt-2 text-sm text-mentisTextSecondary">Higher fit and stronger demand — better risk-adjusted transition.</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-mentisCard p-4">
          <p className="text-xs uppercase tracking-wide text-mentisTextSecondary">Score Comparison</p>
          <p className="mt-2 text-sm text-white">{careerA.title}: {careerA.confidenceScore}%</p>
          <p className="mt-1 text-sm text-white">{careerB.title}: {careerB.confidenceScore}%</p>
        </div>
        <div className="rounded-xl border border-mentisPrimary/30 bg-mentisPrimary/10 p-4">
          <p className="text-xs uppercase tracking-wide text-mentisSecondary">Action Step</p>
          <p className="mt-2 text-sm text-white">2-week validation sprint run karo phir final commitment lo.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-mentisCard">
        <table className="w-full text-left text-sm">
          <thead className="bg-mentisBg/70 text-mentisTextSecondary">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3 text-mentisPrimary">{careerA.title}</th>
              <th className="px-4 py-3">{careerB.title}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([metric, valA, valB]) => (
              <tr key={metric} className="border-t border-slate-700/50 hover:bg-white/5">
                <td className="px-4 py-3 text-mentisTextSecondary">{metric}</td>
                <td className="px-4 py-3 font-semibold text-mentisSecondary">{valA}</td>
                <td className="px-4 py-3 text-white">{valB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProductShell>
  );
}
