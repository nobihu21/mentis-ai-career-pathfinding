import { arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function createNotification(parentId, type, studentId, message) {
  if (!parentId || !type || !message) return null;

  const notification = {
    id: `${type}_${studentId || "general"}_${Date.now()}`,
    type,
    studentId: studentId || null,
    message,
    read: false,
    createdAt: Date.now(),
    serverCreatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, "parents", parentId), {
    notifications: arrayUnion(notification),
  });

  return notification;
}
