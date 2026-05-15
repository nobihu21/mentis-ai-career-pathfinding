import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PersonaProvider } from "./contexts/PersonaContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AssessmentPage from "./pages/AssessmentPage";
import CareerDetailPage from "./pages/CareerDetailPage";
import ComparisonPage from "./pages/ComparisonPage";
import DashboardRedirect from "./pages/DashboardRedirect";
import InstitutionPage from "./pages/InstitutionPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResultsPage from "./pages/ResultsPage";
import RoadmapPage from "./pages/RoadmapPage";
import TrackingPage from "./pages/TrackingPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import CounselorDashboard from "./pages/counselor/CounselorDashboard";
import InterestTracker from "./pages/student/InterestTracker";
import CareerExplorer from "./pages/student/CareerExplorer";
import StudentProfile from "./pages/student/StudentProfile";
import ChildOverview from "./pages/parent/ChildOverview";
import CareerForecast from "./pages/parent/CareerForecast";
import LearningProgress from "./pages/parent/LearningProgress";
import ParentReports from "./pages/parent/ParentReports";
import BatchOverview from "./pages/counselor/BatchOverview";
import BatchAnalytics from "./pages/counselor/BatchAnalytics";
import StudentRosterPage from "./pages/counselor/StudentRosterPage";
import InterventionTools from "./pages/counselor/InterventionTools";

function App() {
  return (
    <AuthProvider>
      <PersonaProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* v2 Persona routes (kept alongside legacy routes) */}
            <Route
              path="/dashboard/student"
              element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
            />
            <Route
              path="/student/interests"
              element={<ProtectedRoute role="student"><InterestTracker /></ProtectedRoute>}
            />
            <Route
              path="/student/careers"
              element={<ProtectedRoute role="student"><CareerExplorer /></ProtectedRoute>}
            />
            <Route
              path="/student/profile"
              element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/parent"
              element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>}
            />
            <Route
              path="/parent/child-overview"
              element={<ProtectedRoute role="parent"><ChildOverview /></ProtectedRoute>}
            />
            <Route
              path="/parent/career-forecast"
              element={<ProtectedRoute role="parent"><CareerForecast /></ProtectedRoute>}
            />
            <Route
              path="/parent/learning-progress"
              element={<ProtectedRoute role="parent"><LearningProgress /></ProtectedRoute>}
            />
            <Route
              path="/parent/reports"
              element={<ProtectedRoute role="parent"><ParentReports /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/counselor"
              element={<ProtectedRoute role="counselor"><CounselorDashboard /></ProtectedRoute>}
            />
            <Route
              path="/counselor/batch-overview"
              element={<ProtectedRoute role="counselor"><BatchOverview /></ProtectedRoute>}
            />
            <Route
              path="/counselor/roster"
              element={<ProtectedRoute role="counselor"><StudentRosterPage /></ProtectedRoute>}
            />
            <Route
              path="/counselor/analytics"
              element={<ProtectedRoute role="counselor"><BatchAnalytics /></ProtectedRoute>}
            />
            <Route
              path="/counselor/interventions"
              element={<ProtectedRoute role="counselor"><InterventionTools /></ProtectedRoute>}
            />

            {/* Legacy protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><InterestTracker /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><CareerExplorer /></ProtectedRoute>} />
            <Route path="/career/:id" element={<ProtectedRoute><CareerDetailPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/comparison" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
            <Route path="/institution" element={<ProtectedRoute><InstitutionPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PersonaProvider>
    </AuthProvider>
  );
}

export default App;
