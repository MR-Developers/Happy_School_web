// functions/src/routes/ticketRoutes.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
// eslint-disable-next-line new-cap
import {Router, Request, Response} from "express";
import {db} from "../config/firebase";
// eslint-disable-next-line new-cap
const router = Router();

router.get("/all-tickets/:email", async (req: Request, res: Response) => {
  const email: string = req.params.email;
  const {teacher, status, fromDate, toDate, category} = req.query;

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
      res.status(404).json({error: "School not found"});
      return;
    }

    const ticketSubColRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school);

    // Add ordering by timestamp in descending order (newest first)
    const ticketsSnap = await ticketSubColRef
      .orderBy("timestamp", "desc")
      .get();

    let tickets = ticketsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply filters after fetching
    if (teacher) {
      tickets = tickets.filter(
        (t) =>
          (t as any).email?.toLowerCase() === String(teacher).toLowerCase()
      );
    }

    if (status) {
      tickets = tickets.filter(
        (t) =>
          (t as any).status?.toLowerCase() === String(status).toLowerCase()
      );
    }

    if (category) {
      tickets = tickets.filter(
        (t) =>
          (t as any).category?.toLowerCase() ===
          String(category).toLowerCase()
      );
    }

    if (fromDate || toDate) {
      tickets = tickets.filter((t) => {
        const ticketTimestamp = (t as any).timestamp;
        let time: number;

        // Handle Firestore Timestamp objects
        if (ticketTimestamp && typeof ticketTimestamp === "object" && ticketTimestamp._seconds) {
          time = ticketTimestamp._seconds * 1000;
        } else if (ticketTimestamp) {
          time = new Date(ticketTimestamp).getTime();
        } else {
          return false; // Skip tickets without timestamp
        }

        const from = fromDate ?
          new Date(String(fromDate)).getTime() :
          -Infinity;
        const to = toDate ?
          new Date(String(toDate)).setHours(23, 59, 59, 999) : // End of day for toDate
          Infinity;

        return time >= from && time <= to;
      });
    }

    res.status(200).json({
      message: "Tickets fetched successfully",
      ticketCount: tickets.length,
      tickets,
    });
  } catch (e: any) {
    console.error("Error in TicketController:", e.message || e);

    // If the error is due to missing index, provide helpful information
    if (e.code === 9 || e.message?.includes("index")) {
      console.error("Firestore index required for timestamp ordering. Create a composite index for the collection with timestamp field.");
      res.status(500).json({
        error: "Database index required for sorting. Please contact administrator.",
        details: "Firestore composite index needed for timestamp ordering",
      });
      return;
    }

    res.status(500).json({error: "Internal server error"});
  }
});

// Add a route to get a single ticket by ID (useful for the ShowTicket component)


export default router;
