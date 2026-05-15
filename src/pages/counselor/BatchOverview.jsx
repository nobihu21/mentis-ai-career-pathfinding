import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import BatchOverviewCards from "../../components/counselor/BatchOverviewCards";
import { getBatchOverview, getCounselorBatches } from "../../services/api";

export default function BatchOverview() {
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
    getBatchOverview(batchId).then((data) => setAnalytics(data?.analytics || null)).catch(() => setAnalytics(null));
  }, [batchId]);

  return (
    <ProductShell title="Batch Overview" subtitle="Tier, readiness, engagement, and cohort signals.">
      <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mb-6 rounded-lg border border-slate-700 bg-mentisCard px-3 py-2 text-sm text-mentisText">
        {batches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{batch.name}</option>)}
      </select>
      <BatchOverviewCards analytics={analytics} />
    </ProductShell>
  );
}
