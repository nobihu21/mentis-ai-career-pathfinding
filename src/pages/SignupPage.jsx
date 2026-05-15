import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SignupPage() {
  const { signup, dashboardPathForRole } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      await signup(email, password, name, role);
      navigate(dashboardPathForRole(role), { replace: true });
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
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
        <h1 className="text-2xl font-bold text-mentisText">Create account</h1>
        <p className="mt-1 text-sm text-mentisTextSecondary">Start your career pathfinding journey.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-mentisTextSecondary">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-mentisBg px-4 py-2.5 text-sm text-mentisText placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
              placeholder="Jane Smith"
            />
          </div>
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
            <label className="mb-2 block text-sm text-mentisTextSecondary">I am joining as</label>
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
          <div>
            <label className="mb-1 block text-sm text-mentisTextSecondary">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-mentisBg px-4 py-2.5 text-sm text-mentisText placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-mentisTextSecondary">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-mentisBg px-4 py-2.5 text-sm text-mentisText placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-mentisPrimary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-mentisTextSecondary">
          Already have an account?{" "}
          <Link to="/login" className="text-mentisSecondary hover:text-mentisText">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
