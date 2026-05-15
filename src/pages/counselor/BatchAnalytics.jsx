import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import { getBatchAnalytics, getCounselorBatches } from "../../services/api";

export default function BatchAnalytics() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getCounselorBatches().then((data) => {
      const list = data?.batches || [];
      setBatches(list);
      setBatchId(list[0]?.batchId || "");
    }).catch(() => setBatches([]));
  }, []);

  useEffect(() => {
    if (!batchId) return;
    getBatchAnalytics(batchId).then((data) => setAnalytics(data?.analytics || null)).catch(() => setAnalytics(null));
  }, [batchId]);

  const heatmap = analytics?.interestHeatmap || {};

  return (
    <ProductShell title="Batch Analytics" subtitle="Aggregate interest heatmap, skill gaps, and career trends.">
      <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mb-6 rounded-lg border border-slate-700 bg-mentisCard px-3 py-2 text-sm text-mentisText">
        {batches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{batch.name}</option>)}
      </select>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <h2 className="text-lg font-semibold text-mentisText">Interest distribution</h2>
          <div className="mt-5 space-y-3">
            {Object.entries(heatmap).map(([domain, score]) => (
              <div key={domain}>
                <div className="mb-1 flex justify-between text-sm text-mentisTextSecondary"><span>{domain}</span><span>{score}%</span></div>
                <div className="h-2 rounded-full bg-slate-700"><div className="h-full rounded-full bg-mentisSecondary" style={{ width: `${score}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <h2 className="text-lg font-semibold text-mentisText">Skill gaps</h2>
          <div className="mt-5 space-y-2">
            {(analytics?.skillGaps || []).map(([gap, count]) => (
              <div key={gap} className="flex justify-between rounded-lg bg-mentisBg/70 px-3 py-2 text-sm">
                <span className="text-mentisTextSecondary">{gap}</span>
                <span className="text-mentisText">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
