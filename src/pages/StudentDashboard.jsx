import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductShell from "../../components/layout/ProductShell";
import RealTimeInterestHeatmap from "../../components/student/RealTimeInterestHeatmap";
import CareerRecommendationCard from "../../components/student/CareerRecommendationCard";
import StudentAiChat from "../../components/chat/StudentAiChat";
import SkillProgressTracker from "../../components/student/SkillProgressTracker";
import { getStudentProfile, getCareerMatches } from "../../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [interests, setInterests] = useState(null);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const profileData = await getStudentProfile(user.uid);
        const careersData = await getCareerMatches(user.uid);
        
        setProfile(profileData.profile);
        setInterests(profileData.interestProfile);
        setCareers(careersData.careers || []);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) return <div className="text-center py-20">Loading your dashboard...</div>;

  return (
    <ProductShell 
      title={`Welcome, ${profile?.displayName}! 👋`} 
      subtitle="Your personalized career journey, powered by real-time AI"
    >
      <div className="grid gap-6 mb-8">
        
        {/* Interest Heatmap - Real-time visualization */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Interest Profile</h2>
          {interests && <RealTimeInterestHeatmap domains={interests.domains} />}
        </div>

        {/* Top 3 Career Recommendations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Top Career Matches</h2>
            <span className="text-sm text-slate-400">Real-time powered by AI</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {careers.slice(0, 3).map((career) => (
              <CareerRecommendationCard 
                key={career.id} 
                career={career}
                onSelect={(id) => navigate(`/career/${id}`)}
              />
            ))}
          </div>
        </div>

        {/* Skill Progress */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Skills Progress</h2>
          <SkillProgressTracker 
            interests={interests?.domains || {}} 
            tier={profile?.tier}
          />
        </div>

        {/* AI Mentor Chat */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Ask Your AI Mentor</h2>
          <StudentAiChat 
            careerGoal={careers[0]?.id}
            tier={profile?.tier}
            interests={interests?.topDomains || []}
          />
        </div>

        {/* Learning Path Preview */}
        {careers.length > 0 && (
          <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Next Steps for {careers[0]?.careerName}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-sm font-medium text-white">Learn fundamentals (4 weeks)</p>
                  <p className="text-xs text-slate-400">Build core knowledge and skills</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💪</span>
                <div>
                  <p className="text-sm font-medium text-white">Practice & build projects (6 weeks)</p>
                  <p className="text-xs text-slate-400">Real-world applications and challenges</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-medium text-white">Mock exams & final prep (2 weeks)</p>
                  <p className="text-xs text-slate-400">Assess and refine your skills</p>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full px-4 py-2 bg-mentisPrimary text-white rounded-lg hover:bg-blue-700 transition">
              View Detailed Roadmap →
            </button>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
