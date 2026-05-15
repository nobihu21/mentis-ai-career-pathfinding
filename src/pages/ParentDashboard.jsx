import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductShell from "../../components/layout/ProductShell";
import ChildOverviewCard from "../../components/parent/ChildOverviewCard";
import ParentInterestHeatmap from "../../components/parent/ParentInterestHeatmap";
import CareerForecastCard from "../../components/parent/CareerForecastCard";
import ParentAiChat from "../../components/parent/ParentAiChat";
import AlertCenter from "../../components/parent/AlertCenter";
import { getParentChildren, getChildOverview } from "../../services/api";

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchChildren = async () => {
      try {
        const data = await getParentChildren(user.uid);
        setChildren(data.children || []);
        if (data.children && data.children.length > 0) {
          setSelectedChild(data.children[0].studentId);
        }
      } catch (err) {
        console.error("Error fetching children:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user, navigate]);

  useEffect(() => {
    if (!selectedChild) return;

    const fetchChildData = async () => {
      try {
        const data = await getChildOverview(selectedChild, user.uid);
        setChildData(data);
      } catch (err) {
        console.error("Error fetching child data:", err);
      }
    };

    fetchChildData();
  }, [selectedChild, user]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <ProductShell 
      title="Your Child's Career Journey" 
      subtitle="Monitor progress, understand potential, and support growth"
    >
      <div className="grid gap-6 mb-8">
        
        {/* Child Selector */}
        {children.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-mentisCard rounded-lg border border-slate-700">
            {children.map((child) => (
              <button
                key={child.studentId}
                onClick={() => setSelectedChild(child.studentId)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedChild === child.studentId
                    ? "bg-mentisPrimary text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Child Overview Cards */}
        {childData && (
          <>
            <ChildOverviewCard childData={childData.overview} />

            {/* Interest Heatmap */}
            <div className="grid gap-4 md:grid-cols-2">
              <ParentInterestHeatmap childId={selectedChild} />
              
              {/* Quick Stats */}
              <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Last Activity</p>
                    <p className="text-lg font-semibold text-white">2 hours ago</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Focus Areas</p>
                    <p className="text-sm text-white mt-2">
                      {children.find(c => c.studentId === selectedChild)?.interests?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Tier</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {children.find(c => c.studentId === selectedChild)?.tier}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Forecast */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Career Forecast (Next 12 Months)</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((idx) => (
                  <CareerForecastCard 
                    key={idx} 
                    childId={selectedChild}
                    rank={idx}
                  />
                ))}
              </div>
            </div>

            {/* Learning Progress */}
            <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Learning Progress This Week</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white">Milestones Completed</span>
                    <span className="text-sm font-semibold text-green-400">5/8</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "62.5%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white">Study Time</span>
                    <span className="text-sm font-semibold text-blue-400">12.5 hours</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "70%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <AlertCenter childId={selectedChild} parentId={user.uid} />

            {/* Parent-AI Chat */}
            <ParentAiChat childId={selectedChild} />

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 rounded-lg bg-mentisPrimary text-white hover:bg-blue-700 transition">
                Download Progress Report (PDF)
              </button>
              <button className="px-6 py-3 rounded-lg border border-slate-700 text-white hover:border-slate-600 transition">
                Message Counselor
              </button>
            </div>
          </>
        )}
      </div>
    </ProductShell>
  );
}
