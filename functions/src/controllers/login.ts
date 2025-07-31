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

export const loginuser = async (req: Request, res: Response): Promise<void> => {
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(400).json({error: "Email and password are required"});
    return;
  }

  try {
    const firebaseAPIKey = WEB_API_KEY.value();
    const jwtSecret = JWT_SECRET.value();

    // Firebase Auth REST API login
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseAPIKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = response.data.idToken;

    // Get Firestore user info
    const snapshot = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!snapshot.exists) {
      res.status(404).json({error: "User info not found in Firestore"});
      return;
    }

    const userData = snapshot.data();
    const userName = userData?.Name || "Unknown";
    const role = userData?.role || "User";

    // Create JWT token
    const token = jwt.sign({email, role}, jwtSecret, {expiresIn: "1h"});

    res.status(200).json({
      success: true,
      message: "Login successful",
      firebaseToken: idToken,
      jwtToken: token,
      name: userName,
      role,
      email,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    res.status(401).json({error: "Invalid credentials"});
  }
};
