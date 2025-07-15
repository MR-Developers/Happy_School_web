import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import admin from '../config/firebaseAdmin'; // Firebase Admin initialized
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore(); // Firestore instance

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const firebaseAPIKey = process.env.firebaseAPIKey;
    if (!firebaseAPIKey) {
      throw new Error("Firebase API key is not defined");
    }

    // Firebase Auth REST API login
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseAPIKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = (response.data as { idToken: string }).idToken;

    // Get Firestore user info
    const snapshot = await db
      .collection('Users')
      .doc(email)
      .collection('userinfo')
      .doc('userinfo')
      .get();

    if (!snapshot.exists) {
      res.status(404).json({ error: 'User info not found in Firestore' });
      return;
    }

    const userData = snapshot.data();
    const userName = userData?.Name || 'Unknown';
    const role = userData?.role || 'User';

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign({ email, role }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      firebaseToken: idToken,
      jwtToken: token,
      name: userName,
      role,
      email,
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
