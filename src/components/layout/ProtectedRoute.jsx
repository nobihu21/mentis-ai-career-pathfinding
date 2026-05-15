import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, profile, dashboardPathForRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mentisBg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mentisPrimary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    const userRole = profile?.role || "student";
    if (!allowed.includes(userRole)) {
      return <Navigate to={dashboardPathForRole(userRole)} replace />;
    }
  }

  return children;
}
