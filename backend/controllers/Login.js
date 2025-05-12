const axios = require("axios");
const jwt = require("jsonwebtoken");
const admin = require('../config/firebaseAdmin');  // Assumes Firebase Admin SDK is initialized
const db = admin.firestore(); // Get Firestore instance
require("dotenv").config(); 

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const firebaseAPIKey = process.env.firebaseAPIKey; // Keep this in .env for security
console.log(firebaseAPIKey);
    // Sign in using Firebase Auth REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseAPIKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = response.data.idToken;

    // Fetch additional user data from Firestore
    const snapshot = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "User info not found in Firestore" });
    }

    const userData = snapshot.data();
    const userName = userData.Name;
    const role = userData.role;

    // Generate your own JWT token
    const token = jwt.sign(
      { email, role },
      process.env.JWT_SECRET || "your_jwt_secret", // Replace with env var
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      firebaseToken: idToken,
      jwtToken: token,
      name: userName,
      role: role,
      email:email,
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

module.exports = { loginUser };
