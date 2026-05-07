import { Link, NavLink, useNavigate } from "react-router-dom";
import VisualModeToggle from "../modes/VisualModeToggle";
import { useAuth } from "../../contexts/AuthContext";

const nav = [
  { to: "/dashboard",  label: "Dashboard" },
  { to: "/assessment", label: "Diagnose" },
  { to: "/results",    label: "Match" },
  { to: "/career/product-manager", label: "Validate" },
  { to: "/roadmap",    label: "Act" },
  { to: "/tracking",   label: "Track" },
  { to: "/comparison", label: "Compare" },
  { to: "/institution",label: "Institution" },
];

export default function ProductShell({ children, title, subtitle }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[250px_1fr] md:px-6">
        <aside className="rounded-2xl border border-slate-700 bg-mentisCard/80 p-4 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:overflow-y-auto">
          <Link to="/" className="mb-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-mentisPrimary to-mentisSecondary shadow-glow" />
            <span className="font-semibold">MENTIS</span>
          </Link>

          {/* User info */}
          {user && (
            <div className="mb-4 rounded-xl border border-slate-700 bg-mentisBg/60 px-3 py-2">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.displayName || user.displayName || user.email}
              </p>
              <p className="text-xs text-mentisTextSecondary capitalize">
                {profile?.role || "student"}
                {profile?.readiness ? ` · ${profile.readiness}% ready` : ""}
              </p>
            </div>
          )}

          <div className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-mentisPrimary/20 text-white" : "text-mentisTextSecondary hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm text-mentisTextSecondary hover:border-red-500/50 hover:text-red-400 transition"
          >
            Sign Out
          </button>
        </aside>

        <div>
          <div className="mb-6 rounded-2xl border border-slate-700 bg-mentisCard/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-mentisTextPrimary">{title}</h1>
                <p className="mt-1 text-sm text-mentisTextSecondary">{subtitle}</p>
              </div>
              <VisualModeToggle />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
