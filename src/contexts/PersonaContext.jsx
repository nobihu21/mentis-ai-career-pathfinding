import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  const { profile } = useAuth();

  const value = useMemo(() => {
    const role = profile?.role || "student";
    return {
      role,
      isStudent: role === "student",
      isParent: role === "parent",
      isCounselor: role === "counselor",
    };
  }, [profile?.role]);

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used inside PersonaProvider");
  return ctx;
}

