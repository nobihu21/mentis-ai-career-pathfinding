import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import ChildOverviewCard from "../../components/parent/ChildOverviewCard";
import InterestHeatmap from "../../components/student/InterestHeatmap";
import { getChildInterestHeatmap, getChildOverview, getParentChildren } from "../../services/api";

export default function ChildOverview() {
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState("");
  const [overview, setOverview] = useState(null);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    getParentChildren().then((data) => {
      const list = data?.children || [];
      setChildren(list);
      setChildId(list[0]?.studentId || "");
    }).catch(() => setChildren([]));
  }, []);

  useEffect(() => {
    if (!childId) return;
    getChildOverview(childId).then((data) => setOverview(data?.overview || null)).catch(() => setOverview(null));
    getChildInterestHeatmap(childId).then((data) => {
      setDomains(Object.entries(data?.domains || {}).map(([name, score]) => ({ name, score, trend: "stable" })));
    }).catch(() => setDomains([]));
  }, [childId]);

  return (
    <ProductShell title="Child Overview" subtitle="Deep-dive into live learning and interest signals.">
      <div className="mb-6">
        <select value={childId} onChange={(e) => setChildId(e.target.value)} className="rounded-lg border border-slate-700 bg-mentisCard px-3 py-2 text-sm text-mentisText">
          {children.map((child) => <option key={child.studentId} value={child.studentId}>{child.name || child.studentId}</option>)}
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChildOverviewCard childData={overview} />
        <InterestHeatmap domains={domains} />
      </div>
    </ProductShell>
  );
}
