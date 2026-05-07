import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DecisionCard from "../components/decision/DecisionCard";
import ProductShell from "../components/layout/ProductShell";
import { useAuth } from "../contexts/AuthContext";
import { getCareerMatches } from "../services/firestore";

export default function ResultsPage() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [open, setOpen]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [noData, setNoData]       = useState(false);

  useEffect(() => {
    if (!user) return;
    getCareerMatches(user.uid).then((matches) => {
      if (!matches || matches.length === 0) {
        setNoData(true);
      } else {
        setDecisions(matches);
      }
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <ProductShell title="Career Match Results" subtitle="Match layer — real data from your assessment.">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
        </div>
      </ProductShell>
    );
  }

  if (noData) {
    return (
      <ProductShell title="Career Match Results" subtitle="Match layer — real data from your assessment.">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <p className="text-lg font-semibold text-amber-300">Pehle Assessment Complete Karo</p>
          <p className="mt-2 text-sm text-mentisTextSecondary">
            Career matches dekhne ke liye pehle apna diagnosis complete karo.
          </p>
          <Link
            to="/assessment"
            className="mt-5 inline-block rounded-lg bg-mentisPrimary px-6 py-2.5 text-sm font-semibold text-white"
          >
            Assessment Karo →
          </Link>
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell
      title="Career Match Results"
      subtitle="Match layer: score-based career options with transparent decision rationale."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {decisions.map((career) => (
          <DecisionCard
            key={career.id}
            decision={career}
            isOpen={open === career.id}
            onToggleReasoning={() => setOpen(open === career.id ? null : career.id)}
            actionLink={
              <Link
                to={`/career/${career.id}`}
                className="mt-5 block rounded-lg bg-mentisPrimary px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Validate Career
              </Link>
            }
          />
        ))}
      </div>
    </ProductShell>
  );
}
