// functions/src/controllers/raiseTicketController.ts

import { Request, Response } from "express";
import admin from "../config/firebase"; // Adjust path if needed

const db = admin.firestore();

export const raiseticket = async (req: Request, res: Response): Promise<void> => {
  const email: string = req.params.email;
  const {
    ticketText,
    contributors,
     // Accept this but do not store unless needed
  }: {
    ticketText: string;
    contributors: { name: string; email: string }[];
    selectedTeacher?: any;
  } = req.body;

  try {
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

    const timestamp = new Date();
    const formattedTimestamp = timestamp.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const userTicketRef = db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .doc(email)
      .collection("Tickets")
      .doc();

    const uid = userTicketRef.id;

    const ticketData = {
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
      // If you later want to store selectedTeacher, you can uncomment this:
      // selectedTeacher: selectedTeacher || null,
    };

    await userTicketRef.set(ticketData);

    const schoolTicketRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .doc(uid);

    await schoolTicketRef.set(ticketData);

    res.status(200).json({
      message: "Ticket raised successfully",
      ticketData,
    });
  } catch (e) {
    console.error("Error in RaiseTicketController:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};
