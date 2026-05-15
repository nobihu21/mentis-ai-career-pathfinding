/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mentisBg: "#0f172a",
        mentisCard: "#1e293b",
        mentisPrimary: "#6366f1",
        mentisSecondary: "#06b6d4",
        // Preferred v2 token names (keep older aliases below for compatibility)
        mentisText: "#f1f5f9",
        mentisTextSecondary: "#94a3b8",
        // Back-compat aliases (do not remove; used across existing UI)
        mentisTextPrimary: "#f1f5f9",
        // Status colors
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      boxShadow: {
        glow: "0 0 35px rgba(99, 102, 241, 0.35)",
      },
    },
  },
  plugins: [],
};
