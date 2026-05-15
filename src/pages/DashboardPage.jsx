import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductShell from "../components/layout/ProductShell";
import MetricBar from "../components/ui/MetricBar";
import AiAssistant from "../components/chat/AiAssistant";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardStats } from "../services/firestore";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.uid)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = profile?.displayName || user?.displayName || user?.email || "User";

  return (
    <ProductShell
      title={`Welcome back, ${displayName.split(" ")[0]} 👋`}
      subtitle="Your career decision hub — real-time data from your profile."
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
              <p className="text-sm text-mentisTextSecondary">Career Readiness Score</p>
              <p className="mt-2 text-3xl font-bold text-mentisSecondary">
                {stats?.readiness ?? 0}%
              </p>
              {!stats?.hasAssessment && (
                <p className="mt-1 text-xs text-amber-400">⚠ Assessment abhi nahi hua</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
              <p className="text-sm text-mentisTextSecondary">Roadmap Progress</p>
              <p className="mt-2 text-3xl font-bold text-mentisText">
                {stats?.progress ?? 0}%
              </p>
              <p className="mt-1 text-xs text-mentisTextSecondary">
                {stats?.completedTasks ?? 0} / {stats?.totalTasks ?? 0} tasks
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
              <p className="text-sm text-mentisTextSecondary">Top Career Match</p>
              <p className="mt-2 text-xl font-semibold text-mentisText">
                {stats?.topCareerMatch ?? "—"}
              </p>
              {!stats?.hasAssessment && (
                <p className="mt-1 text-xs text-mentisTextSecondary">Assessment complete karo</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left: Quick Insights */}
            <div className="space-y-6">
              {!stats?.hasAssessment ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
                  <h3 className="text-lg font-semibold text-amber-300">Assessment Incomplete</h3>
                  <p className="mt-2 text-sm text-mentisTextSecondary">
                    Apna career assessment complete karo taake real data dashboard par aaye.
                  </p>
                  <Link
                    to="/assessment"
                    className="mt-4 inline-block rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black"
                  >
                    Assessment Start Karo →
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
                  <h3 className="text-lg font-semibold">Profile Breakdown</h3>
                  <div className="mt-5 space-y-4">
                    <MetricBar label="Interests Score"    value={stats?.interests ?? 0} />
                    <MetricBar label="Aptitude Score"     value={stats?.aptitude ?? 0} />
                    <MetricBar label="Overall Readiness"  value={stats?.readiness ?? 0} />
                    <MetricBar label="Roadmap Execution"  value={stats?.progress ?? 0} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/results" className="rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white">
                      View Career Matches
                    </Link>
                    <Link to="/roadmap" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">
                      Open 90-Day Roadmap
                    </Link>
                    <Link to="/assessment" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">
                      Reassess
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right: AI Assistant - LIVE */}
            <div className="h-[500px]">
              <AiAssistant />
            </div>
          </div>
        </>
      )}
    </ProductShell>
  );
}
