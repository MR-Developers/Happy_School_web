const admin = require("../config/firebaseAdmin");
require("dotenv").config();
const db = admin.firestore();

const RaiseTicketController = async (req, res) => {
  const email = req.params.email;
  const { ticketText } = req.body;

  try {
    // Fetch user info
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

    const timestamp = new Date();
    const formattedTimestamp = timestamp.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Generate a new document ID (UID)
    const ticketRef = db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .doc(email)
      .collection("Tickets")
      .doc(); // don't call .set() yet — just use this to get a unique ID

    const uid = ticketRef.id;

    // Ticket data
    const ticketData = {
      ticketText: ticketText || "",
      userName: userName || "",
      email: email,
      timestamp: formattedTimestamp,
      reply: "",
      status: "Ticket Raised",
      tocken: 0,
      uid: uid,
      school: school,
    };

    // Add ticket to Firestore using generated uid
    await ticketRef.set(ticketData);

    return res.status(200).json({
      message: "Ticket raised successfully",
      ticketData,
    });
  } catch (e) {
    console.error("Error in RaiseTicketController:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { RaiseTicketController };
