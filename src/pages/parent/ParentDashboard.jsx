import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import ProductShell from "../../components/layout/ProductShell";
import ChildOverviewCard from "../../components/parent/ChildOverviewCard";
import ParentAiChat from "../../components/parent/ParentAiChat";
import { getParentChildren, getParentNotifications } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";

export default function ParentDashboard() {
  const { user, profile } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [childUid, setChildUid] = useState("");
  const [status, setStatus] = useState("");

  async function loadParentData() {
    getParentChildren()
      .then((data) => {
        const list = data?.children || [];
        setChildren(list);
        setSelectedChild(list[0] || null);
      })
      .catch(() => setChildren([]));

    getParentNotifications()
      .then((data) => setNotifications(data?.notifications || []))
      .catch(() => setNotifications([]));
  }

  useEffect(() => {
    loadParentData();
  }, []);

  async function linkChild() {
    if (!user || !childUid.trim()) return;
    setStatus("");
    await setDoc(doc(db, "parents", user.uid), {
      profile: {
        displayName: profile?.displayName || user.displayName || user.email,
        email: user.email,
      },
      children: arrayUnion(childUid.trim()),
    }, { merge: true });
    setChildUid("");
    setStatus("Child linked. Refreshing live dashboard...");
    await loadParentData();
  }

  return (
    <ProductShell title="Parent Dashboard" subtitle="Real-time child monitoring and career forecasts.">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-mentisCard p-5">
          <select
            value={selectedChild?.studentId || ""}
            onChange={(event) => setSelectedChild(children.find((child) => child.studentId === event.target.value) || null)}
            className="rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText"
          >
            {children.length === 0 && <option>No linked children</option>}
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId}>{child.name || child.studentId}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Link to="/parent/child-overview" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">Overview</Link>
            <Link to="/parent/career-forecast" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-mentisTextSecondary hover:text-mentisText">Forecast</Link>
            <Link to="/parent/reports" className="rounded-lg bg-mentisPrimary px-3 py-2 text-sm font-semibold text-white">Reports</Link>
          </div>
        </div>

        {children.length === 0 && (
          <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h2 className="text-lg font-semibold text-mentisText">Link a child account</h2>
            <p className="mt-1 text-sm text-mentisTextSecondary">Paste the student's Firebase UID to connect live interest, roadmap, and career data.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={childUid}
                onChange={(event) => setChildUid(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText"
                placeholder="Student UID"
              />
              <button onClick={linkChild} className="rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white">Link Child</button>
            </div>
            {status && <p className="mt-3 text-sm text-mentisTextSecondary">{status}</p>}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <ChildOverviewCard childData={selectedChild} />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
                <p className="text-sm text-mentisTextSecondary">Learning health</p>
                <p className="mt-2 text-3xl font-bold text-mentisSecondary">{selectedChild?.readiness || 0}%</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
                <p className="text-sm text-mentisTextSecondary">Top interests</p>
                <p className="mt-2 text-sm font-semibold text-mentisText">{(selectedChild?.interests || []).join(", ") || "Collecting signals"}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-mentisCard p-5">
                <p className="text-sm text-mentisTextSecondary">Alerts</p>
                <p className="mt-2 text-3xl font-bold text-mentisText">{notifications.length}</p>
              </div>
            </div>
          </div>
          <ParentAiChat childId={selectedChild?.studentId} />
        </div>
      </div>
    </ProductShell>
  );
}
