import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login, updateUserRole, dashboardPathForRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const updatedProfile = await updateUserRole(role);
      navigate(dashboardPathForRole(updatedProfile?.role || role), { replace: true });
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
          ? "Invalid email or password."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mentisBg px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-mentisCard p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-mentisPrimary to-mentisSecondary shadow-glow" />
          <span className="text-xl font-semibold text-mentisText">MENTIS</span>
        </div>
        <h1 className="text-2xl font-bold text-mentisText">Sign in</h1>
        <p className="mt-1 text-sm text-mentisTextSecondary">Welcome back to your career pathfinding hub.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-mentisTextSecondary">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-mentisBg px-4 py-2.5 text-sm text-mentisText placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-mentisTextSecondary">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-mentisBg px-4 py-2.5 text-sm text-mentisText placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-mentisTextSecondary">Continue as</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["student", "Student"],
                ["parent", "Parent"],
                ["counselor", "Counselor"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    role === value
                      ? "border-mentisPrimary bg-mentisPrimary/20 text-mentisText"
                      : "border-slate-700 bg-mentisBg text-mentisTextSecondary hover:text-mentisText"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-mentisPrimary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-mentisTextSecondary">
          Don't have an account?{" "}
          <Link to="/signup" className="text-mentisSecondary hover:text-mentisText">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
