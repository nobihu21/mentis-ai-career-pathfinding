import { useEffect, useState } from "react";
import ProductShell from "../components/layout/ProductShell";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardStats, getJournalEntries, addJournalEntry } from "../services/firestore";
import MetricBar from "../components/ui/MetricBar";

export default function TrackingPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [journal, setJournal] = useState([]);
  const [note, setNote]       = useState("");
  const [event, setEvent]     = useState("milestone");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDashboardStats(user.uid),
      getJournalEntries(user.uid),
    ]).then(([s, j]) => {
      setStats(s);
      setJournal(j);
      setLoading(false);
    });
  }, [user]);

  async function handleAddNote() {
    if (!note.trim()) return;
    setSaving(true);
    await addJournalEntry(user.uid, event, note);
    const updated = await getJournalEntries(user.uid);
    setJournal(updated);
    setNote("");
    setSaving(false);
  }

  return (
    <ProductShell
      title="Progress Tracking"
      subtitle="Track layer: real-time readiness trend and decision journal."
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Stats */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
              <h3 className="text-lg font-semibold">Readiness Metrics</h3>
              <div className="mt-5 space-y-4">
                <MetricBar label="Overall Readiness"  value={stats?.readiness  ?? 0} />
                <MetricBar label="Roadmap Progress"   value={stats?.progress   ?? 0} />
                <MetricBar label="Interests Score"    value={stats?.interests  ?? 0} />
                <MetricBar label="Aptitude Score"     value={stats?.aptitude   ?? 0} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
              <h3 className="text-lg font-semibold">Task Summary</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-mentisBg/70 p-4">
                  <p className="text-3xl font-bold text-mentisSecondary">{stats?.completedTasks ?? 0}</p>
                  <p className="text-xs text-mentisTextSecondary">Tasks Completed</p>
                </div>
                <div className="rounded-xl bg-mentisBg/70 p-4">
                  <p className="text-3xl font-bold text-white">{stats?.totalTasks ?? 0}</p>
                  <p className="text-xs text-mentisTextSecondary">Total Tasks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Decision Journal */}
          <div className="rounded-2xl border border-slate-700 bg-mentisCard p-6">
            <h3 className="text-lg font-semibold">Decision Journal</h3>
            <p className="mt-1 text-xs text-mentisTextSecondary">Apne career milestones aur thoughts record karo.</p>

            <div className="mt-4 space-y-3">
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-white focus:border-mentisPrimary focus:outline-none"
              >
                <option value="milestone">🏆 Milestone</option>
                <option value="insight">💡 Insight</option>
                <option value="challenge">⚠ Challenge</option>
                <option value="action">✅ Action Taken</option>
              </select>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Aaj kya hua? Koi decision liya? Kuch seekha?"
                className="w-full resize-none rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
              />
              <button
                onClick={handleAddNote}
                disabled={saving || !note.trim()}
                className="w-full rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {saving ? "Saving…" : "Note Add Karo"}
              </button>
            </div>

            <div className="mt-5 max-h-64 space-y-3 overflow-y-auto">
              {journal.length === 0 ? (
                <p className="text-center text-sm text-mentisTextSecondary">Abhi koi note nahi. Pehla note add karo!</p>
              ) : (
                journal.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-700 bg-mentisBg/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-mentisSecondary capitalize">{entry.event}</span>
                      <span className="text-xs text-mentisTextSecondary">{entry.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-white">{entry.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </ProductShell>
  );
}
