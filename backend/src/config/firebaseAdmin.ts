import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json'; // Adjust the path as needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    // Optionally include databaseURL if you're using Realtime DB
    databaseURL: 'https://your-project-id.firebaseio.com',
  });
}

export default admin;
