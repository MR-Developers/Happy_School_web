import admin from "firebase-admin";

import dotenv from "dotenv";

// Load environment variables BEFORE anything else
dotenv.config();
if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEnv) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set"
    );
  }

  // Parse the JSON string from environment variable
  const serviceAccount = JSON.parse(serviceAccountEnv);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://your-project-id.firebaseio.com", // Replace with your actual project URL
  });
}

export default admin;
