import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import { generateParentReport, getParentChildren } from "../../services/api";

export default function ParentReports() {
  const [children, setChildren] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    getParentChildren().then((data) => setChildren(data?.children || [])).catch(() => setChildren([]));
  }, []);

  async function generate(childId) {
    const data = await generateParentReport(childId);
    setReport(data?.report || null);
  }

  return (
    <ProductShell title="Parent Reports" subtitle="Generate print-ready guidance summaries.">
      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
          {children.map((child) => (
            <button key={child.studentId} onClick={() => generate(child.studentId)} className="mb-2 block w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm text-mentisText hover:border-mentisSecondary">
              Generate for {child.name || child.studentId}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          {!report ? (
            <p className="text-sm text-mentisTextSecondary">Choose a child to generate a report.</p>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-mentisText">{report.studentName} Career Report</h2>
              <p className="text-sm text-mentisTextSecondary">Readiness: {report.readiness}%</p>
              <p className="text-sm text-mentisTextSecondary">{report.guidance}</p>
              <button onClick={() => window.print()} className="rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white">Print / Save PDF</button>
            </div>
          )}
        </div>
      </div>
    </ProductShell>
  );
}
