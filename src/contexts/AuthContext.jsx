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

  async function signup(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await saveUserProfile(cred.user.uid, {
      displayName,
      email,
      role: "student",
      readiness: 0,
      progress: 0,
      topCareerMatch: null,
      hasAssessment: false,
    });
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout, refreshProfile, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
