import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import ProductShell from "../../components/layout/ProductShell";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { getCareerMatches, validateCustomCareer } from "../../services/api";
import { scoreCareersForStudent } from "../../services/careerRecommender";

export default function CareerExplorer() {
  const { user, profile } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [apiCareers, setApiCareers] = useState([]);
  const [tier, setTier] = useState(profile?.tier || "intermediate");
  const [validation, setValidation] = useState(null);
  const [selectedCareerId, setSelectedCareerId] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, "users", user.uid), (snap) => setUserDoc(snap.exists() ? snap.data() : null));
  }, [user]);

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_BACKEND_RECOMMENDATIONS === "true") {
      getCareerMatches().then((data) => setApiCareers(data?.careers || [])).catch(() => setApiCareers([]));
    }
  }, []);

  const careers = useMemo(() => {
    if (apiCareers.length > 0) return apiCareers;
    return scoreCareersForStudent(userDoc?.interestProfile || {}, tier);
  }, [apiCareers, userDoc, tier]);

  async function validate(careerId) {
    setSelectedCareerId(careerId);
    const career = careers.find((item) => (item.id || item.careerId || item.careerName) === careerId);
    if (import.meta.env.VITE_ENABLE_BACKEND_RECOMMENDATIONS === "true") {
      const result = await validateCustomCareer(careerId);
      setValidation(result);
    } else {
      setValidation({
        careerId,
        careerName: career?.careerName || career?.title || careerId,
        validationScore: career?.suitabilityScore || 55,
        isApproved: (career?.suitabilityScore || 0) >= 60,
        feedback: `Recommended route: start with ${(career?.skillGaps || ["core foundations"])[0]}, then complete a portfolio task for ${career?.careerName || careerId}.`,
        skillGaps: career?.skillGaps || [],
        marketData: career?.marketData || {},
      });
    }

    if (user && career) {
      await setDoc(doc(db, "users", user.uid), {
        customCareerChoice: {
          careerId,
          careerName: career.careerName || career.title || careerId,
          validationScore: career.suitabilityScore || 55,
          isApproved: (career.suitabilityScore || 0) >= 60,
          selectedAt: Date.now(),
        },
      }, { merge: true });
    }
  }

  return (
    <ProductShell title="Career Explorer" subtitle="Browse careers with personalized suitability scores.">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value)}
          className="rounded-lg border border-slate-700 bg-mentisCard px-3 py-2 text-sm text-mentisText"
        >
          <option value="matric">Matric</option>
          <option value="intermediate">Intermediate</option>
          <option value="degree">Degree</option>
        </select>
      </div>

      {validation && (
        <div className="mb-6 rounded-2xl border border-mentisSecondary/40 bg-mentisCard p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-mentisTextSecondary">Career validation</p>
              <h2 className="mt-1 text-xl font-semibold text-mentisText">{validation.careerName || validation.careerId}</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${validation.isApproved ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"}`}>
              {validation.validationScore}% {validation.isApproved ? "approved" : "needs evidence"}
            </span>
          </div>
          <p className="mt-4 text-sm text-mentisTextSecondary">{validation.feedback || "Validation saved to your profile and roadmap context."}</p>
          {(validation.skillGaps || []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {validation.skillGaps.slice(0, 4).map((gap) => (
                <span key={gap} className="rounded-full bg-mentisBg px-3 py-1 text-xs text-mentisTextSecondary">{gap}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {careers.map((career) => {
          const id = career.id || career.careerId || career.careerName;
          const score = career.suitabilityScore ?? career.score ?? 0;
          return (
            <article key={id} className={`rounded-2xl border bg-mentisCard p-6 ${selectedCareerId === id ? "border-mentisSecondary" : "border-slate-700"}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-mentisText">{career.careerName || career.title}</h2>
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-300">
                  {score}% fit
                </span>
              </div>
              <p className="mt-3 text-sm text-mentisTextSecondary">
                {(career.reasoning || career.rationale || ["Matched against live interest profile"])[0]}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-mentisBg/70 p-3">
                  <p className="text-mentisTextSecondary">Demand</p>
                  <p className="font-semibold text-mentisText">{career.marketData?.demand || career.market?.demand || "Medium"}</p>
                </div>
                <div className="rounded-lg bg-mentisBg/70 p-3">
                  <p className="text-mentisTextSecondary">Readiness</p>
                  <p className="font-semibold text-mentisText">{career.timeToReadiness || "6-9 months"}</p>
                </div>
              </div>
              <button
                onClick={() => validate(id)}
                className="mt-5 w-full rounded-lg bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white hover:bg-mentisSecondary"
              >
                Validate Career
              </button>
            </article>
          );
        })}
      </div>
    </ProductShell>
  );
}
