import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardRedirect() {
  const { profile, dashboardPathForRole } = useAuth();
  return <Navigate to={dashboardPathForRole(profile?.role)} replace />;
}
