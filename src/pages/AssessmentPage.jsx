import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductShell from "../components/layout/ProductShell";
import { useAuth } from "../contexts/AuthContext";
import { saveAssessment } from "../services/firestore";

const questions = [
  {
    key: "careerInterest",
    label: "Aapki career mein sabse zyada interest kahan hai?",
    options: [
      { value: 1, label: "Product & Strategy" },
      { value: 2, label: "Design & Research" },
      { value: 3, label: "Data & Analytics" },
      { value: 4, label: "Engineering & Tech" },
      { value: 5, label: "Marketing & Growth" },
    ],
  },
  {
    key: "interests",
    label: "Apni interests ki strength ko rate karo (1-5)",
    type: "range",
    min: 1, max: 5,
  },
  {
    key: "aptitude",
    label: "Apni problem-solving ability ko rate karo (1-5)",
    type: "range",
    min: 1, max: 5,
  },
  {
    key: "values",
    label: "Apni kaam ke baare mein clarity ko rate karo (1-5)",
    type: "range",
    min: 1, max: 5,
  },
  {
    key: "timeCommitment",
    label: "Aap career switch ke liye kitna waqt de sakte hain?",
    options: [
      { value: "full", label: "Full-time (6+ hours/day)" },
      { value: "part", label: "Part-time (2-4 hours/day)" },
      { value: "minimal", label: "Minimal (weekends only)" },
    ],
  },
  {
    key: "marketPreference",
    label: "Aapka target market kya hai?",
    options: [
      { value: "global", label: "Global / Remote" },
      { value: "local", label: "Local market" },
      { value: "both", label: "Dono" },
    ],
  },
];

export default function AssessmentPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({
    interests: 3, aptitude: 3, values: 3,
    careerInterest: 1, timeCommitment: "part", marketPreference: "global",
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const q = questions[step];
  const isLast = step === questions.length - 1;

  function handleAnswer(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < questions.length - 1) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSaving(true);
    setError("");
    try {
      await saveAssessment(user.uid, answers);
      await refreshProfile();
      navigate("/results");
    } catch (e) {
      setError("Save nahi ho saka. Dobara koshish karo.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProductShell
      title="Career Diagnosis"
      subtitle="Apna profile complete karo — real data se match hoga."
    >
      <div className="mx-auto max-w-xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs text-mentisTextSecondary">
            <span>Step {step + 1} of {questions.length}</span>
            <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary transition-all"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-slate-700 bg-mentisCard p-8">
          <h2 className="text-xl font-semibold text-white">{q.label}</h2>

          <div className="mt-6">
            {q.type === "range" ? (
              <div className="space-y-4">
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  value={answers[q.key]}
                  onChange={(e) => handleAnswer(q.key, Number(e.target.value))}
                  className="w-full accent-mentisPrimary"
                />
                <div className="flex justify-between text-xs text-mentisTextSecondary">
                  <span>Weak ({q.min})</span>
                  <span className="text-2xl font-bold text-mentisSecondary">{answers[q.key]}</span>
                  <span>Strong ({q.max})</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(q.key, opt.value)}
                    className={`w-full rounded-xl border px-5 py-3 text-left text-sm transition ${
                      answers[q.key] === opt.value
                        ? "border-mentisPrimary bg-mentisPrimary/20 text-white"
                        : "border-slate-700 bg-mentisBg/50 text-mentisTextSecondary hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                onClick={back}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-mentisTextSecondary hover:text-white"
              >
                ← Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 rounded-xl bg-mentisPrimary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Save ho raha hai…" : "Results Dekho →"}
              </button>
            ) : (
              <button
                onClick={next}
                className="flex-1 rounded-xl bg-mentisPrimary px-5 py-2.5 text-sm font-semibold text-white"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
