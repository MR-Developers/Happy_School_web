// src/config/firebase.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp(); // Uses default service account in Firebase Functions
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
