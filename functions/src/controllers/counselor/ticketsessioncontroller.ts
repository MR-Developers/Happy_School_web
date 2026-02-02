/* eslint-disable max-len */
import {Request, Response} from "express";
import admin from "../../config/firebase";

const db = admin.firestore();

export const updateTicketSessionCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {school, ticketId, action} = req.body;

    if (!school || !ticketId || !action) {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    if (action !== "increment" && action !== "decrement") {
      res.status(400).json({error: "Invalid action"});
      return;
    }

    const ticketRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .doc(ticketId);

    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      res.status(404).json({error: "Ticket not found"});
      return;
    }

    const currentSessions = ticketDoc.data()?.oneononesessions || 0;

    // Prevent decrement below 0
    if (action === "decrement" && currentSessions <= 0) {
      res.status(400).json({error: "Cannot decrement below 0"});
      return;
    }

    const incrementValue = action === "increment" ? 1 : -1;

    await ticketRef.update({
      oneononesessions: admin.firestore.FieldValue.increment(incrementValue),
    });

    const updatedDoc = await ticketRef.get(); // Fetch updated data to return

    res.status(200).json({
      message: "Session count updated successfully",
      oneononesessions: updatedDoc.data()?.oneononesessions,
    });
  } catch (error) {
    console.error("Error updating session count:", error);
    res.status(500).json({error: "Internal server error"});
  }
};

export const getTicketDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {school, ticketId} = req.query;

    if (!ticketId) {
      res.status(400).json({error: "Missing ticketId"});
      return;
    }

    let ticketDocOverride = null;
    let foundSchool = school;

    // If school provided, try direct lookup
    if (school) {
      const ticketRef = db
        .collection("Tickets")
        .doc(String(school))
        .collection(String(school))
        .doc(String(ticketId));

      const ticketDoc = await ticketRef.get();
      if (ticketDoc.exists) {
        ticketDocOverride = ticketDoc;
      }
    } else {
      // If no school, scan all schools (fallback)
      // Note: This can be expensive if there are many schools.
      // Ideally should have a global index or mapping.
      const schoolsSnap = await db.collection("Tickets").get();
      // Use Promise.all to check concurrently
      const checks = schoolsSnap.docs.map(async (schoolDoc) => {
        const sName = schoolDoc.id;
        const snap = await db.collection("Tickets").doc(sName).collection(sName).doc(String(ticketId)).get();
        if (snap.exists) return {snap, sName};
        return null;
      });

      const results = await Promise.all(checks);
      const found = results.find((r) => r !== null);

      if (found) {
        ticketDocOverride = found.snap;
        foundSchool = found.sName;
      }
    }

    if (!ticketDocOverride || !ticketDocOverride.exists) {
      res.status(404).json({error: "Ticket not found"});
      return;
    }

    res.status(200).json({
      message: "Ticket fetched successfully",
      ticket: {id: ticketDocOverride.id, school: foundSchool, ...ticketDocOverride.data()},
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({error: "Internal server error"});
  }
};
