import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import { getChildCareerForecast, getParentChildren } from "../../services/api";

export default function CareerForecast() {
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState("");
  const [careers, setCareers] = useState([]);

  useEffect(() => {
    getParentChildren().then((data) => {
      const list = data?.children || [];
      setChildren(list);
      setChildId(list[0]?.studentId || "");
    }).catch(() => setChildren([]));
  }, []);

  useEffect(() => {
    if (!childId) return;
    getChildCareerForecast(childId).then((data) => setCareers(data?.topCareers || [])).catch(() => setCareers([]));
  }, [childId]);

  return (
    <ProductShell title="Career Forecast" subtitle="Parent view of top careers, market demand, and skill gaps.">
      <select value={childId} onChange={(e) => setChildId(e.target.value)} className="mb-6 rounded-lg border border-slate-700 bg-mentisCard px-3 py-2 text-sm text-mentisText">
        {children.map((child) => <option key={child.studentId} value={child.studentId}>{child.name || child.studentId}</option>)}
      </select>

      <div className="grid gap-5 md:grid-cols-3">
        {careers.map((career, index) => (
          <article key={career.id || career.careerName} className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <p className="text-sm text-mentisTextSecondary">#{index + 1} forecast</p>
            <h2 className="mt-1 text-xl font-semibold text-mentisText">{career.careerName || career.name}</h2>
            <p className="mt-4 text-3xl font-bold text-mentisSecondary">{career.suitabilityScore ?? career.fit ?? 0}%</p>
            <div className="mt-4 space-y-2 text-sm text-mentisTextSecondary">
              <p>Salary: <span className="text-mentisText">{career.marketData?.avgSalary || "PKR market data pending"}</span></p>
              <p>Growth: <span className="text-mentisText">{career.marketData?.jobGrowth || "N/A"}</span></p>
              <p>Readiness: <span className="text-mentisText">{career.timeToReadiness}</span></p>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-4">
              {(career.skillGaps || []).slice(0, 3).map((gap) => (
                <span key={gap} className="mb-2 mr-2 inline-block rounded-full bg-mentisBg px-3 py-1 text-xs text-mentisTextSecondary">{gap}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </ProductShell>
  );
}
