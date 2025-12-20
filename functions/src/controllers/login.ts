/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Request, Response} from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import admin from "../config/firebase"; // your initialized Firebase Admin SDK
import {defineSecret} from "firebase-functions/params";

// ✅ Define secrets
export const WEB_API_KEY = defineSecret("WEB_API_KEY");
export const JWT_SECRET = defineSecret("JWT_SECRET");

const db = admin.firestore();

interface FirebaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  registered?: boolean;
}

export const loginuser = async (req: Request, res: Response): Promise<void> => {
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(400).json({error: "Email and password are required"});
    return;
  }

  try {
    const firebaseAPIKey = WEB_API_KEY.value();
    if (!firebaseAPIKey) throw new Error("Firebase API key is not defined");

    const response = await axios.post<FirebaseAuthResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseAPIKey}`,
      {email, password, returnSecureToken: true}
    );

    const idToken = response.data.idToken;

    const userSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userSnap.exists) {
      res.status(404).json({error: "User info not found in Firestore"});
      return;
    }

    const userData = userSnap.data();
    const role = userData?.role || "User";
    const userName = userData?.Name || "Unknown";
    const school = userData?.school || "Unknown";

    let coordinatorWingInfo: any = null;

    if (role === "co-ordinator") {
      const wingsQuery = await db
        .collection("Wings")
        .where("coordinatorEmail", "==", email)
        .get();

      if (!wingsQuery.empty) {
        const wingDoc = wingsQuery.docs[0];
        coordinatorWingInfo = {
          wingDocId: wingDoc.id,
          wingData: wingDoc.data(),
        };
      }
    }

    const jwtSecret = JWT_SECRET.value() || "your_jwt_secret";
    const token = jwt.sign({email, role}, jwtSecret, {expiresIn: "1h"});

    res.status(200).json({
      message: "Login successful",
      firebaseToken: idToken,
      jwtToken: token,
      name: userName,
      role,
      email,
      school,
      wingId: coordinatorWingInfo?.wingDocId || null,
      ...(coordinatorWingInfo && {coordinatorWingInfo}),
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    res.status(401).json({error: "Invalid credentials"});
  }
};
