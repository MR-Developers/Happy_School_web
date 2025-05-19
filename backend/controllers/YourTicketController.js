const admin = require("../config/firebaseAdmin");
require("dotenv").config();
const db = admin.firestore();

const YourTicketController = async (req, res) => {
  const email = req.params.email;

  try {
    // Get user data from Users collection
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
    const school = userData.school;
    const userName = userData.Name;

    if (!school) {
      return res.status(400).json({ error: "School not found for the user" });
    }

    // Fetch all tickets for this user from their school's ticket path
    const ticketSnapshot = await db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .doc(email)
      .collection("Tickets")
      .get();

    const tickets = ticketSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ tickets });

  } catch (e) {
    console.error("Error in YourTicketController:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { YourTicketController };
