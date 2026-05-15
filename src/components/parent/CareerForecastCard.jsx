import React from "react";
import { getChildCareerForecast } from "../../services/api";

export default function CareerForecastCard({ childId, rank }) {
  const [career, setCareer] = React.useState(null);

  React.useEffect(() => {
    if (!childId || !rank) return;
    let cancelled = false;

    getChildCareerForecast(childId)
      .then((data) => {
        if (cancelled) return;
        const top = data?.topCareers || [];
        setCareer(top[rank - 1] || null);
      })
      .catch((e) => console.error("Forecast fetch error:", e));

    return () => {
      cancelled = true;
    };
  }, [childId, rank]);

  if (!career) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-400">#{rank} Recommended</p>
          <h4 className="text-xl font-semibold text-white mt-1">{career.careerName}</h4>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400">
          {career.suitabilityScore}% fit
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-400">Salary Range</p>
          <p className="text-sm font-medium text-white mt-1">{career.marketData?.avgSalary}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Market Growth</p>
          <p className="text-sm font-medium text-white mt-1">{career.marketData?.jobGrowth}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Time to Readiness</p>
          <p className="text-sm font-medium text-white mt-1">{career.timeToReadiness}</p>
        </div>
      </div>

      {career.skillGaps?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Skill Gaps</p>
          <ul className="space-y-1">
            {career.skillGaps.slice(0, 2).map((gap, i) => (
              <li key={i} className="text-xs text-slate-300">
                ⚠️ {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

