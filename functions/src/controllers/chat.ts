/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Request, Response, Router} from "express";
import {db} from "../config/firebase";


// eslint-disable-next-line new-cap
const router = Router();


router.get("/:ticketId", async (req: Request, res: Response): Promise<void> => {
  const {ticketId} = req.params;

  if (!ticketId) {
    res.status(400).json({error: "Ticket ID is required"});
    return;
  }

  try {
    const docRef = db.collection("Chats").doc(ticketId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({error: "Chat not found"});
      return;
    }

    const chatData = docSnap.data();

    res.status(200).json({
      message: "Chat fetched successfully",
      ticketId: docSnap.id,
      data: chatData,
    });
  } catch (error: any) {
    console.error("Error fetching chat:", error.message);
    res.status(500).json({error: "Failed to retrieve chat"});
  }
});

export default router;
