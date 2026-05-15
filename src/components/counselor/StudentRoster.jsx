import React from "react";
import { getBatchStudents } from "../../services/api";

export default function StudentRoster({ batchId }) {
  const [students, setStudents] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState({});

  React.useEffect(() => {
    if (!batchId) return;
    getBatchStudents(batchId, { ...filters, page })
      .then((data) => {
        setStudents(data?.students || []);
      })
      .catch((e) => console.error("Roster fetch error:", e));
  }, [batchId, filters, page]);

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <div className="flex gap-2 mb-6">
        <select
          onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
          className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm"
        >
          <option value="">All Tiers</option>
          <option value="matric">Matric</option>
          <option value="intermediate">Intermediate</option>
          <option value="degree">Degree</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div
            key={student.studentId}
            className="rounded-lg border border-slate-700 bg-slate-800 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-white">{student.name}</h4>
                <p className="text-xs text-slate-400">{student.tier}</p>
              </div>
              {student.riskFlag && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                  {String(student.riskFlag.severity || "").toUpperCase()}
                </span>
              )}
            </div>

            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-1">Interests</p>
              <div className="flex flex-wrap gap-1">
                {(student.interests || []).slice(0, 2).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg font-bold text-mentisPrimary mb-3">
              {student.readiness}%
            </p>

            <div className="flex gap-2">
              <button className="flex-1 px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-600">
                📧
              </button>
              <button className="flex-1 px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-600">
                🚩
              </button>
              <button className="flex-1 px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-600">
                →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 rounded bg-slate-700"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-white">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

