import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import { flagStudent, getBatchStudents, getCounselorBatches, sendBulkMessage } from "../../services/api";

export default function InterventionToolsPage() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    getCounselorBatches().then((data) => {
      const list = data?.batches || [];
      setBatches(list);
      setBatchId(list[0]?.batchId || "");
    }).catch(() => setBatches([]));
  }, []);

  useEffect(() => {
    if (!batchId) return;
    getBatchStudents(batchId).then((data) => {
      const list = data?.students || [];
      setStudents(list);
      setSelectedStudent(list[0]?.studentId || "");
    }).catch(() => setStudents([]));
  }, [batchId]);

  async function createFlag() {
    await flagStudent(selectedStudent, "medium", "low-engagement", "Student needs a guided intervention.", ["Schedule check-in", "Assign small weekly task"]);
    setStatus("Student flagged.");
  }

  async function messageAll() {
    await sendBulkMessage(students.map((student) => student.studentId), "Weekly guidance", "Please review your recommended next action this week.");
    setStatus("Bulk message sent.");
  }

  return (
    <ProductShell title="Intervention Tools" subtitle="Flag risk, send messages, and trigger counselor action.">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <h2 className="text-lg font-semibold text-mentisText">Flag student</h2>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mt-4 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText">
            {batches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{batch.name}</option>)}
          </select>
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText">
            {students.map((student) => <option key={student.studentId} value={student.studentId}>{student.name}</option>)}
          </select>
          <button onClick={createFlag} disabled={!selectedStudent} className="mt-4 rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create Risk Flag</button>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
          <h2 className="text-lg font-semibold text-mentisText">Bulk message</h2>
          <p className="mt-2 text-sm text-mentisTextSecondary">Send a guidance message to the current filtered cohort.</p>
          <button onClick={messageAll} disabled={students.length === 0} className="mt-4 rounded-lg bg-mentisSecondary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Send to Batch</button>
        </div>
      </div>
      {status && <p className="mt-4 text-sm text-mentisTextSecondary">{status}</p>}
    </ProductShell>
  );
}
