import axios from 'axios';
import jwt from 'jsonwebtoken';
import admin from '../config/firebase'; // Firebase Admin initialized

const db = admin.firestore(); // Firestore instance

interface LoginResult {
  success: boolean;
  message?: string;
  firebaseToken?: string;
  jwtToken?: string;
  name?: string;
  role?: string;
  email?: string;
  error?: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const firebaseAPIKey = process.env.FIREBASE_API_KEY;
    const jwtSecret = process.env.JWT_SECRET;

    if (!firebaseAPIKey || !jwtSecret) {
      throw new Error('Environment variables not set');
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

    const idToken = response.data.idToken;

    // Get Firestore user info
    const snapshot = await db
      .collection('Users')
      .doc(email)
      .collection('userinfo')
      .doc('userinfo')
      .get();

    if (!snapshot.exists) {
      return { success: false, error: 'User info not found in Firestore' };
    }

    const userData = snapshot.data();
    const userName = userData?.Name || 'Unknown';
    const role = userData?.role || 'User';

    // Create JWT token
    const token = jwt.sign({ email, role }, jwtSecret, { expiresIn: '1h' });

    return {
      success: true,
      message: 'Login successful',
      firebaseToken: idToken,
      jwtToken: token,
      name: userName,
      role,
      email,
    };
  } catch (error: any) {
    console.error('Login error:', error.message);
    return { success: false, error: 'Invalid credentials' };
  }
};
