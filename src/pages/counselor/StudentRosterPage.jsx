import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import StudentRoster from "../../components/counselor/StudentRoster";
import { getCounselorBatches } from "../../services/api";

export default function StudentRosterPage() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");

  useEffect(() => {
    getCounselorBatches().then((data) => {
      const list = data?.batches || [];
      setBatches(list);
      setBatchId(list[0]?.batchId || "");
    }).catch(() => setBatches([]));
  }, []);

  return (
    <ProductShell title="Student Roster" subtitle="Filter, review, and intervene across batch students.">
      <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mb-6 rounded-lg border border-slate-700 bg-mentisCard px-3 py-2 text-sm text-mentisText">
        {batches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{batch.name}</option>)}
      </select>
      <StudentRoster batchId={batchId} />
    </ProductShell>
  );
}
