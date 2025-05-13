const axios = require("axios");
const admin = require("../config/firebaseAdmin");
require("dotenv").config(); // Ensure environment variables are loaded

const db = admin.firestore();

const TicketController = async (req, res) => {
  const email = req.params.email;

  try {
    // 1) Get the requesting user's school
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userInfoSnap.exists) {
      return res.status(404).json({ error: "User info not found in Firestore" });
    }

    const { school } = userInfoSnap.data();
    if (!school) {
      console.error("school not found");
      return res.status(404).json({ error: "school not found" });
    }

    // 2) Query only tickets that belong to the same school
    const ticketsQuerySnap = await db
      .collection("UserTickets")
      .where("school", "==", school)
      .get();

    // 3) Map over matching tickets
    const tickets = ticketsQuerySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      message: "Tickets fetched successfully",
      ticketCount: tickets.length,
      tickets,
    });
  } catch (e) {
    console.error("Error in TicketController:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { TicketController };
