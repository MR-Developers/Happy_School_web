/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Request, Response} from "express";
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
      res.status(404).json({error: "User info not found in Firestore"});
      return;
    }

    const userData = userInfoSnap.data() as { school?: string };
    const school = userData?.school;

    if (!school) {
      console.error("School not found");
      res.status(404).json({error: "School not found"});
      return;
    }

    // 2) Access the Tickets/<school>/... subcollection
    const ticketSubColRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school);

    const ticketsSnap = await ticketSubColRef
      .orderBy("timestamp", "desc")
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
    res.status(500).json({error: "Internal server error"});
  }
};
