import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AssessmentPage from "./pages/AssessmentPage";
import CareerDetailPage from "./pages/CareerDetailPage";
import ComparisonPage from "./pages/ComparisonPage";
import DashboardPage from "./pages/DashboardPage";
import InstitutionPage from "./pages/InstitutionPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResultsPage from "./pages/ResultsPage";
import RoadmapPage from "./pages/RoadmapPage";
import TrackingPage from "./pages/TrackingPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes - require auth */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/career/:id" element={<ProtectedRoute><CareerDetailPage /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/comparison" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          <Route path="/institution" element={<ProtectedRoute><InstitutionPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
