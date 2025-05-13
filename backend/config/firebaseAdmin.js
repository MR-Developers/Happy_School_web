const admin = require('firebase-admin');
require("dotenv").config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com', // optional if not using Realtime DB
  });
}

module.exports = admin;
