import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductShell from "../../components/layout/ProductShell";
import BatchOverviewCards from "../../components/counselor/BatchOverviewCards";
import StudentRoster from "../../components/counselor/StudentRoster";
import BatchAnalyticsCharts from "../../components/counselor/BatchAnalyticsCharts";
import InterventionTools from "../../components/counselor/InterventionTools";
import CounselorAiAssistant from "../../components/counselor/CounselorAiAssistant";
import { getCounselorBatches, getBatchOverview } from "../../services/api";

export default function CounselorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchOverview, setBatchOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBatches = async () => {
      try {
        const data = await getCounselorBatches(user.uid);
        setBatches(data.batches || []);
        if (data.batches && data.batches.length > 0) {
          setSelectedBatch(data.batches[0].batchId);
        }
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [user, navigate]);

  useEffect(() => {
    if (!selectedBatch) return;

    const fetchBatchOverview = async () => {
      try {
        const data = await getBatchOverview(selectedBatch, user.uid);
        setBatchOverview(data);
      } catch (err) {
        console.error("Error fetching batch overview:", err);
      }
    };

    fetchBatchOverview();
  }, [selectedBatch, user]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <ProductShell 
      title="Batch Intelligence Hub" 
      subtitle="Data-driven insights and interventions for your students"
    >
      <div className="grid gap-6 mb-8">
        
        {/* Batch Selector & Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-mentisCard rounded-lg border border-slate-700">
          <select
            value={selectedBatch || ""}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-mentisPrimary transition"
          >
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {batch.name} ({batch.studentCount} students)
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition">
              📊 Analytics
            </button>
            <button className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition">
              📥 Import
            </button>
            <button className="px-4 py-2 rounded-lg bg-mentisPrimary text-white hover:bg-blue-700 transition">
              ↓ Export Report
            </button>
          </div>
        </div>

        {/* Batch Overview Stats */}
        {batchOverview && (
          <BatchOverviewCards analytics={batchOverview.analytics} />
        )}

        {/* Two-Column Layout: Analytics + Student Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Analytics (spans 2 columns) */}
          <div className="lg:col-span-2">
            <BatchAnalyticsCharts batchId={selectedBatch} />
          </div>

          {/* Right: Quick Insights */}
          <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Top Career</p>
                <p className="text-lg font-semibold text-white mt-1">CSS Officer</p>
                <p className="text-xs text-slate-500">28 students trending</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Engagement</p>
                <p className="text-lg font-semibold text-green-400 mt-1">82%</p>
                <p className="text-xs text-slate-500">Active users</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">At Risk</p>
                <p className="text-lg font-semibold text-amber-400 mt-1">12 students</p>
                <p className="text-xs text-slate-500">Need intervention</p>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition font-medium">
                View At-Risk List →
              </button>
            </div>
          </div>
        </div>

        {/* Student Roster */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Student Roster</h2>
          <StudentRoster batchId={selectedBatch} counselorId={user.uid} />
        </div>

        {/* Intervention Tools */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Intervention Tools</h2>
          <InterventionTools batchId={selectedBatch} counselorId={user.uid} />
        </div>

        {/* Counselor-AI Assistant */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">AI Batch Assistant</h2>
          <CounselorAiAssistant batchId={selectedBatch} counselorId={user.uid} />
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-4 justify-center pt-4 border-t border-slate-700">
          <button className="px-6 py-3 rounded-lg bg-mentisPrimary text-white hover:bg-blue-700 transition">
            🗂️ Manage Batch Settings
          </button>
          <button className="px-6 py-3 rounded-lg border border-slate-700 text-white hover:border-slate-600 transition">
            📋 Attendance Report
          </button>
          <button className="px-6 py-3 rounded-lg border border-slate-700 text-white hover:border-slate-600 transition">
            👥 Add Student
          </button>
        </div>
      </div>
    </ProductShell>
  );
}
