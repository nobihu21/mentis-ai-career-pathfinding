import { useState } from "react";
import ProductShell from "../../components/layout/ProductShell";
import { useAuth } from "../../contexts/AuthContext";
import { updateStudentProfile } from "../../services/api";

export default function StudentProfile() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    tier: profile?.tier || "intermediate",
    learningStyle: profile?.learningStyle || "visual",
    customCareerChoice: profile?.customCareerChoice || "",
  });
  const [status, setStatus] = useState("");

  async function save() {
    setStatus("Saving...");
    await updateStudentProfile(form);
    await refreshProfile();
    setStatus("Profile updated.");
  }

  return (
    <ProductShell title="Student Profile" subtitle="Personalization settings for real-time guidance.">
      <div className="max-w-2xl rounded-2xl border border-slate-700 bg-mentisCard p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm text-mentisTextSecondary">Tier</span>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-mentisText">
              <option value="matric">Matric</option>
              <option value="intermediate">Intermediate</option>
              <option value="degree">Degree</option>
            </select>
          </label>
          <label>
            <span className="text-sm text-mentisTextSecondary">Learning style</span>
            <select value={form.learningStyle} onChange={(e) => setForm({ ...form, learningStyle: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-mentisText">
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm text-mentisTextSecondary">Career goal</span>
          <input
            value={form.customCareerChoice}
            onChange={(e) => setForm({ ...form, customCareerChoice: e.target.value })}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-mentisText"
            placeholder="Example: CSS Officer, Software Engineer"
          />
        </label>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} className="rounded-xl bg-mentisPrimary px-5 py-2.5 text-sm font-semibold text-white hover:bg-mentisSecondary">
            Save Profile
          </button>
          {status && <span className="text-sm text-mentisTextSecondary">{status}</span>}
        </div>
      </div>
    </ProductShell>
  );
}
