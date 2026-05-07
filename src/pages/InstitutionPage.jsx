import ProductShell from "../components/layout/ProductShell";
import { institutionAnalytics } from "../data/mockData";

export default function InstitutionPage() {
  return (
    <ProductShell
      title="Institution Intelligence"
      subtitle="Starter analytics for cohort readiness, skill-gap hotspots, and intervention outcomes."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-700 bg-mentisCard p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold">Cohort Readiness Distribution</h3>
          <div className="mt-4 space-y-3">
            {institutionAnalytics.cohortReadiness.map((row) => (
              <div key={row.segment} className="rounded-lg bg-mentisBg/70 p-3">
                <p className="text-sm text-mentisTextSecondary">{row.segment}</p>
                <p className="mt-1 text-xl font-semibold text-white">{row.value}%</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-700 bg-mentisCard p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold">Skill Gap Heatmap (Starter)</h3>
          <div className="mt-4 space-y-3">
            {institutionAnalytics.skillGapHeatmap.map((row) => (
              <div key={row.skill} className="flex items-center justify-between rounded-lg bg-mentisBg/70 p-3 text-sm">
                <span className="text-white">{row.skill}</span>
                <span className={`font-semibold ${row.gapLevel === "High" ? "text-amber-300" : "text-mentisSecondary"}`}>{row.gapLevel}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-700 bg-mentisCard p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold">Intervention Effectiveness</h3>
          <div className="mt-4 space-y-3">
            {institutionAnalytics.interventions.map((row) => (
              <div key={row.name} className="rounded-lg bg-mentisBg/70 p-3">
                <p className="text-sm text-white">{row.name}</p>
                <p className="mt-1 text-sm text-mentisTextSecondary">{row.effectiveness}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ProductShell>
  );
}
