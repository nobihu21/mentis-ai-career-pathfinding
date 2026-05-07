/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mentisBg: "#0f172a",
        mentisCard: "#111827",
        mentisPrimary: "#2563eb",
        mentisSecondary: "#60a5fa",
        mentisTextPrimary: "#f8fafc",
        mentisTextSecondary: "#94a3b8",
      },
      boxShadow: {
        glow: "0 0 35px rgba(37, 99, 235, 0.35)",
      },
    },
  },
  plugins: [],
};
