import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { getUserProfile, saveUserProfile } from "../services/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signup(email, password, displayName, role = "student") {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const normalizedRole = ["student", "parent", "counselor"].includes(role) ? role : "student";
    await saveUserProfile(cred.user.uid, {
      displayName,
      email,
      role: normalizedRole,
      profile: {
        displayName,
        email,
        role: normalizedRole,
        tier: normalizedRole === "student" ? "intermediate" : null,
      },
      readiness: 0,
      progress: 0,
      topCareerMatch: null,
      hasAssessment: false,
    });
    if (normalizedRole === "parent") {
      await setDoc(doc(db, "parents", cred.user.uid), {
        profile: { displayName, email },
        children: [],
        notifications: [],
        preferences: { alertFrequency: "weekly", reportFrequency: "monthly" },
      }, { merge: true });
    }
    if (normalizedRole === "counselor") {
      await setDoc(doc(db, "counselors", cred.user.uid), {
        profile: { displayName, email, institution: "" },
        managedBatches: [],
        studentFlags: {},
        settings: { autoFlagThreshold: 35 },
      }, { merge: true });
    }
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return { cred, profile: p };
  }

  async function updateUserRole(role) {
    if (!user && !auth.currentUser) return null;
    const currentUser = user || auth.currentUser;
    const normalizedRole = ["student", "parent", "counselor"].includes(role) ? role : "student";
    const displayName = currentUser.displayName || profile?.displayName || currentUser.email;
    const email = currentUser.email || profile?.email;

    await saveUserProfile(currentUser.uid, {
      displayName,
      email,
      role: normalizedRole,
      profile: {
        displayName,
        email,
        role: normalizedRole,
        tier: normalizedRole === "student" ? (profile?.profile?.tier || profile?.tier || "intermediate") : null,
      },
    });

    if (normalizedRole === "parent") {
      await setDoc(doc(db, "parents", currentUser.uid), {
        profile: { displayName, email },
        children: [],
        notifications: [],
        preferences: { alertFrequency: "weekly", reportFrequency: "monthly" },
      }, { merge: true });
    }

    if (normalizedRole === "counselor") {
      await setDoc(doc(db, "counselors", currentUser.uid), {
        profile: { displayName, email, institution: "" },
        managedBatches: [],
        studentFlags: {},
        settings: { autoFlagThreshold: 35 },
      }, { merge: true });
    }

    const p = await getUserProfile(currentUser.uid);
    setProfile(p);
    return p;
  }

  async function logout() {
    setProfile(null);
    return signOut(auth);
  }

  async function refreshProfile() {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  }

  function dashboardPathForRole(role = profile?.role) {
    if (role === "parent") return "/dashboard/parent";
    if (role === "counselor") return "/dashboard/counselor";
    return "/dashboard/student";
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, updateUserRole, logout, refreshProfile, dashboardPathForRole, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
