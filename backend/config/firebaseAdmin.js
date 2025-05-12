const admin = require('firebase-admin');
const serviceAccount = require("../serviceAccountKey.json"); // adjust path if needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com', // optional if not using Realtime DB
  });
}

module.exports = admin;
