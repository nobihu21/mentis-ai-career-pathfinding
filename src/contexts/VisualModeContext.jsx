import { createContext, useContext, useEffect, useMemo, useState } from "react";

const VisualModeContext = createContext(null);

const modeClasses = {
  classic: "mode-classic",
  dimensional: "mode-dimensional",
  immersive: "mode-immersive"
};

export function VisualModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("mentis-visual-mode") || "classic");

  useEffect(() => {
    localStorage.setItem("mentis-visual-mode", mode);
    document.body.classList.remove("mode-classic", "mode-dimensional", "mode-immersive");
    document.body.classList.add(modeClasses[mode]);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <VisualModeContext.Provider value={value}>{children}</VisualModeContext.Provider>;
}

export function useVisualMode() {
  const ctx = useContext(VisualModeContext);
  if (!ctx) {
    throw new Error("useVisualMode must be used inside VisualModeProvider");
  }
  return ctx;
}
