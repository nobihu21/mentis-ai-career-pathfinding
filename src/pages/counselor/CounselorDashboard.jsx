import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import ProductShell from "../../components/layout/ProductShell";
import BatchOverviewCards from "../../components/counselor/BatchOverviewCards";
import StudentRoster from "../../components/counselor/StudentRoster";
import CounselorAiAssistant from "../../components/counselor/CounselorAiAssistant";
import { getBatchOverview, getCounselorBatches } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";

export default function CounselorDashboard() {
  const { user, profile } = useAuth();
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [batchName, setBatchName] = useState("Matric-A 2026");
  const [batchTier, setBatchTier] = useState("matric");
  const [status, setStatus] = useState("");

  async function loadBatches() {
    getCounselorBatches()
      .then((data) => {
        const list = data?.batches || [];
        setBatches(list);
        setBatchId(list[0]?.batchId || "");
      })
      .catch(() => setBatches([]));
  }

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (!batchId) return;
    getBatchOverview(batchId)
      .then((data) => setAnalytics(data?.analytics || null))
      .catch(() => setAnalytics(null));
  }, [batchId]);

  async function createBatch() {
    if (!user || !batchName.trim()) return;
    const newBatchId = `${user.uid}_${Date.now()}`;
    await setDoc(doc(db, "batches", newBatchId), {
      name: batchName.trim(),
      tier: batchTier,
      institution: profile?.institution || "MENTIS Demo Institution",
      studentIds: [],
      counselorIds: [user.uid],
      analytics: { totalStudents: 0, avgReadiness: 0, engagementRate: 0, topCareers: [] },
      createdAt: Date.now(),
    }, { merge: true });
    await setDoc(doc(db, "counselors", user.uid), {
      profile: { displayName: profile?.displayName || user.displayName || user.email, email: user.email },
      managedBatches: arrayUnion(newBatchId),
      studentFlags: {},
    }, { merge: true });
    setStatus("Batch created. Refreshing dashboard...");
    await loadBatches();
    setBatchId(newBatchId);
  }

  return (
    <ProductShell title="Counselor Dashboard" subtitle="Batch intelligence, risk detection, and interventions.">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-mentisCard p-5">
          <select value={batchId} onChange={(event) => setBatchId(event.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText">
            {batches.length === 0 && <option>No batches assigned</option>}
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>{batch.name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Link to="/counselor/batch-overview" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">Overview</Link>
            <Link to="/counselor/analytics" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">Analytics</Link>
            <Link to="/counselor/interventions" className="rounded-lg bg-mentisPrimary px-3 py-2 text-sm font-semibold text-white">Interventions</Link>
          </div>
        </div>

        <BatchOverviewCards analytics={analytics} />

        {batches.length === 0 && (
          <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h2 className="text-lg font-semibold text-mentisText">Create your first batch</h2>
            <p className="mt-1 text-sm text-mentisTextSecondary">Counselor analytics becomes live when a batch exists.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input value={batchName} onChange={(e) => setBatchName(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText" />
              <select value={batchTier} onChange={(e) => setBatchTier(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText">
                <option value="matric">Matric</option>
                <option value="intermediate">Intermediate</option>
                <option value="degree">Degree</option>
              </select>
              <button onClick={createBatch} className="rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white">Create Batch</button>
            </div>
            {status && <p className="mt-3 text-sm text-mentisTextSecondary">{status}</p>}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <StudentRoster batchId={batchId} />
          <CounselorAiAssistant />
        </div>
      </div>
    </ProductShell>
  );
}
