import { Request, Response } from "express";
import admin from "../config/firebase";

const db = admin.firestore();

export const ticket = async (req: Request, res: Response): Promise<void> => {
  const email: string = req.params.email;

  try {
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userInfoSnap.exists) {
      res.status(404).json({ error: "User info not found in Firestore" });
      return;
    }

    const userData = userInfoSnap.data() as { school?: string };
    const school = userData?.school;

    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    const ticketsSnap = await db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .get();

    const tickets = ticketsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      message: "Tickets fetched successfully",
      ticketCount: tickets.length,
      tickets,
    });
  } catch (e: any) {
    console.error("Error in TicketController:", e.message || e);
    res.status(500).json({ error: "Internal server error" });
  }
};
