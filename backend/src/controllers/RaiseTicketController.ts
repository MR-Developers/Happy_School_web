import { Request, Response } from "express";
import admin from "../config/firebaseAdmin"; // Adjust path if needed

const db = admin.firestore();

export const RaiseTicketController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email: string = req.params.email;
  const {
    ticketText,
    teacher,
    contributors,
    category,
  }: {
    ticketText: string;
    teacher: string;
    contributors: { name: string; email: string }[];
    category: string;
  } = req.body;

  try {
    // Get user info
    const snapshot = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!snapshot.exists) {
      res.status(404).json({ error: "User info not found in Firestore" });
      return;
    }

    const userData = snapshot.data() as { school?: string; Name?: string };
    const school = userData.school;
    const userName = userData.Name;

    if (!school) {
      res.status(400).json({ error: "School not found for the user" });
      return;
    }

    // Format timestamp
    const timestamp = new Date();
    const formattedTimestamp = timestamp.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 1. Ticket under user path
    const userTicketRef = db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .doc(email)
      .collection("Tickets")
      .doc();

    const uid = userTicketRef.id;

    const ticketData: any = {
      ticketText: ticketText || "",
      userName: userName || "",
      email,
      timestamp: formattedTimestamp,
      reply: "",
      status: "Ticket Raised",
      tocken: 0,
      uid,
      school,
      contributors: contributors || [],
      category, // assuming you're sending this too
    };

    // Conditionally add 'teacher' only if category is 'Teacher'
    if (category === "Teacher") {
      ticketData.teacher = teacher || "";
    }

    // Save under user
    await userTicketRef.set(ticketData);

    // 2. Ticket under global "Tickets/{school}/{uid}"
    const schoolTicketRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .doc(uid);

    await schoolTicketRef.set(ticketData);
    const schoolTicketCountRef = await db
      .collection("Schools")
      .where("SchoolName", "==", school)
      .limit(1)
      .get();

    if (schoolTicketCountRef.empty) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    const doc = schoolTicketCountRef.docs[0];

    await db
      .collection("Schools")
      .doc(doc.id)
      .update({
        ticketsraised: admin.firestore.FieldValue.increment(1),
      });
    res.status(200).json({
      message: "Ticket raised successfully",
      ticketData,
    });
  } catch (e) {
    console.error("Error in RaiseTicketController:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};
